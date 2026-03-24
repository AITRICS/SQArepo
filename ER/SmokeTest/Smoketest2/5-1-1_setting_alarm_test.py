import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
import json
import os
from log_failure import log_to_file
from pre_setting import login

SCRIPT_NAME = "5-1-1_setting_alarm_test.py"

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script5"
os.makedirs(version_dir, exist_ok=True)


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

#     #생성된 계정으로 로그인
#         base_dir = os.path.dirname(os.path.abspath(__file__))
#         file_path = os.path.join(base_dir, "generated_id.json")
#         with open(file_path, "r", encoding="utf-8") as f:
#                 data = json.load(f)
#         random_regi_id = data["random_regi_id"]
#         await page.locator("input[name=\"username\"]").click()
#         await page.locator("input[name=\"username\"]").fill(random_regi_id)
#         await asyncio.sleep(1)
#         await page.locator("input[name=\"password\"]").click()
#         await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
#         await asyncio.sleep(1)
#         await page.click('xpath=/html/body/div[2]/div[2]/div/div[1]/form/div[3]/button')
#         await asyncio.sleep(1)

#     #중복 로그인 예외처리
#         try:
#             allow_button = page.locator("button:has-text('중복')") 
#             await page.click("xpath=//*[@id='radix-«R1p7nedb»']/div[2]/div[2]/button/div[2]")
#             await asyncio.sleep(2)
#             print("[중복 로그인] 허용 버튼 클릭 완료")

#         except:
#             print("[중복 로그인] 알림 없음, 정상 로그인 중")

#         await page.wait_for_load_state('networkidle')  # 로그인 완료 대기
#         await asyncio.sleep(2)

    #Admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)
        await asyncio.sleep(2)

    #Setting 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(2)
        
    #알람 비활성화목록 클릭
        try:
                await page.get_by_role("button", name="알람 비활성화 목록").click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_1_1_1(1)_알람 비활성화목록_진입.png"),full_page=True)
                print("TC_5_1_1_1(1)_Setting_알람 비활성화목록_진입 :PASS")


        except Exception as e:
                log_to_file(
                        f"[오류] 알람 비활성화목록 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("알람 비활성화목록 클릭 중 오류 발생") from e
        await asyncio.sleep(1)



    #알람 다시받기 클릭
        try:
                await page.get_by_role("button", name="알람 다시 받기").nth(0).click()
                
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_1_1_1(2)_알람 다시받기_클릭.png"),full_page=True)
                print("TC_5_1_1_1(2)_알람 다시받기_클릭 :PASS")


        except Exception as e:
                log_to_file(
                        f"[오류] 알람 다시받기 클릭 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("알람 다시받기 클릭 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행