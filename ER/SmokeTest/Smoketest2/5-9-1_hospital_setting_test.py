import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
from exceptions import ElementNotFoundError, TimeoutError
from log_failure import log_to_file
import os
import json
import os

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script5"
os.makedirs(version_dir, exist_ok=True)

SCRIPT_NAME = "5-9-1_hospital_setting_test.py"


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

#admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

#병원 정보 관리 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(1)
        await page.get_by_text("병원 정보 관리").click()
        await asyncio.sleep(1)

#초기화작업
        try:
                await page.locator('input[name="name"]').click()
                await page.locator('input[name="name"]').fill('test')
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] 병원이름 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("병원이름 클릭 중 오류 발생") from e
        try:
                await page.locator('input[name="address"]').click()
                await page.locator('input[name="address"]').fill('test')
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] 병원주소 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("병원주소 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

       

        try:
                await page.locator('input[name="contact"]').click()
                await page.locator('input[name="contact"]').fill('0')
                await asyncio.sleep(1)
        
        except Exception as e:
                log_to_file(
                        f"[오류] 병원연락처 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("병원연락처 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

        try:
                await page.get_by_text("저장").click()
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] 저장 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("저장 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

        await page.screenshot(path=os.path.join(version_dir, "5_9_1_1_Setting_병원 정보 관리_진입.png"),full_page=True)
        print("TC_5_9_1_1_Setting_병원 정보 관리_진입 :PASS")

#병원이름_입력
        try:
                await page.locator('input[name="name"]').click()
                await page.locator('input[name="name"]').fill('smoketest')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_9_1_2(1)_병원이름_입력.png"),full_page=True)
                print("TC_5_9_1_2(1)_병원이름_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 병원이름 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("병원이름 클릭 중 오류 발생") from e
        
#병원주소_입력

        try:
                await page.locator('input[name="address"]').click()
                await page.locator('input[name="address"]').fill('smoketest')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_9_1_2(2)_병원주소_입력.png"),full_page=True)
                print("TC_5_9_1_2(2)_병원주소_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 병원주소 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("병원주소 클릭 중 오류 발생") from e
        await asyncio.sleep(1)


# 병원연락처_입력
        try:
                await page.locator('input[name="contact"]').click()
                await page.locator('input[name="contact"]').fill('010-0000-0000')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_9_1_2(3)_병원연락처_입력.png"),full_page=True)
                print("TC_5_9_1_2(3)_병원연락처_입력 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 병원연락처 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("병원연락처 클릭 중 오류 발생") from e
        await asyncio.sleep(1)


#보안메세지 설정
        try:
                await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/form/div[2]/div[3]/button')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_9_1_3(1)_보안메세지_드랍다운.png"),full_page=True)
                print("TC_5_9_1_3(1)_보안메세지_드랍다운_클릭 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 보안메세지 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("보안메세지 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#보안메세지 선택
        try:
                await page.select_option(
    'xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/form/div[2]/div[3]/select',
    value='안전한 시스템 사용을 위해 활동 내역이 기록되며, 무단 사용은 제한됩니다.'
)
                await page.mouse.click(10, 10)
        except Exception as e:
                log_to_file(
                        f"[오류] 보안메세지 목록 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("보안메세지 목록 클릭오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_9_1_3(2)_메세지 선택.png"),full_page=True)
        print("TC_5_9_1_3(2)_보안메세지 선택 :PASS")

#저장
        try:
                await page.get_by_text("저장").click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_9_1_4_저장.png"),full_page=True)
                print("TC_5_9_1_4_보안메세지_저장 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 저장 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("저장 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#로그아웃 후 보안메세지 확인
        # await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[3]/button/div[2]')
        await page.locator('[data-testid="logout-button"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_9_1_5_보안메세지 확인.png"),full_page=True)
        print("TC_5_9_1_5_보안메세지_확인 :PASS")

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행



        