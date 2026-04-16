import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
from exceptions import ElementNotFoundError, TimeoutError
from log_failure import log_to_file
import os
from pre_setting import create_user

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script1"
os.makedirs(version_dir, exist_ok=True)


SCRIPT_NAME = "1-2-4_delete_user_test.py"

async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

#테스트용 계정 생성
        await create_user(page,"smoketest2")
        print("계정 생성완료")

#Admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

#Setting 클릭
        await page.get_by_text("Settings").click()
        await asyncio.sleep(1)
#계정 관리 클릭
        await page.get_by_text("계정 관리").click()
        await asyncio.sleep(1)
        
#계정 선택
        try:
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        except Exception as e:
                log_to_file(f"페이지 스크롤 오류: {e}", script_name=SCRIPT_NAME)
                raise Exception("페이지 스크롤 중 오류 발생") from e
        await asyncio.sleep(1)

        try:
                await page.click("text=smoketest2")
                
        except Exception:
                log_to_file(f"[오류] 요소 클릭 실패 : delete계정 선택 실패 ", script_name=SCRIPT_NAME)
                raise ElementNotFoundError("delete계정 선택 실패")
                
#계정 삭제 클릭
        try:
                await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[1]/div[1]/button/div[2]')
        except Exception as e:
                log_to_file(
                        f"[오류] 계정 삭제 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("계정 삭제 클릭 중 오류 발생") from e
        
        await page.screenshot(path=os.path.join(version_dir, "1_2_4_1(1)_계정삭제.png"),full_page=True)
        await asyncio.sleep(1)
        print("TC_1_2_4_1(1)_계정삭제 :PASS")

#계정 삭제 취소 클릭
        await page.locator('//div[text()="취소"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_2_4_1(2)_계정삭제취소.png"),full_page=True)
        print("TC_1_2_4_1(2)_계정삭제_취소 :PASS")

#계정 삭제 X 버튼 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[1]/div[1]/button/div[2]')
        await page.locator('[data-testid="dialog-close-button"]').click()
        # await asyncio.sleep(1)
        # await page.locator("button:has-text('Close')").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_2_4_1(3)_계정삭제x버튼.png"),full_page=True)
        print("TC_1_2_4_1(3)_계정삭제_x버튼_클릭 :PASS")

#계정 삭제 진행
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[1]/div[1]/button/div[2]')
        await asyncio.sleep(1)
        await page.locator('//div[text()="삭제"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_2_4_2(4)_계정삭제완료.png"),full_page=True)
        print("TC_1_2_4_2(4)_계정삭제_완료 :PASS")

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행