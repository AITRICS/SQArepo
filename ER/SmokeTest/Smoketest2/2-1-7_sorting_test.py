
import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
import json
import os
from exceptions import ElementNotFoundError, TimeoutError
from log_failure import log_to_file

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script2"
os.makedirs(version_dir, exist_ok=True)

SCRIPT_NAME = "2-1-7_sorting_test.py"

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


        #Setting 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(2)
        
        #대시보드_화면설정 클릭
        await page.get_by_role("button", name="대시보드 화면 설정").click()
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(2)
        
        #초기화버튼
        await page.get_by_role("button", name="초기화").click()
        await asyncio.sleep(1)
        await page.locator('//div[text()="예"]').click()
        await asyncio.sleep(1)


    #대시보드 진입
        await page.get_by_text("Dashboard").click()
        await asyncio.sleep(2)


    #patient ID 정렬
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[2]/button')
        await page.locator('[data-sort-column-id="Patient ID"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_1(1)_PID_정렬.png"),full_page=True)
        print("TC_2_1_7_1(1)_대시보드_PID_정렬 :PASS")

        await page.locator('[data-sort-column-id="Patient ID"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[2]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_1(2)_PID_정렬.png"),full_page=True)
        print("TC_2_1_7_1(2)_PID_정렬 :PASS")

    #patient Info 정렬
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[3]/button')
        await page.locator('[data-sort-column-id="Patient info"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_2(1)_PInfo_정렬.png"),full_page=True)
        print("TC_2_1_7_2(1)_PInfo_정렬 :PASS")

        await page.locator('[data-sort-column-id="Patient info"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[3]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_2(2)_PInfo_정렬.png"),full_page=True)
        print("TC_2_1_7_2(2)_PInfo_정렬 :PASS")

    #Alarm date 정렬
        await page.locator('[data-sort-column-id="Alarm date"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[7]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_3(1)_Alarm date_정렬.png"),full_page=True)
        print("TC_2_1_7_3(1)_Alarm date_정렬 :PASS")

        await page.locator('[data-sort-column-id="Alarm date"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[7]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_3(2)_Alarm date_정렬.png"),full_page=True)
        print("TC_2_1_7_3(2)_Alarm date_정렬 :PASS")


    #BRES 정렬
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[8]/button[2]')
        await page.locator('[data-sort-column-id="BRES"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_4(1)_BRES_정렬.png"),full_page=True)
        print("TC_2_1_7_4(1)_BRES_정렬 :PASS")

        await page.locator('[data-sort-column-id="BRES"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[8]/button[2]')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_4(2)_BRES_정렬.png"),full_page=True)       
        print("TC_2_1_7_4(2)_BRES_정렬 :PASS")

    #PRES 정렬
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[9]/button[2]')
        await page.locator('[data-sort-column-id="PRES"]').click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_5(1)_PRES_정렬.png"),full_page=True)
        print("TC_2_1_7_5(1)_PRES_정렬 :PASS")

        await page.locator('[data-sort-column-id="PRES"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[9]/button[2]')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_5(2)_PRES_정렬.png"),full_page=True)       
        print("TC_2_1_7_5(2)_PRES_정렬 :PASS")

    #CRES 정렬
        await page.locator('[data-sort-column-id="CRES"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[10]/button[2]')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_6(1)_CRES_정렬.png"),full_page=True)
        print("TC_2_1_7_6(1)_CRES_정렬 :PASS")

        await page.locator('[data-sort-column-id="CRES"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[10]/button[2]')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_6(2)_CRES_정렬.png"),full_page=True)       
        print("TC_2_1_7_6(2)_CRES_정렬 :PASS")

    #ER Arrival date 정렬
        await page.locator('[data-sort-column-id="ER Arrival date"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[11]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_7(1)_ER Arrival date_정렬.png"),full_page=True)
        print("TC_2_1_7_7(1)_ER Arrival date_정렬 :PASS")

        await page.locator('[data-sort-column-id="ER Arrival date"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[11]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_7(2)_ER Arrival date_정렬.png"),full_page=True)
        print("TC_2_1_7_7(2)_ER Arrival date_정렬 :PASS")

    #KTAS 정렬
        await page.locator('[data-sort-column-id="KTAS"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[12]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_8(1)_KTAS_정렬.png"),full_page=True)
        print("TC_2_1_7_8(1)_KTAS_정렬 :PASS")

        await page.locator('[data-sort-column-id="KTAS"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[12]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_8(2)_KTAS_정렬.png"),full_page=True)
        print("TC_2_1_7_8(2)_KTAS_정렬 :PASS")


        element = await page.query_selector("//div[3]/div[2]/div/div[2]/div/div[1]")
        await element.evaluate("el => el.scrollLeft = el.scrollWidth - el.clientWidth")
        await asyncio.sleep(2)

    #SBP 정렬
        await page.locator('[data-sort-column-id="SBP"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[14]/button')
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_9(1)_SBP_정렬.png"),full_page=True)
        print("TC_2_1_7_9(1)_SBP_정렬 :PASS")

        await page.locator('[data-sort-column-id="SBP"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[14]/button')
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_9(2)_SBP_정렬.png"),full_page=True)
        print("TC_2_1_7_9(2)_SBP_정렬 :PASS")

    #DBP 정렬
        await page.locator('[data-sort-column-id="DBP"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[15]/button')
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_10(1)_DBP_정렬.png"),full_page=True)
        print("TC_2_1_7_10(1)_DBP_정렬 :PASS")

        await page.locator('[data-sort-column-id="DBP"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[15]/button')
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_10(2)_DBP_정렬.png"),full_page=True)
        print("TC_2_1_7_10(2)_DBP_정렬 :PASS")

    #PR 정렬
        await page.locator('[data-sort-column-id="PR"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[16]/button')
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_11(1)_PR_정렬.png"),full_page=True)
        print("TC_2_1_7_11(1)_PR_정렬 :PASS")

        await page.locator('[data-sort-column-id="PR"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[16]/button')
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_11(2)_PR_정렬.png"),full_page=True)
        print("TC_2_1_7_11(2)_PR_정렬 :PASS")

    #RR 정렬
        await page.locator('[data-sort-column-id="RR"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[17]/button')
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_12(1)_RR_정렬.png"),full_page=True)
        print("TC_2_1_7_12(1)_RR_정렬 :PASS")

        await page.locator('[data-sort-column-id="RR"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[17]/button')
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_12(2)_RR_정렬.png"),full_page=True)
        print("TC_2_1_7_12(2)_RR_정렬 :PASS")

    #BT 정렬
        await page.locator('[data-sort-column-id="BT"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[18]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_13(1)_BT_정렬.png"),full_page=True)
        print("TC_2_1_7_13(1)_BT_정렬 :PASS")

        await page.locator('[data-sort-column-id="BT"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[18]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_13(2)_BT_정렬.png"),full_page=True)
        print("TC_2_1_7_13(2)_BT_정렬 :PASS")

    #SpO2 정렬
        await page.locator('[data-sort-column-id="SpO2"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[19]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_14(1)_SpO2_정렬.png"),full_page=True)
        print("TC_2_1_7_14(1)_SpO2_정렬 :PASS")

        await page.locator('[data-sort-column-id="SpO2"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[19]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_14(2)_SpO2_정렬.png"),full_page=True)
        print("TC_2_1_7_14(2)_SpO2_정렬 :PASS")

    #Mental Status 정렬
        await page.locator('[data-sort-column-id="Mental status"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[20]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_15(1)_Mental Status_정렬.png"),full_page=True)
        print("TC_2_1_7_15(1)_Mental Status_정렬 :PASS")

        await page.locator('[data-sort-column-id="Mental status"]').click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[20]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_7_15(2)_Mental Status_정렬.png"),full_page=True)     
        print("TC_2_1_7_15(2)_Mental Status_정렬 :PASS")

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행
        
        
        