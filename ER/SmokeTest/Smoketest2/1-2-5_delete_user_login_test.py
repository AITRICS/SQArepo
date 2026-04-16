import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
import log_failure
from playwright.async_api import TimeoutError as PlaywrightTimeoutError, Error as PlaywrightError
import os

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script1"
os.makedirs(version_dir, exist_ok=True)


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

#삭제한 계정으로 로그인
        await page.locator("input[name=\"username\"]").click()
        await page.locator("input[name=\"username\"]").fill(config.DELETE_USER_ID)
        await asyncio.sleep(1)
        await page.locator("input[name=\"password\"]").click()
        await page.locator("input[name=\"password\"]").fill(config.DELETE_USER_PW)
        await asyncio.sleep(1)
        try:
                
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/form/div[3]/button/div[1]')
                await page.locator('[data-testid="login-button"]').click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "1_2_5_1_삭제계정_로그인불가.png"),full_page=True)
                print("TC_1_2_5_1_삭제계정_로그인불가 :PASS")

        except PlaywrightTimeoutError as e:
                await log_failure(page, "이름입력_TimeoutError", e)
                raise
        except PlaywrightError as e:
                await log_failure(page, "이름입력_PlaywrightError", e)
                raise
        except Exception as e:
                await log_failure(page, "이름입력_기타오류", e)
                raise
  
        await asyncio.sleep(1)


        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행