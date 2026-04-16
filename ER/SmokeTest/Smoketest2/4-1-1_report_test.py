
import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
import json
import os, re, time
from exceptions import ElementNotFoundError, TimeoutError
from log_failure import log_to_file
from pre_setting import login
version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script4"
os.makedirs(version_dir, exist_ok=True)

SCRIPT_NAME = "4-1-1_report_test.py"

async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

    #Admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)
    
    #Report 진입
        await page.get_by_role("tab", name="Report").click()
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_1_Report진입.png"),full_page=True)
        print("TC_4_1_1_1_Report_진입 :PASS")

    #시작일 캘린더선택
        await page.locator('[data-testid="date-picker-trigger"]').nth(0).click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(1)_시작일캘린더.png"),full_page=True)
        print("TC_4_1_1_2(1)_시작일캘린더_선택 :PASS")

    #년선택
        await page.select_option('select.rdp-years_dropdown', value='2025')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(2)_2025선택.png"),full_page=True)
        print("TC_4_1_1_2(2)_2025_선택 :PASS")

        await page.select_option('select.rdp-months_dropdown', value='5')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(3)_6월선택.png"),full_page=True)
        await asyncio.sleep(1)
        print("TC_4_1_1_2(3)_6월_선택 :PASS")

    #시작일 캘린더 다음달 선택
        await page.get_by_role("button", name="Go to the Next Month").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(4)_캘린터_다음달_버튼클릭.png"),full_page=True)
        print("TC_4_1_1_2(4)_캘린터_다음달_버튼_클릭 :PASS")

    #시작일 캘린더 이전달 선택
        await page.get_by_role("button", name="Go to the Previous Month").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(5)_캘린더_이전달_클릭.png"),full_page=True)
        print("TC_4_1_1_2(5)_캘린더_이전달_클릭 :PASS")

    #시작일 캘린더 날짜 선택
        await page.click('td[data-day="2025-06-01"] button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(6)_6월1일선택.png"),full_page=True)
        print("TC_4_1_1_2(6)_6월1일_선택 :PASS")


    #종료일 캘린더선택
        await page.locator('[data-testid="date-picker-trigger"]').nth(1).click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(7)_종료일캘린더.png"),full_page=True)
        print("TC_4_1_1_2(7)_종료일캘린더_선택 :PASS")

    #년선택
        await page.select_option('select.rdp-years_dropdown', value='2025')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(8)_2025선택.png"),full_page=True)
        print("TC_4_1_1_2(8)_2025_선택 :PASS")

        await page.select_option('select.rdp-months_dropdown', value='6')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(9)_7월선택.png"),full_page=True)
        await asyncio.sleep(1)
        print("TC_4_1_1_2(9)_7월_선택 :PASS")

    #종료일 캘린더 다음달 선택
        await page.get_by_role("button", name="Go to the Next Month").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(10)_캘린터_다음달_버튼클릭.png"),full_page=True)
        print("TC_4_1_1_2(10)_캘린터_다음달_버튼_클릭 :PASS")

    #종료일 캘린더 이전달 선택
        await page.get_by_role("button", name="Go to the Previous Month").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(11)_캘린더_이전달_클릭.png"),full_page=True)
        print("TC_4_1_1_2(11)_캘린더_이전달_클릭 :PASS")

        await page.click('td[data-day="2025-07-01"] button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_2(12)_7월1일선택.png"),full_page=True)
        print("TC_4_1_1_2(12)_7월1일_선택 :PASS")

    #초기화 선택
        await page.get_by_text("초기화").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_3_초기화.png"),full_page=True)
        print("TC_4_1_1_3_초기화 :PASS")

    #시작일 캘린더선택
        await page.locator('[data-testid="date-picker-trigger"]').nth(0).click()
        await asyncio.sleep(1)      

        await page.select_option('select.rdp-years_dropdown', value='2025')

        await page.select_option('select.rdp-months_dropdown', value='9')

        await page.click('td[data-day="2025-10-01"] button')
        await asyncio.sleep(1)

    #종료일 캘린더선택
        await page.locator('[data-testid="date-picker-trigger"]').nth(1).click()
        await asyncio.sleep(1)

    #년선택
        await page.select_option('select.rdp-years_dropdown', value='2025')
        await page.select_option('select.rdp-months_dropdown', value='9')
        await page.click('td[data-day="2025-10-31"] button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_4_날짜재선택.png"),full_page=True)
        print("TC_4_1_1_4_날짜_재선택 :PASS")

    #파일 생성 선택
        await page.locator('[data-testid="file-create-button"]').nth(0).click()
        await asyncio.sleep(20)
        await page.screenshot(path=os.path.join(version_dir, "4_1_1_5_파일생성.png"),full_page=True)
        print("TC_4_1_1_5_파일_생성 :PASS")


    #다운로드
        await page.locator('[data-testid="download-button"]').nth(0).click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_2_1_다운로드.png"),full_page=True)
        print("TC_4_1_2_1_다운로드_클릭 :PASS")
        
    #다운로드 x 버튼
        await page.locator("button:has-text('Close')").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_2_2(1)_다운로드_x버튼.png"),full_page=True)
        print("TC_4_1_2_2(1)_다운로드_x버튼_클릭 :PASS")

    #다운로드
        await page.locator('[data-testid="download-button"]').nth(0).click()
        await asyncio.sleep(1)
    
    #다운로드 취소 버튼
        await page.locator('[data-testid="download-cancel-button"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_2_2(2)_다운로드취소.png"),full_page=True)
        print("TC_4_1_2_2(2)_다운로드취소_클릭 :PASS")
        
    #사유 입력
        await page.locator('[data-testid="download-button"]').nth(0).click()
        await asyncio.sleep(1)
        await page.locator('input[name="reason"]').click()
        await page.locator('input[name="reason"]').fill('smoketest')
        await page.screenshot(path=os.path.join(version_dir, "4_1_2_3_다운로드_시유입력.png"),full_page=True)
        print("TC_4_1_2_3_다운로드_시유_입력 :PASS")

    #다운로드 진행
        await page.locator("button:has-text('다운로드')").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "4_1_2_4_다운로드_완료.png"),full_page=True)
        print("TC_4_1_2_4_다운로드_완료 :PASS")

    #전체 선택
        await page.locator('[data-testid="select-all-checkbox"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_3_1(1)_전체선택.png"),full_page=True)
        print("TC_4_1_3_1(1)_전체_선택 :PASS")

    #전체 선택해제
        await page.locator('[data-testid="select-all-checkbox"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_3_1(2)_전체선택해제.png"),full_page=True)
        print("TC_4_1_3_1(2)_전체선택_해제 :PASS")

    #파일 선택
        await page.locator('[data-testid="select-checkbox"]').nth(0).click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_3_2(1)_파일선택.png"),full_page=True)
        print("TC_4_1_3_2(1)_파일_선택 :PASS")

    #파일 선택해제
        await page.locator('[data-testid="select-checkbox"]').nth(0).click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_3_2(2)_파일선택해제.png"),full_page=True)
        print("TC_4_1_3_2(2)_파일선택_해제 :PASS")

    #생성내역 삭제
        await page.locator('[data-testid="select-checkbox"]').nth(0).click()
        await asyncio.sleep(1)
        await page.get_by_role("button", name="생성 내역 삭제").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "4_1_3_3_생성내역삭제.png"),full_page=True)
        print("TC_4_1_3_3_생성내역_삭제 :PASS")

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행