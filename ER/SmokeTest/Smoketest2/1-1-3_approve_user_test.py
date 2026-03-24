import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login

import json
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

#admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

#setting 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_3_1_Setting_진입.png"),full_page=True)
        print("TC_1_1_3_1_Setting_진입 :PASS")

#계정관리 진입
        await page.get_by_text("계정 관리").click()
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(2000)

        
#생성된 계정 클릭
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "generated_id.json")
        with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

        random_regi_id = data["random_regi_id"]
        await page.click(f"text={random_regi_id}")
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_3_2_생성된 환자 선택.png"),full_page=True)
        print("TC_1_1_3_2_생성된 환자 선택 :PASS")


#계정 승인 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[3]/div[1]/div[2]/div/button')
        
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_3_3_계정승인.png"),full_page=True)
        print("TC_1_1_3_3_계정승인 :PASS")

        await asyncio.sleep(1)

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행