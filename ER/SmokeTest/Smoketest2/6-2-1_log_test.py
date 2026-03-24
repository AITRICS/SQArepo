import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
from pre_setting import admin_page_login
from exceptions import ElementNotFoundError, TimeoutError
from log_failure import log_to_file
import os
import json
import os

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script6"
os.makedirs(version_dir, exist_ok=True)

SCRIPT_NAME = "6-2-1_log_test.py"


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.ADMIN_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

#admin 로그인
        await admin_page_login(page, config.ADMIN_PAGE_ID, config.ADMIN_PAGE_PASSWORD)

#접속기록조회 진입
        await asyncio.sleep(1)
        await page.get_by_text("접속기록조회").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "6_2_1_1_접속기록조회_진입.png"),full_page=True)
        print("TC_6_2_1_1_admin페이지_접속기록조회_진입 :PASS")


#페이지 이동 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div/nav/button[3]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "6_2_1_2(1)_페이지 이동클릭.png"),full_page=True)
        print("TC_6_2_1_2(1)_페이지_이동_클릭 :PASS")

#마지막 페이지 이동 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div/nav/button[4]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "6_2_1_2(2)_마지막페이지_이동클릭.png"),full_page=True)
        print("TC_6_2_1_2(2)_마지막페이지_이동_클릭 :PASS")

#페이지 이동 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div/nav/button[2]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "6_2_1_2(3)_이전페이지 이동클릭.png"),full_page=True)
        print("TC_6_2_1_2(3)_이전페이지_이동_클릭 :PASS")

#첫 페이지 이동 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div/nav/button[1]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "6_2_1_2(4)_첫페이지_이동클릭.png"),full_page=True)
        print("TC_6_2_1_2(4)_첫페이지_이동_클릭 :PASS")

        await page.click('xpath=/html/body/div[3]/div[2]/div/div/form/div[1]/div/input')
        await asyncio.sleep(1)
        await page.fill('input.w-\\[50px\\]', '2')
        await page.screenshot(path=os.path.join(version_dir, "6_2_1_2(5)_2 페이지 입력.png"),full_page=True)
        print("TC_6_2_1_2(5)_2 페이지_입력 :PASS")

        await page.click('xpath=/html/body/div[3]/div[2]/div/div/form/div[2]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "6_2_1_2(6)_2 페이지_이동클릭.png"),full_page=True)
        print("TC_6_2_1_2(6)_2 페이지_이동_클릭 :PASS")

#로그아웃
        try:
                await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[2]/button/div[2]')
                await asyncio.sleep(1)  
                await page.screenshot(path=os.path.join(version_dir, "6_2_2_1_로그아웃진입.png"),full_page=True)
                print("TC_6_2_2_1_로그아웃_진입 :PASS")

                await page.get_by_text("아니오").click()
                await asyncio.sleep(1)  
                await page.screenshot(path=os.path.join(version_dir, "6_2_2_2(1)_로그아웃_아니오_클릭.png"),full_page=True)
                print("TC_6_2_2_2(1)_로그아웃_아니오_클릭 :PASS")
                
                await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[2]/button/div[2]')
                await asyncio.sleep(1)  
                await page.get_by_text("예").click()
                await asyncio.sleep(1)  
                await page.screenshot(path=os.path.join(version_dir, "6_2_2_2(2)_로그아웃_예_클릭.png"),full_page=True)
                print("TC_6_2_2_2(2)_로그아웃_예_클릭 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 로그아웃 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("로그아웃 클릭 중 오류 발생") from e
        await asyncio.sleep(1)



        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행