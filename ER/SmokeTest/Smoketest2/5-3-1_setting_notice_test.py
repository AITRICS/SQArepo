import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
import json
import os



version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script5"
os.makedirs(version_dir, exist_ok=True)


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
    #     await asyncio.sleep(1)
    #     await page.locator("input[name=\"password\"]").click()
    #     await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
    #     await asyncio.sleep(1)
    #     await page.locator('[data-testid="login-button"]').nth(1).click()
    #     await asyncio.sleep(1)

    # #중복 로그인 예외처리
    #     try:
    #         allow_button = page.locator("button:has-text('중복')") 
    #         await page.get_by_text("예").click()
    #         await asyncio.sleep(2)
    #         print("[중복 로그인] 허용 버튼 클릭 완료")

    #     except:
    #         print("[중복 로그인] 알림 없음, 정상 로그인 중")

    #     await page.wait_for_load_state('networkidle')  # 로그인 완료 대기
    #     await asyncio.sleep(2)

    
#Admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

    #Setting 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(1)
        
    #공지사항 클릭
        await page.get_by_text("공지사항").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_3_1_1_공지사항.png"),full_page=True)
        print("TC_5_3_1_1_Setting_공지사항_진입 :PASS")

    #공지사항 리스트 선택 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/table/tbody/tr[1]/td[2]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_3_1_2_공지사항_리스트선택.png"),full_page=True)
        print("TC_5_3_1_2_공지사항_리스트_선택 :PASS")

    #공지사항 리스트 목록으로 클릭
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[4]/div/button/div[1]')
        await page.get_by_role("button", name="목록으로").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_3_1_3_공지사항_리스트_목록으로_클릭.png"),full_page=True)  
        print("TC_5_3_1_3_공지사항_리스트_목록으로_클릭 :PASS")

    #다음 페이지 이동 클릭
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/div/nav/ul/div[2]/li[1]/button')
        await page.get_by_role("button", name="Go to next page").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_3_1(4)_페이지 이동클릭.png"),full_page=True)
        print("TC_5_3_1(4)_페이지 이동_클릭 :PASS")

    #마지막 페이지 이동 클릭
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/div/nav/ul/div[2]/li[2]/button')
        await page.get_by_role("button", name="Go to End page").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_3_1(5)_마지막페이지_이동클릭.png"),full_page=True)
        print("TC_5_3_1(5)_마지막페이지_이동_클릭 :PASS")

    #이전 페이지 이동 클릭
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/div/nav/ul/div[1]/li[2]/button')
        await page.get_by_role("button", name="Go to previous page").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_3_1(6)_이전페이지 이동클릭.png"),full_page=True)
        print("TC_5_3_1(6)_이전페이지_이동_클릭 :PASS")

    #첫 페이지 이동 클릭
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/div/nav/ul/div[1]/li[1]/button')
        await page.get_by_role("button", name="Go to start page").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_3_1(7)_첫페이지_이동클릭.png"),full_page=True)
        print("TC_5_3_1(7)_첫페이지_이동_클릭 :PASS")

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행