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

SCRIPT_NAME = "6-1-1_data_setting_test.py"


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.ADMIN_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

#admin 로그인
        await admin_page_login(page, config.ADMIN_PAGE_ID, config.ADMIN_PAGE_PASSWORD)

#데이터 설정 진입
        await asyncio.sleep(1)
        await page.get_by_text("데이터 설정").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "6_1_1_1_데이터 설정_진입.png"),full_page=True)
        print("TC_6_1_1_1_admin페이지_데이터 설정_진입 :PASS")

# #초기화
#         try:
#                 await page.get_by_text("초기화").click()
#                 await asyncio.sleep(1)
                
#         except Exception as e:
#                 log_to_file(
#                         f"[오류] 초기화 클릭 실패: {e.__class__.__name__}: {e}",
#                         script_name=SCRIPT_NAME)
#                 raise Exception("초기화 클릭 중 오류 발생") from e
#         await asyncio.sleep(1)



#SBP.min입력
        try:
                await page.locator('input[name="INITIAL_SBP.min"]').click()
                await page.locator('input[name="INITIAL_SBP.min"]').fill('1')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_1(1)_SBP.min1_입력.png"),full_page=True)
                print("TC_6_1_2_1(1)_SBP.min1_입력:PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] SBP.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("SBP.min 클릭 중 오류 발생") from e
#SBP.max입력
        try:
                await page.locator('input[name="INITIAL_SBP.max"]').click()
                await page.locator('input[name="INITIAL_SBP.max"]').fill('250')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_1(2)_SBP.max250_입력.png"),full_page=True)
                print("TC_6_1_2_1(2)_SBP.max250_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] SBP.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("SBP.min 클릭 중 오류 발생") from e

#DBP.min입력
        try:
                await page.locator('input[name="INITIAL_DBP.min"]').click()
                await page.locator('input[name="INITIAL_DBP.min"]').fill('1')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_2(1)_DBP.min1_입력.png"),full_page=True)
                print("TC_6_1_2_2(1)_DBP.min1_입력 :PASS")
                
        except Exception as e:
                log_to_file(
                        f"[오류] DBP.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("DBP.min 클릭 중 오류 발생") from e
#DBP.max입력
        try:
                await page.locator('input[name="INITIAL_DBP.max"]').click()
                await page.locator('input[name="INITIAL_DBP.max"]').fill('250')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_2(2)_DBP.max250_입력.png"),full_page=True)
                print("TC_6_1_2_2(2)_DBP.max250_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] DBP.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("DBP.min 클릭 중 오류 발생") from e

#PR.min입력
        try:
                await page.locator('input[name="INITIAL_PR.min"]').click()
                await page.locator('input[name="INITIAL_PR.min"]').fill('1')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_3(1)_PR.min1_입력.png"),full_page=True)
                print("TC_6_1_2_3(1)_PR.min1_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] PR.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("PR.min 클릭 중 오류 발생") from e
#PR.max입력
        try:
                await page.locator('input[name="INITIAL_PR.max"]').click()
                await page.locator('input[name="INITIAL_PR.max"]').fill('250')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_3(2)_PR.max250_입력.png"),full_page=True)
                print("TC_6_1_2_3(2)_PR.max250_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] PR.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("PR.min 클릭 중 오류 발생") from e
        
#RR.min입력
        try:
                await page.locator('input[name="INITIAL_RR.min"]').click()
                await page.locator('input[name="INITIAL_RR.min"]').fill('1')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_4(1)_RR.min1_입력.png"),full_page=True)
                print("TC_6_1_2_4(1)_RR.min1_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] RR.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("RR.min 클릭 중 오류 발생") from e
#RR.max입력
        try:
                await page.locator('input[name="INITIAL_RR.max"]').click()
                await page.locator('input[name="INITIAL_RR.max"]').fill('90')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_4(2)_RR.max90_입력.png"),full_page=True)
                print("TC_6_1_2_4(2)_RR.max90_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] RR.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("RR.min 클릭 중 오류 발생") from e

#BT.min입력
        try:
                await page.locator('input[name="INITIAL_BT.min"]').click()
                await page.locator('input[name="INITIAL_BT.min"]').fill('22')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_5(1)_BT.min22_입력.png"),full_page=True)
                print("TC_6_1_2_5(1)_BT.min22_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] BT.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("BT.min 클릭 중 오류 발생") from e
#BT.max입력
        try:
                await page.locator('input[name="INITIAL_BT.max"]').click()
                await page.locator('input[name="INITIAL_BT.max"]').fill('44')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_5(2)_BT.max44_입력.png"),full_page=True)
                print("TC_6_1_2_5(2)_BT.max44_입력 :PASS")
        except Exception as e:
                log_to_file(
                        f"[오류] BT.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("BT.min 클릭 중 오류 발생") from e

#SpO2.min입력
        try:
                await page.locator('input[name="INITIAL_SpO2.min"]').click()
                await page.locator('input[name="INITIAL_SpO2.min"]').fill('1')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_6(1)_SpO2.min1_입력.png"),full_page=True)
                print("TC_6_1_2_6(1)_SpO2.min1_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] SpO2.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("SpO2.min 클릭 중 오류 발생") from e
#SpO2.max입력
        try:
                await page.locator('input[name="INITIAL_SpO2.max"]').click()
                await page.locator('input[name="INITIAL_SpO2.max"]').fill('80')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_6(2)_SpO2.max80_입력.png"),full_page=True)
                print("TC_6_1_2_6(2)_SpO2.max80_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] SpO2.min 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("SpO2.min 클릭 중 오류 발생") from e

#저장
        try:
                await page.get_by_text("저장").click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_7_저장.png"),full_page=True)
                print("TC_6_1_2_7_저장_클릭 :PASS")
        except Exception as e:
                log_to_file(
                        f"[오류] 저장 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("저장 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#초기화
        try:
                await page.get_by_text("초기화").click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_2_8_초기화.png"),full_page=True)
                print("TC_6_1_2_8_초기화_클릭 :PASS")
        except Exception as e:
                log_to_file(
                        f"[오류] 초기화 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("초기화 클릭 중 오류 발생") from e
        await asyncio.sleep(1)




        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행