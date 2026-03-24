import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
import json
import os

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script1"
os.makedirs(version_dir, exist_ok=True)


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

    #임시비밀번호 발급된 계정으로 로그인
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "generated_id.json")
        with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        random_regi_id = data["random_regi_id"]

        await page.locator("input[name=\"username\"]").click()
        await page.locator("input[name=\"username\"]").fill(random_regi_id)
        await asyncio.sleep(2)



        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "temp_password.txt")
        with open(file_path, "r", encoding="utf-8") as f:
            temp_password = f.read().strip()

        await page.locator("input[name=\"password\"]").click()
        await page.locator("input[name=\"password\"]").fill(temp_password)
        await asyncio.sleep(2)
        await page.locator('[data-testid="password-eye-toggle"]').click()
        await asyncio.sleep(2)
        await page.locator('[data-testid="login-button"]').nth(0).click()

    #중복 로그인 예외처리
        try:
            await page.wait_for_selector("//h2[text()='중복 로그인 안내']", timeout=3000)
            await asyncio.sleep(2)
            await page.get_by_text("예").click()
            await asyncio.sleep(2)
            

        except:
            pass


        await asyncio.sleep(2)


    #이전 비밀번호 입력
        await page.locator("input[name=\"oldPassword\"]").click()
        await page.locator("input[name=\"oldPassword\"]").fill(temp_password)
        await asyncio.sleep(1)
        await page.locator('[data-testid="password-eye-toggle"]').nth(0).click()
        await asyncio.sleep(1)

    #변경 비밀번호 입력
        await page.locator("input[name=\"newPassword\"]").click()
        await page.locator("input[name=\"newPassword\"]").fill(config.APPROVE_USER_PW)
        await asyncio.sleep(1)
        await page.locator('[data-testid="password-eye-toggle"]').nth(1).click()
        await asyncio.sleep(1)

    #비밀번호 확인 인력
        await page.locator("input[name=\"confirmPassword\"]").click()
        await page.locator("input[name=\"confirmPassword\"]").fill(config.APPROVE_USER_PW)
        await asyncio.sleep(1)
        await page.locator('[data-testid="password-eye-toggle"]').nth(2).click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_5_11_1_비밀번호변경.png"),full_page=True)
        print("TC_1_5_11_1_비밀번호변경_팝업 :PASS")
        await page.get_by_text("저장").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_5_11_2_비밀번호변경_완료.png"),full_page=True)
        print("TC_1_5_11_2_비밀번호변경_완료 :PASS")


    #로그아웃 진행
        await page.locator('[data-testid="logout-button"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_5_11_3_로그아웃_완료.png"),full_page=True)
        print("TC_1_5_11_3_로그아웃_완료 :PASS")

    #변경된 비밀번호로 로그인
        await page.locator("input[name=\"username\"]").click()
        await page.locator("input[name=\"username\"]").fill(random_regi_id)
        await asyncio.sleep(1)
        await page.locator("input[name=\"password\"]").click()
        await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
        await asyncio.sleep(1)
        await page.locator('[data-testid="password-eye-toggle"]').click()
        await asyncio.sleep(2)
        await page.locator('[data-testid="login-button"]').nth(0).click()
        await page.wait_for_load_state('networkidle')  # 로그인 완료 대기
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "1_5_11_4_비밀번호변경계정_로그인.png"),full_page=True)
        print("TC_1_5_11_4_비밀번호변경계정_로그인 :PASS")

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행