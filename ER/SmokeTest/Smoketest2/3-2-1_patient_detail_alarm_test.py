
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

SCRIPT_NAME = "3-2-1_patient_detail_alarm_test.py"

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
    #     await page.click('xpath=/html/body/div[2]/div[2]/div/div[1]/form/div[3]/button')


    # #중복 로그인 예외처리
    
    #     try:
    #         await page.wait_for_selector("//h2[text()='중복 로그인 안내']", timeout=3000)
    #         await asyncio.sleep(2)
    #         await page.get_by_text("예").click()



    #         await page.wait_for_load_state('networkidle')
    #         await asyncio.sleep(2)
    #         print("[중복 로그인] 허용 버튼 클릭 완료")

    #     except:
    #         print("[중복 로그인] 알림 없음, 정상 로그인 중")
    #         await asyncio.sleep(2)
    #         await page.wait_for_load_state('networkidle')


    #     await asyncio.sleep(2)

#admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

    #상세 진입
        async with context.expect_page() as new_page_info:
            await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/tbody/tr[6]/td[3]')
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state('domcontentloaded')
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_1(1)_상세진입.png"),full_page=True)
        print("TC_3_2_1_1(1)_상세_진입 :PASS")

    #주의사항팝업 예외처리
    
        try:
            await new_tab.locator("//h2[text()='주의사항']").wait_for(state="visible", timeout=3000)
            print("주의사항팝업 존재")
            await new_tab.click("text=오늘 하루 그만보기")

            await new_tab.wait_for_load_state('networkidle')
            await asyncio.sleep(1)
            await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_1(2)_주의사항팝업_오늘하루그만보기.png"),full_page=True)
            
            print("TC_3_2_1_1(2)_주의사항팝업_오늘하루그만보기 :PASS")

        except:
            print("주의사항팝업 없음")
            await asyncio.sleep(2)
            await new_tab.wait_for_load_state('networkidle')

    #alarm 버튼 클릭
        try:
                # await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[1]/div[2]/div[1]/div[1]/div/button[1]')
                await new_tab.locator('[data-testid="alarm-toggle-chip"]').nth(0).click()
                await asyncio.sleep(1)
                print("클릭")
                await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_1(3)_Alarm클릭.png"),full_page=True) 
                print("TC_3_2_1_1(3)_Alarm_클릭 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] alarm 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("alarm 버튼 클릭 중 오류 발생") from e
        


    #X버튼 클릭
        await new_tab.get_by_role("button", name="Close").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_1(4)_Alarm_x버튼클릭.png"),full_page=True)
        print("TC_3_2_1_1(4)_Alarm_x버튼_클릭 :PASS")

    #취소버튼 클릭
        #await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[1]/div[2]/div[1]/div[1]/div/button[1]')
        await new_tab.locator('[data-testid="alarm-toggle-chip"]').nth(0).click()
        await asyncio.sleep(1)
        await new_tab.locator('//div[text()="취소"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_1(5)_Alarm_취소버튼클릭.png"),full_page=True) 
        print("TC_3_2_1_1(5)_Alarm_취소버튼_클릭 :PASS")

    #시간 선택
        #await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[1]/div[2]/div[1]/div[1]/div/button[1]')
        await new_tab.locator('[data-testid="alarm-toggle-chip"]').nth(0).click()
        await asyncio.sleep(1)
        
        await new_tab.locator("button#alarm-off-30").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_2(1)_Alarm_30분_선택.png"),full_page=True)      
        print("TC_3_2_1_2(1)_Alarm_30분_선택 :PASS")

    #직접 입력 선택
        await new_tab.locator("button#alarm-off-custom").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_2(2)_Alarm_직접입력_선택.png"),full_page=True)      
        print("TC_3_2_1_2(2)_Alarm_직접입력_선택 :PASS")

    #직접입력

        await new_tab.locator("input[name=\"manual-hours\"]").fill("1")
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_3(1)_Alarm_직접입력_1시간.png"),full_page=True)
        print("TC_3_2_1_3(1)_Alarm_직접입력_1시간 :PASS")

    #직접입력
        await new_tab.click('xpath=//*[@id="manual-minutes"]')
        await new_tab.locator("input[name=\"manual-minutes\"]").fill("10")
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_3(2)_Alarm_직접입력_10분.png"),full_page=True)
        print("TC_3_2_1_3(2)_Alarm_직접입력_10분 :PASS")

    #저장 클릭     
        await new_tab.locator('//div[text()="저장"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_4_저장클릭.png"),full_page=True) 
        print("TC_3_2_1_4_저장_클릭 :PASS")

    #알람 On 원복
        try:
                await new_tab.locator('[data-testid="alarm-toggle-chip"]').nth(0).click()
                #await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[1]/div[2]/div[1]/div[1]/div/button[1]')
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] alarm 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("alarm 버튼 클릭 중 오류 발생") from e
        
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_5(1)_Alarm_클릭.png"),full_page=True) 
        print("TC_3_2_1_5(1)_Alarm_클릭 :PASS")
        
        await new_tab.locator('//div[text()="취소"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_5(2)_Alarm_on_취소_클릭.png"),full_page=True)
        print("TC_3_2_1_5(2)_Alarm_on_취소_클릭 :PASS")

        try:
                await new_tab.locator('[data-testid="alarm-toggle-chip"]').nth(0).click()
                # await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[1]/div[2]/div[1]/div[1]/div/button[1]')
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] alarm 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
               
        await new_tab.get_by_role("button", name="Close").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_5(3)_Alarm_x버튼클릭.png"),full_page=True)
        print("TC_3_2_1_5(3)_Alarm_x버튼_클릭 :PASS")
        
        try:
                # await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[1]/div[2]/div[1]/div[1]/div/button[1]')
                await new_tab.locator('[data-testid="alarm-toggle-chip"]').nth(0).click()
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] alarm 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)

        await new_tab.get_by_role("button", name="확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_2_1_5(3)_Alarm_확인버튼클릭.png"),full_page=True)
        print("TC_3_2_1_5(3)_Alarm_확인버튼_클릭 :PASS")

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행