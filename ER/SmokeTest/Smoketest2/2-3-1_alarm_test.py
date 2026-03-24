
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
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script2"
os.makedirs(version_dir, exist_ok=True)

SCRIPT_NAME = "2-3-1_alarm_test.py"

async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})


    
    # #생성된 계정으로 로그인
    #     base_dir = os.path.dirname(os.path.abspath(__file__))
    #     file_path = os.path.join(base_dir, "generated_id.json")
    #     with open(file_path, "r", encoding="utf-8") as f:
    #             data = json.load(f)

    #     random_regi_id = data["random_regi_id"]

    #     await page.locator("input[name=\"username\"]").click()
    #     await page.locator("input[name=\"username\"]").fill(random_regi_id)
    #     await asyncio.sleep(2)
    #     await page.locator("input[name=\"password\"]").click()
    #     await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
    #     await asyncio.sleep(2)
    #     await page.click('xpath=/html/body/div[2]/div/div[2]/div[1]/form/div[3]/button')


    # #중복 로그인 예외처리
    
    #     try:
    #         await page.wait_for_selector("//h2[text()='중복 로그인 안내']", timeout=3000)
    #         await asyncio.sleep(2)
    #         await page.click("xpath=//*[@id='radix-«R1p7nedb»']/div[2]/div[2]/button/div[2]")



    #         await page.wait_for_load_state('networkidle')
    #         await asyncio.sleep(2)
    #         await page.screenshot(path=os.path.join(version_dir, "2_3_1(1)_승인계정_로그인.png"),full_page=True)
    #         print("[중복 로그인] 허용 버튼 클릭 완료")

    #     except:
    #         print("[중복 로그인] 알림 없음, 정상 로그인 중")
    #         await asyncio.sleep(2)
    #         await page.wait_for_load_state('networkidle')
    #         await page.screenshot(path=os.path.join(version_dir, "2_3_1(1)_승인계정_로그인.png"),full_page=True)

    #     await asyncio.sleep(2)

    #Admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

    #알람 있는 데이터 클릭
        alarm_cells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="on"]')

        count = await alarm_cells.count()
        for i in range(count):
            alarm = alarm_cells.nth(i)
            await alarm.scroll_into_view_if_needed()
            alarm_count = await alarm.get_attribute("data-alarm-count")

            if alarm_count in {"1", "2", "3", "4", "5", "6", "7","8"}:
                await alarm.click()
                break

        await page.screenshot(path=os.path.join(version_dir, "2_3_3_1(1)_알람벳지_선택.png"),full_page=True)
        print("TC_2_3_3_1(1)_알람벳지_선택 :PASS")

    #상세 페이지 보기
        async with context.expect_page() as new_page_info:
            await page.get_by_text("환자 상세페이지 보기").click()
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state('domcontentloaded')
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "2_3_3_1(2)_상세_진입.png"),full_page=True)
        print("TC_2_3_3_1(2)_상세_진입 :PASS")
        
        await asyncio.sleep(1)
        await new_tab.close()
        await page.bring_to_front()
        await asyncio.sleep(1)

    
    #알람 있는 데이터 클릭
        alarm_cells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="on"]')

        count = await alarm_cells.count()
        for i in range(count):
            alarm = alarm_cells.nth(i)
            await alarm.scroll_into_view_if_needed()
            alarm_count = await alarm.get_attribute("data-alarm-count")

            if alarm_count in {"1", "2", "3", "4", "5", "6", "7", "8"}:
                await alarm.click()
                break
        
    #읽음으로 표시
        await page.get_by_text("읽음으로 표시").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_2_1(2)_읽음으로 표시_선택.png"),full_page=True)
        print("TC_2_3_2_1(2)_읽음으로 표시_선택 :PASS")


    #알람 있는 데이터 클릭
        max_scroll_attempts = 10

        alarm_cells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="on"]')
        for _ in range(max_scroll_attempts):
            # 알람 셀 모두 찾기
            alarm_cells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="on"]')
            count = await alarm_cells.count()

            for i in range(count):
                alarm = alarm_cells.nth(i)
                await alarm.scroll_into_view_if_needed()
                alarm_count = await alarm.get_attribute("data-alarm-count")

                if alarm_count in {"1", "2", "3", "4", "5", "6", "7", "8"}:
                    await alarm.scroll_into_view_if_needed()
                    await alarm.click()
                    found_and_clicked = True
                    break  # 내부 루프 종료

            if found_and_clicked:
                break  # 외부 루프 종료


# 'Alarm off' 버튼 클릭
        await page.get_by_text("Alarm off").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_1_1(2)_alarm off.png"),full_page=True)
        print("TC_2_3_1_1(2)_alarm off :PASS")

    #Alarm off 닫기
        close_button = page.get_by_role("button", name="Close")
        await close_button.click()
        
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_1(7)_alarm off_팝업_닫기.png"),full_page=True)
        print("TC_2_3_1(7)_alarm off_팝업_닫기 :PASS")

    #알람 있는 데이터 클릭
        max_scroll_attempts = 10
        alarm_cells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="on"]')
        for _ in range(max_scroll_attempts):
            # 알람 셀 모두 찾기
            alarm_cells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="on"]')
            count = await alarm_cells.count()

            for i in range(count):
                alarm = alarm_cells.nth(i)
                await alarm.scroll_into_view_if_needed()
                alarm_count = await alarm.get_attribute("data-alarm-count")

                if alarm_count in {"1", "2", "3", "4", "5", "6", "7", "8"}:
                    await alarm.scroll_into_view_if_needed()
                    await alarm.click()
                    found_and_clicked = True
                    break  # 내부 루프 종료

            if found_and_clicked:
                break  # 외부 루프 종료

    #Alarm off 취소
        await page.get_by_text("Alarm off").click()
        await asyncio.sleep(1)
        await page.get_by_text("취소").click()
        await page.screenshot(path=os.path.join(version_dir, "2_3_1_1(3)_alarm off_취소.png"),full_page=True)
        print("TC_2_3_1_1(3)_alarm off_취소 :PASS")

        
    #알람 있는 데이터 클릭
        alarm_cells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="on"]')

        count = await alarm_cells.count()
        for i in range(count):
            alarm = alarm_cells.nth(i)
            await alarm.scroll_into_view_if_needed()
            alarm_count = await alarm.get_attribute("data-alarm-count")

            if alarm_count in {"1", "2", "3", "4", "5", "6", "7", "8"}:
                await alarm.scroll_into_view_if_needed()
                await alarm.click()
                break
        

    #'Alarm off' 버튼 클릭
        await page.get_by_text("Alarm off").click()
        await asyncio.sleep(1)

    #Alarm off 10분
        await page.click('xpath=//*[@id="alarm-off-10"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_1_2(1)_alarm off_10분동안_선택.png"),full_page=True)
        print("TC_2_3_1_2(1)_alarm off_10분동안_선택 :PASS")

    #Alarm off 30분
        await page.click('xpath=//*[@id="alarm-off-30"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_1_2(2)_alarm off_30분동안_선택.png"),full_page=True)
        print("TC_2_3_1_2(2)_alarm off_30분동안_선택 :PASS")

    #Alarm off 60분
        await page.click('xpath=//*[@id="alarm-off-60"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_1_2(3)_alarm off_60분동안_선택.png"),full_page=True)
        print("TC_2_3_1_2(3)_alarm off_60분동안_선택 :PASS")

    #Alarm off 직접입력
        await page.click('xpath=//*[@id="alarm-off-custom"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_1_3(1)_alarm off_직접입력_선택.png"),full_page=True)
        print("TC_2_3_1_3(1)_alarm off_직접입력_선택 :PASS")

    #직접입력_시간
        await page.locator("input[name=\"manual-hours\"]").fill("1")
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_1_3(2)_alarm off_직접입력_1시간.png"),full_page=True)
        print("TC_2_3_1_3(2)_alarm off_직접입력_1시간 :PASS")
        
    #직접입력_분
        await page.click('xpath=//*[@id="manual-minutes"]')
        await page.locator("input[name=\"manual-minutes\"]").fill("10")
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_1_3(3)_alarm off_직접입력_10분.png"),full_page=True)
        print("TC_3_1_3(3)_alarm off_직접입력_10분 :PASS")

    #저장 클릭
        await page.locator('//div[text()="저장"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_3_1_4_저장클릭.png"),full_page=True) 
        print("TC_2_3_1_4_저장_클릭 :PASS")

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행