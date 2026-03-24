

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

SCRIPT_NAME = "3-5-1_patient_detail_inital_assessment_test.py"

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
        await asyncio.sleep(1)
        await page.locator("input[name=\"password\"]").click()
        await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
        await asyncio.sleep(1)
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
            await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/tbody/tr[1]/td[3]')
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state('domcontentloaded')
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "3_5_1_1(1)_상세진입.png"),full_page=True)
        print("TC_3_5_1_1(1)_상세_진입 :PASS")

    #문진정보선택
        await new_tab.locator('[data-testid="chief-complaint-trigger"]').click()
        # await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[1]/div[2]/div[9]/div/div[1]/div[2]/button/div[2]')
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_5_1_1(2)_자세히보기.png"),full_page=True)        
        print("TC_3_5_1_1(2)_문진정보_자세히보기 :PASS")

    #닫기 클릭
        await new_tab.locator('[data-testid="chief-complaint-trigger"]').click()
        #await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[2]/div/div/div[1]/div/button')
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_5_1_2_닫기클릭.png"),full_page=True)            
        print("TC_3_5_1_2_닫기_클릭 :PASS")

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행













