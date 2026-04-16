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

SCRIPT_NAME = "2-1-5_Vital_sign_filter_select_test.py"

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
            print("[중복 로그인] 허용 버튼 클릭 완료")

        except:
            print("[중복 로그인] 알림 없음, 정상 로그인 중")
            await asyncio.sleep(2)
            await page.wait_for_load_state('networkidle')

        element = await page.query_selector("//div[3]/div[2]/div/div[2]/div/div[1]")
        await element.evaluate("el => el.scrollLeft = el.scrollWidth - el.clientWidth")
        await asyncio.sleep(2)

#Vital_sign 필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(1)_Vital_sign선택.png"),full_page=True)
        print("TC_2_1_5_1(1)_대시보드_Vital_sign_선택 :PASS")

#Vital_sign_SBP_g 필터 선택
        try:
                # await page.click('xpath=//*[@id="SBP_g"]')
                await page.locator('button[role="checkbox"][id="SBP_g"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign_SBP_g 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign_SBP_g 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(2)_Vital_sign_SBP_g선택.png"),full_page=True)
        print("TC_2_1_5_1(2)_Vital_sign_SBP_g_선택 :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        element = await page.query_selector("//div[3]/div[2]/div/div[2]/div/div[1]")
        await element.evaluate("el => el.scrollLeft = el.scrollWidth")
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(1)_Vital_sign_SBP_g선택적용.png"),full_page=True)
        print("TC_2_1_5_3(1)_Vital_sign_SBP_g_선택_적용 :PASS")

#Vital_sign_필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#Vital_sign_SBP_l 필터 선택
        # await page.click('xpath=//*[@id="SBP_g"]')
        await page.locator('button[role="checkbox"][id="SBP_g"]').click()
        try:
                # await page.click('xpath=//*[@id="SBP_l"]')
                await page.locator('button[role="checkbox"][id="SBP_l"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign_SBP_l 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign_SBP_l 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(3)_Vital_sign_SBP_l선택.png"),full_page=True)
        print("TC_2_1_5_1(3)_Vital_sign_SBP_l_선택 :PASS")


        await page.get_by_text("적용").click()
        element = await page.query_selector("//div[3]/div[2]/div/div[2]/div/div[1]")
        await element.evaluate("el => el.scrollLeft = el.scrollWidth")
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(2)_Vital_sign_SBP_l선택적용.png"),full_page=True)
        print("TC_2_1_5_3(2)_Vital_sign_SBP_l_선택_적용 :PASS")


#Vital_sign_필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)


#Vital_sign_PR_g 필터 선택
        await page.locator('button[role="checkbox"][id="SBP_l"]').click()
        try:
                await page.click('xpath=//*[@id="PR_g"]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign_PR_g 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign_PR_g 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(4)_Vital_sign_PR_g선택.png"),full_page=True)
        print("TC_2_1_5_1(4)_Vital_sign_PR_g_선택 :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(3)_Vital_sign_PR_g선택적용.png"),full_page=True)
        print("TC_2_1_5_3(3)_Vital_sign_PR_g_선택_적용 :PASS")

#Vital_sign_필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#Vital_sign_PR_l 필터 선택
        try:
                await page.click('xpath=//*[@id="PR_g"]')
                await page.click('xpath=//*[@id="PR_l"]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign_PR_l 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign_PR_l 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(5)_Vital_sign_PR_l선택.png"),full_page=True)
        print("TC_2_1_5_1(5)_Vital_sign_PR_l_선택 :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(4)_Vital_sign_PR_l선택적용.png"),full_page=True)
        print("TC_2_1_5_3(4)_Vital_sign_PR_l_선택_적용 :PASS")

#Vital_sign_필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)


#Vital_sign_RR_g 필터 선택
        await page.click('xpath=//*[@id="PR_l"]')
        try:
                await page.click('xpath=//*[@id="RR_g"]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign_RR_g 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign_RR_g 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(6)_Vital_sign_RR_g선택.png"),full_page=True)
        print("TC_2_1_5_1(6)_Vital_sign_RR_g_선택 :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(5)_Vital_sign_RR_g선택적용.png"),full_page=True)
        print("TC_2_1_5_3(5)_Vital_sign_RR_g_선택_적용 :PASS")

#Vital_sign_필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#Vital_sign_RR_l 필터 선택
        await page.click('xpath=//*[@id="RR_g"]')
        try:
                await page.click('xpath=//*[@id="RR_l"]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign_RR_l 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign_RR_l 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(7)_Vital_sign_RR_l선택.png"),full_page=True)
        print("TC_2_1_5_1(7)_Vital_sign_RR_l_선택 :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(6)_Vital_sign_RR_l선택적용.png"),full_page=True)
        print("TC_2_1_5_3(6)_Vital_sign_RR_l_선택_적용 :PASS")

#Vital_sign_필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)


#Vital_sign_BT_g 필터 선택
        await page.click('xpath=//*[@id="RR_l"]')
        try:
                await page.click('xpath=//*[@id="BT_g"]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign_BT_g 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign_BT_g 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(8)_Vital_sign_BT_g선택.png"),full_page=True)
        print("TC_2_1_5_1(8)_Vital_sign_BT_g_선택 :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(7)_Vital_sign_BT_g선택적용.png"),full_page=True)
        print("TC_2_1_5_3(7)_Vital_sign_BT_g_선택_적용 :PASS")

#Vital_sign_필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')

        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#Vital_sign_RR_l 필터 선택
        await page.click('xpath=//*[@id="BT_g"]')
        try:
                await page.click('xpath=//*[@id="BT_l"]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign_BT_l 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign_BT_l 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(9)_Vital_sign_BT_l선택.png"),full_page=True)
        print("TC_2_1_5_1(9)_Vital_sign_BT_l_선택. :PASS")

        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(8)_Vital_sign_BT_l선택적용.png"),full_page=True)
        print("TC_2_1_5_3(8)_Vital_sign_BT_l_선택_적용 :PASS")
        
#Vital_sign_필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#Vital_sign_SpO2_l 필터 선택
        await page.click('xpath=//*[@id="BT_l"]')
        try:
                await page.click('xpath=//*[@id="SpO2_l"]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign_SpO2_l 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign_SpO2_l 필터 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_1(10)_Vital_sign_SpO2_l선택.png"),full_page=True)
        print("TC_2_1_5_1(10)_Vital_sign_SpO2_l_선택 :PASS")
        
        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(9)_Vital_sign_SpO2_l선택적용.png"),full_page=True)
        print("TC_2_1_5_3(9)_Vital_sign_SpO2_l_선택_적용 :PASS")

#Vital_sign_필터선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

        await page.get_by_text("취소").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_4_Vital_sign_취소.png"),full_page=True)
        print("TC_2_1_5_4_Vital_sign_취소 :PASS")


#Vital_sign_필터선택
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#전체선택 적용
        await page.click('xpath=//*[@id="SpO2_l"]')
        await page.click('#allChecked')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_2_Vital_sign_전체_선택.png"),full_page=True)
        print("TC_2_1_5_2_Vital_sign_전체_선택 :PASS")
        
        await page.get_by_text("적용").click()
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "2_1_5_3(10)_Vital_sign_전체구역선택적용.png"),full_page=True)
        print("TC_2_1_5_3(10)_Vital_sign_전체_선택_적용 :PASS")


#Vital_sigm 원복
        try:
                await page.locator('[data-testid="filter-trigger"]''[data-filter-label="Vital sign"]').click()
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/div[2]/button[4]')
        except Exception as e:
                log_to_file(
                        f"[오류] Vital_sign 필터 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("Vital_sign 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.click('#allChecked')
        await asyncio.sleep(1)
        await page.get_by_text("적용").click()
        await asyncio.sleep(2)


async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행