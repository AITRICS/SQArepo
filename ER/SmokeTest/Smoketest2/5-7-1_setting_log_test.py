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

SCRIPT_NAME = "5-7-1_setting_log_test.py"


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

#admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

#알람설정 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(1)
        await page.get_by_text("접속기록 조회").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_7_1_1_Setting_접속기록 조회_진입.png"),full_page=True)
        print("TC_5_7_1_1_Setting_접속기록 조회_진입 :PASS")

#년 드랍다운 버튼 선택
        try:
                await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[1]/div[1]/div[2]/div[1]/button')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_7_1_2_년도 드랍다운 선택.png"),full_page=True)
                print("TC_5_7_1_2_년도 드랍다운_선택 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 년 드랍다운 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("년 드랍다운 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#2024년 선택
        try:
                await page.get_by_text("2024년").click()
        except Exception as e:
                log_to_file(
                        f"[오류] 2024 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("2024 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "5_7_1_3_2024년 선택.png"),full_page=True)
        print("TC_5_7_1_3_2024년_선택 :PASS")

#월 드랍다운 버튼 선택
        try:
                await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[1]/div[1]/div[2]/div[2]/button')
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_7_1_4_월 드랍다운 선택.png"),full_page=True)
                print("TC_5_7_1_4_월 드랍다운_선택 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 월 드랍다운 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("월 드랍다운 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#6월 선택
        try:
                await page.get_by_text("8월").click()
        except Exception as e:
                log_to_file(
                        f"[오류] 8월 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("8월 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "5_7_1_5_8월 선택.png"),full_page=True)
        print("TC_5_7_1_5_8월_선택 :PASS")

#년 드랍다운 버튼 선택
        try:
                await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[1]/div[1]/div[2]/div[1]/button')
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] 년 드랍다운 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("년 드랍다운 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)



#2025년 선택
        try:
                await page.get_by_text("2025년").click()
        except Exception as e:
                log_to_file(
                        f"[오류] 2025 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("2025 클릭 중 오류 발생") from e
        await asyncio.sleep(2)



#월 드랍다운 버튼 선택
        try:
                await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[1]/div[1]/div[2]/div[2]/button')
                await asyncio.sleep(1)
                
        except Exception as e:
                log_to_file(
                        f"[오류] 월 드랍다운 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("월 드랍다운 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#10월 선택
        try:
                await page.get_by_text("10월").click()
        except Exception as e:
                log_to_file(
                        f"[오류] 10월 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("10월 클릭 중 오류 발생") from e
        await asyncio.sleep(2)





#다음 페이지 이동 클릭
        await page.get_by_role("button", name="Go to next page").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_7_1_6(1)_25년 10월_페이지 이동클릭.png"),full_page=True)
        print("TC_5_7_1_6(1)_25년 10월_페이지_이동_클릭 :PASS")

#마지막 페이지 이동 클릭
        await page.get_by_role("button", name="Go to End page").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_7_1_6(2)_마지막페이지_이동클릭.png"),full_page=True)
        print("TC_5_7_1_6(2)_마지막페이지_이동_클릭 :PASS")

#이전 페이지 이동 클릭
        await page.get_by_role("button", name="Go to previous page").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_7_1_6(3)_이전페이지 이동클릭.png"),full_page=True)
        print("TC_5_7_1_6(3)_이전페이지 이동_클릭:PASS")

#첫 페이지 이동 클릭
        await page.get_by_role("button", name="Go to start page").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_7_1_6(4)_첫페이지_이동클릭.png"),full_page=True)
        print("TC_5_7_1_6(4)_첫페이지_이동_클릭 :PASS")

#2페이지 입력
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[3]/div/div[2]/form/div[1]/div/input')
        await page.locator('[data-testid="page-input"]').click()
        await asyncio.sleep(1)
        await page.fill('input.w-\\[240px\\]', '2')
        await page.screenshot(path=os.path.join(version_dir, "5_7_1_6(5)_2 페이지 입력.png"),full_page=True)
        print("TC_5_7_1_6(5)_2 페이지_입력 :PASS")

#2페이지 이동
        await page.get_by_text("이동").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_7_1_6(6)_2 페이지 이동.png"),full_page=True)
        print("TC_5_7_1_6(6)_2 페이지_이동 :PASS")

#다운로드 클릭
        await page.get_by_text("다운로드").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_7_2_1_다운로드 클릭.png"),full_page=True)
        print("TC_5_7_2_1_다운로드_클릭 :PASS")

#다운로드 닫기 클릭
        await page.locator("button:has-text('Close')").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_7_2_1(1)_다운로드_x버튼.png.png"),full_page=True)
        print("TC_5_7_2_1(1)_다운로드_x버튼_클릭 :PASS")

#다운로드 클릭
        await page.get_by_text("다운로드").click()
        await asyncio.sleep(1)
        await page.get_by_text("취소").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_7_2_1(2)_다운로드취소.png"),full_page=True)
        print("TC_5_7_2_1(2)_다운로드_취소 :PASS")

#사유 입력
        await page.get_by_text("다운로드").click()
        await asyncio.sleep(1)
        await page.locator('input[name="reason"]').click()
        await page.locator('input[name="reason"]').fill('smoketest')
        await page.screenshot(path=os.path.join(version_dir, "5_7_2_2_다운로드_시유입력.png"),full_page=True)
        print("TC_5_7_2_2_다운로드_시유_입력 :PASS")

        await page.locator("button:has-text('다운로드')").nth(1).click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "5_7_2_3_다운로드_완료.png"),full_page=True)
        print("TC_5_7_2_3_다운로드_완료 :PASS")
        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행