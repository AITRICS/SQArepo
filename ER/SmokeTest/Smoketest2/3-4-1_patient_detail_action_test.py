
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

SCRIPT_NAME = "3-4-1_patient_detail_action_test.py"

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
    #     await asyncio.sleep(1)
    #     await page.locator("input[name=\"password\"]").click()
    #     await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
    #     await asyncio.sleep(1)
    #     await page.click('xpath=/html/body/div[2]/div[2]/div/div[1]/form/div[3]/button')


    # #중복 로그인 예외처리
    
    #     try:
    #         await page.wait_for_selector("//h2[text()='중복 로그인 안내']", timeout=3000)
    #         await asyncio.sleep(2)
    #         await page.click("xpath=//*[@id='radix-«R1p7nedb»']/div[2]/div[2]/button/div[2]")



    #         await page.wait_for_load_state('networkidle')
    #         await asyncio.sleep(2)
    #         print("[중복 로그인] 허용 버튼 클릭 완료")

    #     except:
    #         print("[중복 로그인] 알림 없음, 정상 로그인 중")
    #         await asyncio.sleep(2)
    #         await page.wait_for_load_state('networkidle')

    #Admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

    #상세 진입
        async with context.expect_page() as new_page_info:
            await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/tbody/tr[1]/td[4]/span')
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state('domcontentloaded')
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_1(1)_상세진입.png"),full_page=True)
        print("TC_3_4_1_1(1)_상세_진입 :PASS")

    #처치진입
        await new_tab.locator('[data-testid="action-drawer-trigger"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_1(2)_처치_진입.png"),full_page=True)        
        print("TC_3_4_1_1(2)_처치_진입 :PASS")

    #닫기 클릭
        await new_tab.locator('[data-testid="action-drawer-button"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_2_처치_닫기.png"),full_page=True)    
        await new_tab.locator('[data-testid="action-drawer-trigger"]').click()
        print("TC_3_4_1_2_처치_닫기 :PASS")
        await asyncio.sleep(1)

    #켈린더 선택
        await new_tab.locator('[data-testid="date-picker-trigger"]').click()
        await asyncio.sleep(1)
        # await new_tab.click('xpath=//*[starts-with(@id, "radix-")]/div/div/div/div/div/span[2]/select')
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_3(1)_날짜_클릭.png"),full_page=True)
        print("TC_3_4_1_3(1)_날짜_클릭 :PASS")

    #년선택
        today = datetime.today()
        year_value = str(today.year)
        await new_tab.select_option('select.rdp-years_dropdown', value=year_value)
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, f"3_4_1_3(2)_{year_value}년_선택.png"),full_page=True)
        print(f"TC_3_4_1_3(2)_{year_value}년_선택 :PASS")

        month_value = str(today.month - 1) 
        await new_tab.select_option('select.rdp-months_dropdown', value=month_value)
        await asyncio.sleep(1)
        screenshot_month_value=str(today.month)
        await new_tab.screenshot(path=os.path.join(version_dir, f"3_4_1_3(3)_{screenshot_month_value}월_선택.png"),full_page=True)
        print(f"TC_3_4_1_3(3)_{screenshot_month_value}월_선택 :PASS")

        today_str = datetime.today().strftime("%Y-%m-%d")
        selector = f'td[data-day="{today_str}"] button'
        await new_tab.click(selector)
        await asyncio.sleep(1)
        today = datetime.today()
        formatted_day = today.strftime("%m월%d일").lstrip("0").replace(" 0", " ")
        await new_tab.screenshot(path=os.path.join(version_dir,  f"3_4_1_3(4)_{formatted_day}선택.png"),full_page=True)
        print(f"TC_3_4_1_3(4)_{formatted_day}선택 :PASS")

        # await new_tab.click('xpath=//*[@id="action-form"]/div[1]/div[2]/div[1]/div')
        # await new_tab.click('xpath=//*[starts-with(@id, "radix-")]/div/div/div/div/div/span[2]/select')
        # today_str = datetime.today().strftime("%Y-%m-%d")
        # selector = f'td[data-day="{today_str}"] button'
        # await new_tab.click(selector)
        # await asyncio.sleep(1)

    #시입력
        current_hour = datetime.now().hour
        await new_tab.locator('input[data-testid="manual-hours-input"]').fill(str(current_hour))
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, f"3_4_1_3(5)_{current_hour}시_선택.png"),full_page=True)
        print(f"TC_3_4_1_3(5)_{current_hour}시_선택 :PASS")

    #분입력
        now = datetime.now()
        current_minute = str(now.minute).zfill(2)
        await new_tab.locator('input[data-testid="manual-minutes-input"]').fill(current_minute)
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, f"3_4_1_3(6)_{current_minute}분_선택.png"),full_page=True)
        print(f"TC_3_4_1_3(6)_{current_minute}분_선택 :PASS")

    #처치항목선택
        # await new_tab.locator('xpath=//*[@id="action-form"]/div[2]/div[2]/button[2]').click()
        await new_tab.locator('[data-action-state="CPR"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_4_처치항목_선택.png"),full_page=True)
        print("TC_3_4_1_4_처치항목_선택 :PASS")

    #취소선택
        await new_tab.locator('[data-testid="action-cancel-button"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_5(1)_취소버튼_클릭.png"),full_page=True) 
        print("TC_3_4_1_5(1)_취소버튼_클릭 :PASS")

    #취소선택
        # await new_tab.locator('//div[text()="아니오"]').click()
        await new_tab.locator('[data-testid="action-alert-cancel-button"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_5(2)_취소버튼_아니오_클릭.png"),full_page=True) 
        print("TC_3_4_1_5(2)_취소버튼_아니오_클릭 :PASS")

        # await new_tab.locator('//div[text()="취소"]').click()
        await new_tab.locator('[data-testid="action-cancel-button"]').click()
        await asyncio.sleep(1)
        # await new_tab.locator('//div[text()="예"]').click()
        await new_tab.locator('[data-testid="action-alert-confirm-button"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_5(3)_취소버튼_예_클릭.png"),full_page=True)           
        print("TC_3_4_1_5(3)_취소버튼_예_클릭 :PASS")

        # await new_tab.locator('xpath=//*[@id="action-form"]/div[2]/div[2]/button[3]').click()
        await new_tab.locator('[data-action-state="VASOPRESSOR"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_6(1)_처치항목재선택.png"),full_page=True)
        print("TC_3_4_1_6(1)_처치항목_재선택 :PASS")

    #내용 입력
        # await new_tab.locator("input[name=\"comment\"]").fill("test")
        await new_tab.locator('input[data-testid="action-comment-input"]').fill("test")
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_6(2)_내용_입력.png"),full_page=True)
        print("TC_3_4_1_6(2)_내용_입력 :PASS")

    #저장선택
        await new_tab.locator('[data-testid="action-save-button"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_7_저장버튼_클릭.png"),full_page=True) 
        print("TC_3_4_1_7_저장버튼_클릭 :PASS")
        
    #수정 선택
        #await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[2]/div/div/div/div[5]/div[3]/div[1]/div[1]/div/div[1]/div[2]/div[1]/button')
        await new_tab.locator('[data-testid="action-history-item-edit-button"]').nth(0).click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_8(1)_수정버튼클릭.png"),full_page=True)
        print("TC_3_4_1_8(1)_수정버튼_클릭 :PASS")

        await new_tab.locator('[data-testid="date-picker-trigger"]').click()
        # await new_tab.click('xpath=//*[@id="action-form"]/div[1]/div[2]/div[1]/div')
        await asyncio.sleep(1)
        
        # await new_tab.click('xpath=//*[starts-with(@id, "radix-")]/div[1]/div/nav/button[1]')
        await new_tab.get_by_role("button", name="Go to the Previous Month").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_8(4)_캘린터_이전달_버튼클릭.png"),full_page=True)
        print("TC_3_4_1_8(4)_캘린터_이전달_버튼_클릭 :PASS")

        # await new_tab.click('xpath=//*[starts-with(@id, "radix-")]/div[1]/div/nav/button[2]')
        await new_tab.get_by_role("button", name="Go to the Next Month").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_8(5)_캘린터_다음달_버튼클릭.png"),full_page=True)
        print("TC_3_4_1_8(5)_캘린터_다음달_버튼_클릭 :PASS")

        today_str = datetime.today().strftime("%Y-%m-%d")
        selector = f'td[data-day="{today_str}"] button'
        await new_tab.click(selector)
        await asyncio.sleep(1)
        today = datetime.today()
        formatted_day = today.strftime("%m월%d일").lstrip("0").replace(" 0", " ")
        await new_tab.screenshot(path=os.path.join(version_dir,  f"3_4_1_9(1)_{formatted_day}선택.png"),full_page=True)
        print(f"TC_3_4_1_9(1)_{formatted_day}선택 :PASS")

    #저장선택
        await new_tab.locator('//div[text()="저장"]').click()
        await asyncio.sleep(2)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_9(2)_수정_저장버튼_클릭.png"),full_page=True) 
        print("TC_3_4_1_9(2)_수정_저장버튼_클릭 :PASS")

    #삭제 선택
        # await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[2]/div/div/div/div[5]/div[3]/div[1]/div[1]/div/div[1]/div[2]/div[2]/button')
        await new_tab.locator('[data-testid="action-history-item-delete-button"]').nth(0).click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_10(1)_삭제버튼_클릭.png"),full_page=True) 
        print("TC_3_4_1_10(1)_삭제버튼_클릭 :PASS")

        await new_tab.locator('//div[text()="아니오"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_10(2)_삭제버튼_아니오_클릭.png"),full_page=True) 
        print("TC_3_4_1_10(2)_삭제버튼_아니오_클릭 :PASS")

        await new_tab.locator('[data-testid="action-history-item-delete-button"]').nth(0).click()
        #await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[2]/div/div/div/div[5]/div[3]/div[1]/div[1]/div/div[1]/div[2]/div[2]/button')
        await asyncio.sleep(1)
        await new_tab.locator('//div[text()="예"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_4_1_10(3)_삭제버튼_예_클릭.png"),full_page=True)     
        print("TC_3_4_1_10(3)_삭제버튼_예_클릭 :PASS")



async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행