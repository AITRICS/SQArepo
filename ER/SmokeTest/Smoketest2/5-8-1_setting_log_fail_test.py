import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
from exceptions import ElementNotFoundError, TimeoutError
from log_failure import log_to_file
import os
import json
import os


version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script5"
os.makedirs(version_dir, exist_ok=True)

SCRIPT_NAME = "5-8-1_setting_log_fail_test.py"


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

#admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

#알람설정 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(1)
        await page.get_by_text("접속기록 실패 조회").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_8_1_1_Setting_접속기록 실패 조회_진입.png"),full_page=True)


#페이지 이동 클릭
        await page.click('xpath=/html/body/div[2]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/div/nav/ul/div[2]/li[1]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_8_1_2(1)_페이지 이동클릭.png"),full_page=True)
        
#마지막 페이지 이동 클릭
        await page.click('xpath=/html/body/div[2]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/div/nav/ul/div[2]/li[2]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_8_1_2(2)_마지막페이지_이동클릭.png"),full_page=True)

#페이지 이동 클릭
        await page.click('xpath=/html/body/div[2]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/div/nav/ul/div[1]/li[2]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_8_1_2(4)_이전페이지 이동클릭.png"),full_page=True)

#첫 페이지 이동 클릭
        await page.click('xpath=/html/body/div[2]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/div/nav/ul/div[1]/li[1]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_8_1_2(4)_첫페이지_이동클릭.png"),full_page=True)

#2페이지 입력
        await page.click('xpath=/html/body/div[2]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/div[2]/form/div[1]/div/input')
        await asyncio.sleep(1)
        await page.fill('input.w-\\[240px\\]', '2')
        await page.screenshot(path=os.path.join(version_dir, "5_8_1_2(5)_2 페이지 입력.png"),full_page=True)


#2페이지 이동
        await page.get_by_text("이동").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_8_1_2(6)_2 페이지 이동.png"),full_page=True)


        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행