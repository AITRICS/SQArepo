
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
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script3"
os.makedirs(version_dir, exist_ok=True)

SCRIPT_NAME = "3-6-1_patient_detail_select_history_test.py"

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
        # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/form/div[3]/button')
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


    #검색버튼 클릭
        await page.locator('[data-testid="gnb-search-button"]').click()
        await asyncio.sleep(1)

    #id 클릭
        await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[1]/div[2]')
        await asyncio.sleep(1)
        await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[2]/div/input')
        await asyncio.sleep(1)
        await page.fill('input[placeholder="환자 검색"]', '02510311300011')
        await asyncio.sleep(1)
        await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[2]/div/div')
        await asyncio.sleep(1)


    #퇴실 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[3]/button[2]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "3_6_1_1(1)_중복재실id 검색.png"),full_page=True)
        print("TC_3_6_1_1(1)_중복재실id_검색 :PASS")


    #상세 진입
        async with context.expect_page() as new_page_info:
            await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div[4]/div/div[1]/table/tbody/tr[1]/td[3]/span')
      
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state('domcontentloaded')
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "3_6_1_1(2)_중복재실id 클릭.png"),full_page=True)
        print("TC_3_6_1_1(2)_중복재실id_클릭 :PASS")

#주의사항팝업 예외처리
    
        try:
            await new_tab.locator("//h2[text()='주의사항']").wait_for(state="visible", timeout=3000)
            print("주의사항팝업 존재")
            await new_tab.click("text=오늘 하루 그만보기")

            await new_tab.wait_for_load_state('networkidle')
            await asyncio.sleep(1)
            await new_tab.screenshot(path=os.path.join(version_dir, "3_6_1_1(3)_주의사항팝업_오늘하루그만보기.png"),full_page=True)
            
            print("TC_3_6_1_1(3)_주의사항팝업_오늘하루그만보기_클릭 :PASS")

        except:
            print("주의사항팝업 없음")
            print("TC_3_6_1_1(3)_주의사항팝업_없음 :PASS")
            await asyncio.sleep(2)
            await new_tab.wait_for_load_state('networkidle')

            
    #내원이력 클릭
        # await new_tab.click('xpath=/html/body/div[3]/div[2]/div/div/div/div[1]/div/div[2]/div[1]/div/button/div[2]/span')
        await new_tab.locator('[data-testid="duration-dropdown-trigger"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_6_1_1(4)_내원이력선택.png"),full_page=True)        
        print("TC_3_6_1_1(4)_내원이력_선택 :PASS")



    #내원이력 선택
        # await new_tab.click('xpath=//*[@id="radix-«r4»"]/button[2]')
        await new_tab.locator('[data-testid="duration-dropdown-item-0202510311300011|025103113000112"]').click()
    
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_6_1_1(5)_다른내원이력선택.png"),full_page=True)        
        print("TC_3_6_1_1(5)_다른 내원이력_선택 :PASS")

# #주의사항팝업 예외처리
    
#         try:
#             await new_tab.locator("//h2[text()='주의사항']").wait_for(state="visible", timeout=3000)
#             print("주의사항팝업 존재")
#             await new_tab.click("text=오늘 하루 그만보기")

#             await new_tab.wait_for_load_state('networkidle')
#             await asyncio.sleep(1)
#             await new_tab.screenshot(path=os.path.join(version_dir, "3_1_2_1(2)_주의사항팝업_오늘하루그만보기.png"),full_page=True)
#             print("주의사항팝업_오늘하루그만보기 버튼 클릭 완료")

#         except:
#             print("주의사항팝업 없음")
#             await asyncio.sleep(2)
#             await new_tab.wait_for_load_state('networkidle')

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행