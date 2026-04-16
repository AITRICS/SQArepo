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

SCRIPT_NAME = "2-1-3_KTAS_filter_select_test.py"

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
        await page.locator('[data-testid="login-button"]').nth(0).click()


    #중복 로그인 예외처리
    
        try:
            await page.wait_for_selector("//h2[text()='중복 로그인 안내']", timeout=3000)
            await asyncio.sleep(2)
            await page.get_by_text("예").click()
            await page.wait_for_load_state('networkidle')
            await asyncio.sleep(2)

        except:
            pass
            await asyncio.sleep(2)
            await page.wait_for_load_state('networkidle')


        await asyncio.sleep(2)


# #admin 로그인
#         await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)


#KTAS 필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_1(1)_KTAS선택.png"),full_page=True)
        print("TC_2_1_3_1(1)_대시보드_KTAS_선택. :PASS")

#KTAS_1 필터 선택
        try:
                # await page.click('xpath=//*[@id="1"]')
                await page.locator('button[role="checkbox"][id="1"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS_1 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS_1 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_1(2)_KTAS_1선택.png"),full_page=True)
        print("TC_2_1_3_1(2)_KTAS_1_선택 :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_3(1)_KTAS_1선택적용.png"),full_page=True)
        print("TC_2_1_3_3(1)_KTAS_1_선택_적용 :PASS")

#KTAS 필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)

#KTAS_2 필터 선택
        await page.locator('button[role="checkbox"][id="1"]').click()
        try:
                await page.locator('button[role="checkbox"][id="2"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS_2 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS_2 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_1(3)_KTAS_2선택.png"),full_page=True)
        print("TC_2_1_3_1(3)_KTAS_2_선택 :PASS")
        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_3(2)_KTAS_2선택적용.png"),full_page=True)
        print("TC_2_1_3_3(2)_KTAS_2_선택_적용 :PASS")

#KTAS 필터선택
        
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)

#KTAS_3 필터 선택
        await page.locator('button[role="checkbox"][id="2"]').click()
        try:
                await page.locator('button[role="checkbox"][id="3"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS_3 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS_3 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_1(4)_KTAS_3선택.png"),full_page=True)
        print("TC_2_1_3_1(4)_KTAS_3_선택 :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_3(3)_KTAS_3선택적용.png"),full_page=True)
        print("TC_2_1_3_3(3)_KTAS_3_선택_적용 :PASS")

#KTAS 필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')

        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)

#KTAS_4 필터 선택
        await page.locator('button[role="checkbox"][id="3"]').click()
        try:
                await page.locator('button[role="checkbox"][id="4"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS_4 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS_4 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_1(5)_KTAS_4선택.png"),full_page=True)
        print("TC_2_1_3_1(5)_KTAS_4_선택 :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_3(4)_KTAS_4선택적용.png"),full_page=True)
        print("TC_2_1_3_3(4)_KTAS_4_선택_적용 :PASS")

#KTAS 필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)

#KTAS_5 필터 선택
        await page.locator('button[role="checkbox"][id="4"]').click()
        try:
                await page.locator('button[role="checkbox"][id="5"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS_5 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS_5 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_1(6)_KTAS_5선택.png"),full_page=True)
        print("TC_2_1_3_1(6)_KTAS_5_선택 :PASS")
        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_3(5)_KTAS_5선택적용.png"),full_page=True)
        print("TC_2_1_3_3(5)_KTAS_5_선택_적용 :PASS")

#KTAS 필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)

#KTAS_기타(8) 필터 선택
        await page.locator('button[role="checkbox"][id="5"]').click()
        try:
                await page.locator('button[role="checkbox"][id="8"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS_기타(8) 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS_기타(8) 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_1(7)_KTAS_기타(8)선택.png"),full_page=True)
        print("TC_2_1_3_1(7)_KTAS_기타(8)_선택 :PASS")
        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_3(6)_KTAS_기타(8)선택적용.png"),full_page=True)
        print("TC_2_1_3_3(6)_KTAS_기타(8)_선택_적용 :PASS")

#KTAS 필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)

#KTAS_미상(9) 필터 선택
        await page.locator('button[role="checkbox"][id="8"]').click()
        try:
                await page.locator('button[role="checkbox"][id="9"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS_미상(9) 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS_미상(9) 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_1(8)_KTAS_미상(9)선택.png"),full_page=True)
        print("TC_2_1_3_1(8)_KTAS_미상(9)_선택 :PASS")
        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_3(7)_KTAS_미상(9)선택적용.png"),full_page=True)
        print("TC_2_1_3_3(7)_KTAS_미상(9)_선택_적용 :PASS")

#KTAS 필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)


#취소 클릭
        await page.get_by_text("취소").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_4_KTAS 취소.png"),full_page=True)
        print("TC_2_1_3_4_KTAS_취소 :PASS")

#KTAS 필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)

#전체선택 적용
        await page.locator('button[role="checkbox"][id="9"]').click()
        await page.click('#allChecked')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_2(1)_KTAS 전체선택.png"),full_page=True)
        print("TC_2_1_3_2(1)_KTAS 전체선택 :PASS")


        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_3_3(8)_KTAS 전체선택적용.png"),full_page=True)
        print("TC_2_1_3_3(8)_KTAS 전체선택_적용 :PASS")

#KTAS 필터 원복
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="KTAS"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[2]')
        except Exception as e:
                log_to_file(
                        f"[오류] KTAS 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("KTAS 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(2)
        await page.click('#allChecked')
        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        
async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행