import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
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
        await page.locator('[data-testid="password-eye-toggle"]').click()
        await asyncio.sleep(2)
        await page.locator('[data-testid="login-button"]').nth(0).click()
        await asyncio.sleep(2)

    #중복 로그인 예외처리
        try:
            allow_button = page.locator("button:has-text('중복')") 
            await page.get_by_text("예").click()
            await asyncio.sleep(2)

        except:
            pass

        await asyncio.sleep(2)

    #Setting 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(1)

    #비밀번호 변경 클릭
        await page.get_by_text("비밀번호 변경").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_4_8_1_비밀번호변경_진입.png"),full_page=True)
        print("TC_1_4_8_1_비밀번호변경_진입 :PASS")

    #비밀번호 변경 취소 클릭
        await page.get_by_text("취소").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_4_8_2(1)_비밀번호변경_취소.png"),full_page=True)
        print("TC_1_4_8_2(1)_비밀번호변경_취소_클릭 :PASS")


    #비밀번호 변경 x버튼 클릭
        await page.get_by_text("비밀번호 변경").click()
        await asyncio.sleep(1)
        await page.locator("button:has-text('Close')").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_4_8_2(2)_비밀번호변경_x버튼.png.png"),full_page=True)
        print("TC_1_4_8_2(2)_비밀번호변경_x버튼_클릭 :PASS")

    #비밀번호 변경 클릭
        await page.get_by_text("비밀번호 변경").click()

    #이전 비밀번호 입력
        await page.locator("input[name=\"oldPassword\"]").click()
        await page.locator("input[name=\"oldPassword\"]").fill(config.APPROVE_USER_PW)
        await asyncio.sleep(1)

    #비밀번호 show
        await page.locator('[data-testid="password-eye-toggle"]').nth(0).click()


    #변경 비밀번호 입력
        await asyncio.sleep(1)
        await page.locator("input[name=\"newPassword\"]").click()
        await page.locator("input[name=\"newPassword\"]").fill("change_this!!1")
        await asyncio.sleep(1)

    #비밀번호 show
        await page.locator('[data-testid="password-eye-toggle"]').nth(1).click()
        await asyncio.sleep(1)

    #비밀번호 확인 인력
        await page.locator("input[name=\"confirmPassword\"]").click()
        await page.locator("input[name=\"confirmPassword\"]").fill("change_this!!1")
        await asyncio.sleep(1)
        await page.locator('[data-testid="password-eye-toggle"]').nth(2).click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_4_8_3_비밀번호변경.png"),full_page=True)
        print("TC_1_4_8_3_비밀번호변경_입력 :PASS")

    #비밀번호 저장
        await page.get_by_text("저장").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_4_8_4_비밀번호변경_완료.png"),full_page=True)
        print("TC_1_4_8_4_비밀번호변경_완료 :PASS")

    #로그아웃 진행
        await page.locator('[data-testid="logout-button"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_4_8_5(1)_로그아웃_완료.png"),full_page=True)
        print("TC_1_4_8_5(1)_로그아웃_완료 :PASS")

    #변경된 비밀번호로 로그인
        await page.locator("input[name=\"username\"]").click()
        await page.locator("input[name=\"username\"]").fill(random_regi_id)
        await asyncio.sleep(1)
        await page.locator("input[name=\"password\"]").click()
        await page.locator("input[name=\"password\"]").fill("change_this!!1")
        await asyncio.sleep(1)
        await page.locator('[data-testid="password-eye-toggle"]').click()
        await asyncio.sleep(2)
        await page.locator('[data-testid="login-button"]').nth(0).click()
        await asyncio.sleep(2)
        await page.wait_for_load_state('networkidle')  # 로그인 완료 대기
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "1_4_8_5(2)_비밀번호변경계정_로그인.png"),full_page=True)
        print("TC_1_4_8_5(2)_비밀번호변경계정_로그인 :PASS")

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행