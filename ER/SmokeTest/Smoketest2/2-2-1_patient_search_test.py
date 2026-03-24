
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

SCRIPT_NAME = "2-2-1_patient_search_test.py"

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
    #         await page.screenshot(path=os.path.join(version_dir, "2_2_1(1)_승인계정_로그인.png"),full_page=True)
    #         print("[중복 로그인] 허용 버튼 클릭 완료")

    #     except:
    #         print("[중복 로그인] 알림 없음, 정상 로그인 중")
    #         await asyncio.sleep(1)
    #         await page.wait_for_load_state('networkidle')
    #         await page.screenshot(path=os.path.join(version_dir, "2_2_1(1)_승인계정_로그인.png"),full_page=True)

    #Admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

        await asyncio.sleep(2)

    #검색버튼 클릭
        # await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/button/div[2]')
        await page.locator('[data-testid="gnb-search-button"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_1_검색 버튼 클릭.png"),full_page=True)
        print("TC_2_2_1_1_대시보드_검색 버튼_클릭 :PASS")

    #patient name 클릭
        await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[2]/div/input')
        
        await asyncio.sleep(1)
        await page.fill('input[placeholder="환자 검색"]', '11')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_2_name 입력.png"),full_page=True)
        print("TC_2_2_1_2_name_입력 :PASS")

        await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[2]/div/div')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_4(1)_name 검색.png"),full_page=True)
        print("TC_2_2_1_4(1)_name_검색 :PASS")

    #뒤로 가기
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/button/div[2]')
        await page.locator('[data-testid="search-back-button"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_5_뒤로가기 클릭.png"),full_page=True)
        print("TC_2_2_1_5_뒤로가기_클릭 :PASS")

        # await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/button/div[2]')
        await page.locator('[data-testid="gnb-search-button"]').click()
        await asyncio.sleep(1)

    #id 클릭
        await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[1]/div[2]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_3(1)_id 클릭.png"),full_page=True)
        print("TC_2_2_1_3(1)_id_클릭:PASS")

        await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[2]/div/input')
        await asyncio.sleep(1)
        await page.fill('input[placeholder="환자 검색"]', '11')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_3(2)_id 입력.png"),full_page=True)
        print("TC_2_2_1_3(2)_id_입력 :PASS")

        await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[2]/div/div')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_4(2)_id 검색.png"),full_page=True)
        print("TC_2_2_1_4(2)_id_검색 :PASS")

    #퇴실 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[3]/button[2]')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_6(1)_퇴실 클릭.png"),full_page=True)
        print("TC_2_2_1_6(1)_퇴실_클릭 :PASS")

    #재실중 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[3]/button[1]')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_6(2)_재실중 클릭.png"),full_page=True)
        print("TC_2_2_1_6(2)_재실중_클릭 :PASS")

    #페이지 이동 클릭
        await page.get_by_role("button", name="Go to next page").click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div/nav/ul/div[2]/li[1]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_7(1)_페이지 이동클릭.png"),full_page=True)
        print("TC_2_2_1_7(1)_페이지_이동_클릭 :PASS")

    #마지막 페이지 이동 클릭
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div/nav/ul/div[2]/li[2]/button')
        await page.get_by_role("button", name="Go to End page").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_7(2)_마지막페이지_이동클릭.png"),full_page=True)
        print("TC_2_2_1_7(2)_마지막페이지_이동_클릭 :PASS")

    #페이지 이동 클릭
        await page.get_by_role("button", name="Go to previous page").click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div/nav/ul/div[1]/li[2]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_7(3)_이전페이지_이동클릭.png"),full_page=True)
        print("TC_2_2_1_7(3)_이전페이지_이동_클릭 :PASS")

    #첫 페이지 이동 클릭
        await page.get_by_role("button", name="Go to start page").click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div/nav/ul/div[1]/li[1]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_7(4)_첫페이지_이동클릭.png"),full_page=True)
        print("TC_2_2_1_7(4)_첫페이지_이동_클릭 :PASS")

    #100페이지 입력
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div/form/div[1]/div/input')
        await page.locator('[data-testid="page-input"]').click()
        await asyncio.sleep(2)
        await page.fill('input.w-\\[240px\\]', '2')
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_7(5)_2 페이지 입력.png"),full_page=True)
        print("TC_2_2_1_7(5)_2페이지_입력 :PASS")

    #100페이지 이동
        await page.get_by_text("이동").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_7(6)_2 페이지 이동.png"),full_page=True)
        print("TC_2_2_1_7(6)_2 페이지_이동 :PASS")

    #PID 정렬
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div[1]/table/thead/tr/th[1]/button')
        await page.locator('[data-sort-id="PATIENT_ID"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_8(1)_PID 정렬.png"),full_page=True)
        print("TC_2_2_1_8(1)_PID_정렬 :PASS")

        #await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div[1]/table/thead/tr/th[1]/button')
        await page.locator('[data-sort-id="PATIENT_ID"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_8(2)_PID 정렬.png"),full_page=True)
        print("TC_2_2_1_8(2)_PID_정렬 :PASS")
    
    #Pinfo 정렬    
        #await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div[1]/table/thead/tr/th[2]/button')
        await page.locator('[data-sort-id="NAME"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_8(3)_Pinfo 정렬.png"),full_page=True)
        print("TC_2_2_1_8(3)_Pinfo_정렬 :PASS")

        #await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div[1]/table/thead/tr/th[2]/button')
        await page.locator('[data-sort-id="NAME"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_8(4)_Pinfo 정렬.png"),full_page=True)
        print("TC_2_2_1_8(4)_Pinfo_정렬 :PASS")

        async def handle_error_page(error_page):
            try:
        # 에러 텍스트 감지
                inquiry_button_locator = error_page.locator("button", has_text="문의하기")
                await inquiry_button_locator.wait_for(state="visible", timeout=2000)
                log_to_file("[감지] 에러 페이지 감지됨", script_name=SCRIPT_NAME)
                print("⚠️ 에러 페이지 감지됨. 복구 버튼 클릭 시도.")
                await error_page.screenshot(path=os.path.join(version_dir, "에러 페이지.png"),full_page=True)

            # 에러 복구 버튼 클릭
                button = error_page.locator("xpath=/html/body/div[3]/div[1]/div[3]/button/div[1]")
                await button.click()

            # 기다려주기 (페이지 리다이렉션이나 닫힘 시간)
                await error_page.wait_for_timeout(1000)

                print("✅ 에러 처리 완료. 다음 동작 계속 진행.")
                log_to_file("[복구] 에러 페이지 새로고침 완료", script_name=SCRIPT_NAME)
                return True
            except Exception as e:
                print(f"❌ 에러 페이지 처리 중 예외 발생: {e}")
                log_to_file(f"[오류] 에러 페이지 감지 또는 복구 실패: {e.__class__.__name__}: {e}",
            script_name=SCRIPT_NAME
        )
            return False  


    #ER Arrival date 정렬
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div[1]/table/thead/tr/th[5]/button')
        await page.locator('[data-sort-id="ADMISSION_DT"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_8(5)_ER Arrival date 정렬.png"),full_page=True)
        print("TC_2_2_1_8(5)_ER Arrival date_정렬 :PASS")

        #await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div[1]/table/thead/tr/th[5]/button')
        await page.locator('[data-sort-id="ADMISSION_DT"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_8(6)_ER Arrival date 정렬.png"),full_page=True)
        print("TC_2_2_1_8(6)_ER Arrival date_정렬 :PASS")

    #환자 상세 진입
        await page.locator('[data-cell-id="1_area"]').click()
        #await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div[1]/table/tbody/tr[1]/td[2]')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_2_1_9_환자 클릭.png"),full_page=True)
        print("TC_2_2_1_9_환자_클릭 :PASS")

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행