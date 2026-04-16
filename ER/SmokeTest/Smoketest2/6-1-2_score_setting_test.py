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

SCRIPT_NAME = "6-1-2_score_setting_test.py"


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
        await page.screenshot(path=os.path.join(version_dir, "6_1_3_1(1)_데이터 설정_진입.png"),full_page=True)
        print("TC_6_1_3_1(1)_admin페이지_데이터 설정_진입 :PASS")

#예측모델 관리 진입
        await page.get_by_text("예측모델 관리").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "6_1_3_1(2)__예측모델 관리_진입.png"),full_page=True)
        print("TC_6_1_3_1(2)__예측모델 관리_진입 :PASS")

#PRES 클릭
        try:
                # await page.click('xpath=/html/body/div[2]/div[2]/div/div/div/form/div[2]/div[1]/button')
                await page.locator('[data-testid="switch-PRES"]').click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_3_2_PRES_off.png"),full_page=True)
                print("TC_6_1_3_2_PRES_off :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] PRES 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("PRES 클릭 중 오류 발생") from e
        
#CRES 클릭
        try:
                # await page.click('xpath=/html/body/div[2]/div[2]/div/div/div/form/div[3]/div[1]/button')
                await page.locator('[data-testid="switch-CRES"]').click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_3_3_CRES_off.png"),full_page=True)
                print("TC_6_1_3_3_CRES_off :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] PRES 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("PRES 클릭 중 오류 발생") from e
        
#BRES 클릭
        try:
                # await page.click('xpath=/html/body/div[2]/div[2]/div/div/div/form/div[4]/div[1]/button')
                await page.locator('[data-testid="switch-BRES"]').click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_3_4_BRES_off.png"),full_page=True)
                print("TC_6_1_3_4_BRES_off :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] PRES 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("PRES 클릭 중 오류 발생") from e

        
#PRES 클릭
        try:
                # await page.click('xpath=/html/body/div[2]/div[2]/div/div/div/form/div[4]/div[1]/button')
                await page.locator('[data-testid="switch-PRES"]').click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_3_5_PRES_on.png"),full_page=True)
                print("TC_6_1_3_5_PRES_on :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] CRES 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("CRES 클릭 중 오류 발생") from e

#저장
        try:
                await page.get_by_text("저장").click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "6_1_3_6_CRES_BRES_Off_저장.png"),full_page=True)
                print("TC_6_1_3_6_CRES_BRES_Off_저장 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 저장 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("저장 클릭 중 오류 발생") from e
        await asyncio.sleep(1)


#BRES 클릭
        try:
                # await page.click('xpath=/html/body/div[2]/div[2]/div/div/div/form/div[3]/div[1]/button')
                await page.locator('[data-testid="switch-BRES"]').click()
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] BRES 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("BRES 클릭 중 오류 발생") from e
        
#CRES 클릭
        try:
                # await page.click('xpath=/html/body/div[2]/div[2]/div/div/div/form/div[3]/div[1]/button')
                await page.locator('[data-testid="switch-CRES"]').click()
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] CRES 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("CRES 클릭 중 오류 발생") from e
        



#저장
        try:
                await page.get_by_text("저장").click()
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] 저장 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("저장 클릭 중 오류 발생") from e
        await asyncio.sleep(1)



        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행