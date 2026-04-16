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

SCRIPT_NAME = "5-6-1_setting_alarm_range_test.py"

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script5"
os.makedirs(version_dir, exist_ok=True)

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
        await page.get_by_text("알람 설정").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_1_Setting_알람설정_진입.png"),full_page=True)
        print("TC_5_6_1_1_Setting_멤버 관리_진입 :PASS")

#SBP 입력
        await page.locator('input[name="INITIAL_SBP_l"]').nth(1).click()
        await page.locator('input[name="INITIAL_SBP_l"]').nth(1).fill('70')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_2(1)_SBP_70입력.png"),full_page=True)
        print("TC_5_6_1_2(1)_SBP_70_입력 :PASS")

        await page.locator('input[name="INITIAL_SBP_g"]').nth(0).click()
        await page.locator('input[name="INITIAL_SBP_g"]').nth(0).fill('260')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_2(2)_SBP_260입력.png"),full_page=True)
        print("TC_5_6_1_2(2)_SBP_260_입력 :PASS")
        

#PR 입력
        await page.locator('input[name="INITIAL_PR_l"]').nth(1).click()
        await page.locator('input[name="INITIAL_PR_l"]').nth(1).fill('70')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_3(1)_PR_70입력.png"),full_page=True)
        print("TC_5_6_1_3(1)_PR_70_입력 :PASS")

        await page.locator('input[name="INITIAL_PR_g"]').nth(0).click()
        await page.locator('input[name="INITIAL_PR_g"]').nth(0).fill('260')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_3(2)_PR_260입력.png"),full_page=True)
        print("TC_5_6_1_3(2)_PR_260_입력 :PASS")

#RR 입력
        await page.locator('input[name="INITIAL_RR_l"]').nth(1).click()
        await page.locator('input[name="INITIAL_RR_l"]').nth(1).fill('10')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_4(1)_RR_10입력.png"),full_page=True)
        print("TC_5_6_1_4(1)_RR_10_입력 :PASS")

        await page.locator('input[name="INITIAL_RR_g"]').nth(0).click()
        await page.locator('input[name="INITIAL_RR_g"]').nth(0).fill('26')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_4(2)_RR_26입력.png"),full_page=True)
        print("TC_5_6_1_4(2)_RR_26_입력 :PASS")

#BT 입력
        await page.locator('input[name="INITIAL_BT_l"]').nth(1).click()
        await page.locator('input[name="INITIAL_BT_l"]').nth(1).fill('33')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_5(1)_BT_33입력.png"),full_page=True)
        print("TC_5_6_1_5(1)_BT_33_입력 :PASS")

        await page.locator('input[name="INITIAL_BT_g"]').nth(0).click()
        await page.locator('input[name="INITIAL_BT_g"]').nth(0).fill('37')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_5(2)_BT_37입력.png"),full_page=True)
        print("TC_5_6_1_5(2)_BT_37_입력 :PASS")

#sp02 입력
        await page.locator('input[name="INITIAL_SpO2_l"]').nth(1).click()
        await page.locator('input[name="INITIAL_SpO2_l"]').nth(1).fill('101')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_6(1)_SpO2_101입력.png"),full_page=True)
        print("TC_5_6_1_6(1)_SpO2_101_입력 :PASS")

#저장버튼
        await page.locator("button:has-text('저장')").click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[7]/div[2]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_7_저장클릭.png"),full_page=True)
        print("TC_5_6_1_7_저장_클릭 :PASS")

#초기화버튼
        await page.locator("button:has-text('초기화')").click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[7]/div[1]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_8_초기화클릭.png"),full_page=True)
        print("TC_5_6_1_8_초기화_클릭 :PASS")

#초기화버튼 닫기
        await page.locator("button:has-text('Close')").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_9(1)초기화_x버튼.png.png"),full_page=True)
        print("TC_5_6_1_9(1)초기화_x버튼_클릭 :PASS")

#초기화버튼
        await page.locator("button:has-text('초기화')").click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[7]/div[1]/button')
        await asyncio.sleep(1)
        await page.locator('//div[text()="아니오"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_9(2)_초기화팝업_아니오_클릭.png"),full_page=True)
        print("TC_5_6_1_9(2)_초기화팝업_아니오_클릭 :PASS")


#초기화 예 버튼 클릭
        await page.locator("button:has-text('초기화')").click()
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[7]/div[1]/button')
        await asyncio.sleep(1)
        await page.locator('//div[text()="예"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_6_1_10_초기화팝업_예_클릭.png"),full_page=True)
        print("TC_5_6_1_10_초기화팝업_예_클릭 :PASS")

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행