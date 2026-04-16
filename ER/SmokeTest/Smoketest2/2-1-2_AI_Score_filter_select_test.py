import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
import json
import os
from exceptions import ElementNotFoundError, TimeoutError
from log_failure import log_to_file
from pre_setting import login
version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script2"
os.makedirs(version_dir, exist_ok=True)

SCRIPT_NAME = "2-1-2_AI_Score_filter_select_test.py"

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
        await asyncio.sleep(1)
        await page.locator("input[name=\"password\"]").click()
        await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
        await asyncio.sleep(1)
        await page.locator('[data-testid="login-button"]').nth(0).click()


    #중복 로그인 예외처리
    
        try:
            await page.wait_for_selector("//h2[text()='중복 로그인 안내']", timeout=3000)
            await asyncio.sleep(1)
            await page.get_by_text("예").click()



            await page.wait_for_load_state('networkidle')
            await asyncio.sleep(2)

        except:
            pass
            await asyncio.sleep(2)
            await page.wait_for_load_state('networkidle')


# #admin 로그인
#         await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

#AI Score 필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="AI Score"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[1]')
        except Exception as e:
                log_to_file(
                        f"[오류] AI Score 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("AI Score버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_1(1)_AI Score선택.png"),full_page=True)
        print("TC_2_1_2_1(1)_대시보드_AI Score_선택 :PASS")

#AI Socre_BRES 필터 선택
        try:
                # await page.click('xpath=//*[@id="BRES_g"]')
                await page.locator('#BRES_g').click()
        except Exception as e:
                log_to_file(
                        f"[오류] AI Score BRES 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("AI Score BRES 필터 클릭 중 오류 발생") from e
        
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_1(2)_AI Score BRES 선택.png"),full_page=True)
        print("TC_2_1_2_1(2)_AI Score BRES_선택 :PASS")
        await page.get_by_text("적용").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_3(1)_AI Score BRES 선택적용.png"),full_page=True)
        print("TC_2_1_2_3(1)_AI Score BRES_선택_적용 :PASS")

#AI Score 필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[1]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="AI Score"]').click()

        except Exception as e:
                log_to_file(
                        f"[오류] AI Score 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("AI Score버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#AI Socre_PRES 필터 선택
        await page.locator('#BRES_g').click()
        try:
                await page.locator('#PRES_g').click()
        except Exception as e:
                log_to_file(
                        f"[오류] AI Score PRES 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("AI Score PRES 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_1(3)_AI Score PRES 선택.png"),full_page=True)
        print("TC_2_1_2_1(3)_AI Score PRES_선택 :PASS")
        await page.get_by_text("적용").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_3(2)_AI Score PRES 선택적용.png"),full_page=True)
        print("TC_2_1_2_3(2)_AI Score PRES_선택_적용 :PASS")

#AI Score 필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[1]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="AI Score"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] AI Score 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("AI Score버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#AI Socre_CRES 필터 선택
        await page.locator('#PRES_g').click()
        try:
                await page.locator('#CRES_g').click()
        except Exception as e:
                log_to_file(
                        f"[오류] AI Score CRES 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("AI Score CRES 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_1(4)_AI Score CRES 선택.png"),full_page=True)
        print("TC_2_1_2_1(4)_AI Score CRES_선택 :PASS")
        await page.get_by_text("적용").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_3(3)_AI Score CRES 선택적용.png"),full_page=True)
        print("TC_2_1_2_3(3)_AI Score CRES_선택_적용 :PASS")


#AI Score 필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[1]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="AI Score"]').click()

        except Exception as e:
                log_to_file(
                        f"[오류] AI Score 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("AI Score버튼 클릭 중 오류 발생") from e
        
        await asyncio.sleep(1)


#전체선택 적용
        await page.locator('#CRES_g').click()
        await page.click('#allChecked')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_2(1)_AI Score 전체선택.png"),full_page=True)
        print("TC_2_1_2_2(1)_AI Score_전체선택 :PASS")

#취소 클릭
        await page.get_by_text("취소").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_4_AI Score 전체선택_취소.png"),full_page=True)
        print("TC_2_1_2_4_AI Score_전체선택_취소 :PASS")

#AI Score 필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[1]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="AI Score"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] AI Score 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("AI Score버튼 클릭 중 오류 발생") from e
        
        await asyncio.sleep(1)

#전체선택 적용
        await page.click('#allChecked')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_2(2)_AI Score 전체선택.png"),full_page=True)        
        print("TC_2_1_2_2(2)_AI Score 전체선택 :PASS")

#적용 클릭
        await page.get_by_text("적용").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_2_3(4)_AI Score 전체선택적용.png"),full_page=True)
        print("TC_2_1_2_3(4)_AI Score 전체선택_적용 :PASS")

# AI Score 원복
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[1]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="AI Score"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] AI Score 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("AI Score버튼 클릭 중 오류 발생") from e
        
        await asyncio.sleep(1)

        await page.click('#allChecked')
        await asyncio.sleep(1)

        await page.get_by_text("적용").click()
        await asyncio.sleep(1)

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행