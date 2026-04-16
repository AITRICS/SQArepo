
import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
import json
import os
from exceptions import ElementNotFoundError, TimeoutError
from log_failure import log_to_file
from pre_setting import login
version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script3"
os.makedirs(version_dir, exist_ok=True)

SCRIPT_NAME = "3-3-1_patient_detail_observe_test.py"

async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

    #생성된 계정으로 로그인
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "generated_id.json")
        with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

        random_regi_id = data["random_regi_id"]

        await page.locator("input[name=\"username\"]").click()
        await page.locator("input[name=\"username\"]").fill(random_regi_id)
        await asyncio.sleep(2)
        await page.locator("input[name=\"password\"]").click()
        await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
        await asyncio.sleep(2)
        await page.locator('[data-testid="login-button"]').nth(0).click()


    #중복 로그인 예외처리
    
        try:
            await page.wait_for_selector("//h2[text()='중복 로그인 안내']", timeout=3000)
            await asyncio.sleep(2)
            await page.get_by_text("예").click()



            await page.wait_for_load_state('networkidle')
            await asyncio.sleep(2)

        except:
            pass
            await asyncio.sleep(2)
            await page.wait_for_load_state('networkidle')


        await asyncio.sleep(2)


    #상세 진입
        async with context.expect_page() as new_page_info:
            await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/tbody/tr[6]/td[3]')
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state('domcontentloaded')
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "3_3_1_1(1)_상세진입.png"),full_page=True)
        print("TC_3_3_1_1(1)_상세_진입 :PASS")

    #관찰설정
        try:
                #await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[1]/div[2]/div[1]/div[1]/div/button[2]')
                await new_tab.locator('[data-testid="observing-toggle-chip"]').nth(0).click()
                await asyncio.sleep(1)
                await new_tab.screenshot(path=os.path.join(version_dir, "3_3_1_1(2)_관찰설정클릭.png"),full_page=True) 
                print("TC_3_3_1_1(2)_관찰설정_클릭 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 관찰설정 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("관찰설정 버튼 클릭 중 오류 발생") from e
        
    #관찰설정 해제
        # await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[1]/div[2]/div[1]/div[1]/div/button[2]')
        await new_tab.locator('[data-testid="observing-toggle-chip"]').nth(0).click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_3_1_1(3)_관찰설정해제.png"),full_page=True)    
        print("TC_3_3_1_1(3)_관찰설정_해제 :PASS")


async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행