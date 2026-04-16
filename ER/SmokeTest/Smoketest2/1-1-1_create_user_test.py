import asyncio
from playwright.async_api import async_playwright, Playwright, expect
import xml.etree.ElementTree as ET
from datetime import datetime
import config
import json
from log_failure import log_to_file
import os

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script1"
os.makedirs(version_dir, exist_ok=True)


SCRIPT_NAME = "1-1-1_create_user_test.py"


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})
        
        await asyncio.sleep(2)
        
    #계정 생성 클릭
        await page.get_by_text("계정생성").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_1_계정생성_클릭.png"),full_page=True)
        print("TC_1_1_1_1_계정생성_클릭 :PASS")
        
    #뒤로가기 클릭
        # await page.click('.z-button-overlay')
        await page.locator('[data-testid="back-button"]').click()
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_2(1)_뒤로가기_클릭.png"), full_page=True)
        print("TC_1_1_1_2(1)_뒤로가기_클릭 :PASS")

        await asyncio.sleep(1)
        await page.get_by_text("계정생성").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_2(2)_계정생성_클릭.png"), full_page=True)
        print("TC_1_1_1_2(2)_계정생성_클릭 :PASS")


    #로그인 클릭
        await page.get_by_text("로그인").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_2(3)_로그인_클릭.png"), full_page=True)
        print("TC_1_1_1_2(3)_로그인_클릭 :PASS")

    #ID 입력
        await page.get_by_text("계정생성").click()
        await asyncio.sleep(1)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "generated_id.json")
        with open(file_path, "r") as f:
            data = json.load(f)
        random_regi_id = data["random_regi_id"]
        await page.locator("input[name=\"username\"]").click()
        await page.locator("input[name=\"username\"]").fill(random_regi_id)
        await asyncio.sleep(1)
        await page.locator("input[name=\"username\"]").press("Tab")
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_3(1)_ID_입력.png"), full_page=True)
        print("TC_1_1_1_3(1)_ID_입력 :PASS")

    #PW 입력
        await page.locator("input[name=\"password\"]").fill("change_this!1")
        await asyncio.sleep(1)

    #PW show 버튼
        # await page.click("xpath=/html/body/div[3]/div/div/div[2]/form/div[1]/div[2]/div/div")
        await page.locator('[data-testid="password-eye-toggle"]').nth(0).click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_3(2)_PW_입력.png"), full_page=True)
        await asyncio.sleep(1)
        print("TC_1_1_1_3(2)_PW_입력 :PASS")

    #PW 확인 입력
        await page.locator("input[name=\"password\"]").press("Tab")
        await page.locator("input[name=\"confirmPassword\"]").fill("change_this!1")
        await asyncio.sleep(1)

    #PW 확인 show 버튼
        # await page.click("xpath=/html/body/div[3]/div/div/div[2]/form/div[1]/div[2]/div/div")
        await page.locator('[data-testid="password-eye-toggle"]').nth(1).click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_3(3)_PW확인_입력.png"), full_page=True)
        print("TC_1_1_1_3(3)_PW_확인_입력 :PASS")

    #다음 클릭
        await page.get_by_text("다음").click()
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_3(4)_다음_클릭.png"), full_page=True)
        print("TC_1_1_1_3(4)_다음_클릭 :PASS")

    #이름 입력
        await page.locator("input[name=\"name\"]").fill(random_regi_id)
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_3(5)_이름_입력.png"), full_page=True)
        print("TC_1_1_1_3(5)_이름_입력 :PASS")

    #휴대폰번호 입력
        await page.locator("input[name=\"phone\"]").fill("010-9999-9999")
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_3(6)_휴대폰번호_입력.png"), full_page=True)
        print("TC_1_1_1_3(6)_휴대폰번호_입력 :PASS")

    #사용자유형 입력
        # await page.locator('xpath=/html/body/div[3]/div/div/div[2]/form/div[1]/div[3]/button').click()
        await page.locator('[data-testid="select-user-type-trigger"]').click()
        await page.locator('div[role="option"] >> text=의사').click()
    
        await page.keyboard.press('Escape')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_4(1)_사용자유형_입력.png"), full_page=True)
        print("TC_1_1_1_4(1)_사용자유형_입력 :PASS")

    #사용자그룹 입력
        # await page.click('xpath=/html/body/div[3]/div/div/div[2]/form/div[1]/div[4]/button')
        await page.locator('[data-testid="select-user-group-trigger"]').click()
        await page.locator('div[role="option"] >> text=가정의학과').click()
        await page.keyboard.press('Escape')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_4(2)_사용자그룹_입력.png"), full_page=True)
        print("TC_1_1_1_4(2)_사용자그룹_입력 :PASS")


    #다음 클릭
        await page.get_by_text("다음").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_4(3)_다음_클릭.png"), full_page=True)
        print("TC_1_1_1_4(3)_다음_클릭 :PASS")


    #서비스약관동의 클릭
        await page.click('xpath=//*[@id="isAllAgree"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_5(1)_서비스약관동의_클릭.png"), full_page=True)
        print("TC_1_1_1_5(1)_서비스약관동의_클릭 :PASS")

    #서비스이용약관동의 전문 클릭
        async with context.expect_page() as new_page_info:
            await page.locator('[data-testid="step3-terms-button"]').click()
            await page.click("xpath=/html/body/div[3]/div/div/div[2]/form/div[1]/div[4]/div[2]/div/button")
            
        await asyncio.sleep(2)
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state()
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "1_1_1_5(2)_서비스약관동의_전문_클릭.png"), full_page=True)
        print("TC_1_1_1_5(2)_서비스약관동의_전문_클릭 :PASS")

        await asyncio.sleep(2)
        await new_tab.close()
        await page.bring_to_front()
        await asyncio.sleep(1)

    #개인정보 수집 및 이용동의 전문 클릭
        async with context.expect_page() as new_page_info:
            await page.locator('[data-testid="step3-personal-button"]').click()
        await asyncio.sleep(1)
        new_tab = await new_page_info.value 
        await new_tab.wait_for_load_state()
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "1_1_1_5(3)_개인정보_전문_클릭.png"), full_page=True)
        print("TC_1_1_1_5(3)_개인정보_전문_클릭 :PASS")
        await asyncio.sleep(2)
        await new_tab.close()
        await page.bring_to_front()
        await asyncio.sleep(1)
    
    #다음 클릭 >생성 완료
        # await page.get_by_text("계정생성").click()
        # await page.click('xpath=/html/body/div[3]/div/div/div[2]/form/div[2]/div[1]/button')
        await page.locator('[data-testid="next-button"]').click()
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_6_생성완료.png"), full_page=True)
        print("TC_1_1_1_6_생성완료 :PASS")
        await asyncio.sleep(1)


    #미승인된 계정으로 로그인
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "generated_id.json")
        with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

        random_regi_id = data["random_regi_id"]

        await page.locator("input[name=\"username\"]").click()
        await page.locator("input[name=\"username\"]").fill(random_regi_id)
        await asyncio.sleep(1)
        await page.locator("input[name=\"password\"]").click()
        await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
        await asyncio.sleep(1)
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/form/div[3]/button/div[1]')
        await page.locator('[data-testid="login-button"]').click()
        
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_1_1_7_미승인계정_로그인불가.png"), full_page=True)
        print("TC_1_1_1_7_미승인계정_로그인불가 :PASS")

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행