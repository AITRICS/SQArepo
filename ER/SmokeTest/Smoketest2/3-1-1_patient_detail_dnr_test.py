
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

SCRIPT_NAME = "3-1-1_patient_detail_dnr_test.py"

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


    #상세 진입
        async with context.expect_page() as new_page_info:
            await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/tbody/tr[6]/td[3]')
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state('domcontentloaded')
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_1(1)_상세진입.png"),full_page=True)
        print("TC_3_1_1_1(1)_상세_진입 :PASS")
        
    #DNR 버튼 클릭
        try:
                await new_tab.click("button:has-text('DNR')")
                await asyncio.sleep(1)
                await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_1(2)_DNR클릭.png"),full_page=True)  
                print("TC_3_1_1_1(2)_DNR_클릭 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] DNR 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("DNR 버튼 클릭 중 오류 발생") from e

    #DNR History 클릭
        await new_tab.click('xpath=//button[div/div[text()="DNR History"]]')
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_2(1)_DNR_history클릭.png"),full_page=True)
        print("3_1_1_2(1)_DNR_history_클릭 :PASS")

        scrollable_div = await new_tab.query_selector(
    "div.px-\\[32px\\].max-h-\\[800px\\].overflow-y-auto"
)

        if scrollable_div:
            await new_tab.evaluate('(element) => element.scrollTop = element.scrollHeight', scrollable_div)
        else:
            print("스크롤 가능한 div를 찾을 수 없습니다.")
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_2(2)_DNR_history스크롤.png"),full_page=True)
        print("TC_3_1_1_2(2)_DNR_history_스크롤 :PASS")

    #X버튼 클릭
        await new_tab.get_by_role("button", name="Close").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_3(1)_DNR_x버튼클릭.png"),full_page=True)
        print("TC_3_1_1_3(1)_DNR_x버튼_클릭 :PASS")

    #취소버튼 클릭
        await new_tab.click("button:has-text('DNR')")
        await asyncio.sleep(1)
        await new_tab.locator('//div[text()="취소"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_3(2)_DNR_취소버튼클릭.png"),full_page=True) 
        print("TC_3_1_1_3(2)_DNR_취소버튼_클릭: PASS")

    #제1호서식 사유 선택
        await new_tab.click("button:has-text('DNR')")
        await asyncio.sleep(1)
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[2]/div')
        await new_tab.get_by_role("checkbox", name="별지 제1호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(1)_제1호서식_사유선택.png"),full_page=True)      
        print("TC_3_1_1_4(1)_제1호서식_사유_선택: PASS")

    #사유 선택취소
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[2]/div')
        await new_tab.get_by_role("checkbox", name="별지 제1호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(2)_제1호서식_사유선택취소.png"),full_page=True)
        print("TC_3_1_1_4(2)_제1호서식_사유_선택_취소: PASS")

  #제9호서식 사유 선택
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[3]/div')
        await new_tab.get_by_role("checkbox", name="별지 제9호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(3)_제9호서식_사유선택.png"),full_page=True)      
        print("TC_3_1_1_4(3)_제9호서식_사유_선택: PASS")

    #사유 선택취소
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[3]/div')
        await new_tab.get_by_role("checkbox", name="별지 제9호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(4)_제9호서식_사유선택취소.png"),full_page=True)
        print("TC_3_1_1_4(4)_제9호서식_사유_선택_취소: PASS")

  #제10호서식 사유 선택
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[4]/div')
        await new_tab.get_by_role("checkbox", name="별지 제10호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(5)_제10호서식_사유선택.png"),full_page=True)      
        print("TC_3_1_1_4(5)_제10호서식_사유_선택: PASS")

    #사유 선택취소
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[4]/div')
        await new_tab.get_by_role("checkbox", name="별지 제10호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(6)_제10호서식_사유선택취소.png"),full_page=True)
        print("TC_3_1_1_4(6)_제10호서식_사유_선택_취소: PASS")


  #제11호서식 사유 선택
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[5]/div')
        await new_tab.get_by_role("checkbox", name="별지 제11호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(7)_제11호서식_사유선택.png"),full_page=True)      
        print("TC_3_1_1_4(7)_제11호서식_사유_선택 :PASS")

    #사유 선택취소
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[5]/div')
        await new_tab.get_by_role("checkbox", name="별지 제11호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(8)_제11호서식_사유선택취소.png"),full_page=True)
        print("TC_3_1_1_4(8)_제11호서식_사유_선택_취소 :PASS")

  #제12호서식 사유 선택
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[6]/div')
        await new_tab.get_by_role("checkbox", name="별지 제12호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(9)_제12호서식_사유선택.png"),full_page=True)      
        print("TC_3_1_1_4_저장_클릭 :PASS")

    #사유 선택취소
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[6]/div')
        await new_tab.get_by_role("checkbox", name="별지 제12호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(10)_제12호서식_사유선택취소.png"),full_page=True)
        print("TC_3_1_1_4(10)_제12호서식_사유_선택_취소 :PASS")

  #제13호서식 사유 선택
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[7]/div')
        await new_tab.get_by_role("checkbox", name="별지 제13호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(11)_제13호서식_사유선택.png"),full_page=True)      
        print("TC_3_1_1_4(11)_제13호서식_사유_선택 :PASS")

    #사유 선택취소
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[7]/div')
        await new_tab.get_by_role("checkbox", name="별지 제13호서식 확인").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_4(12)_제13호서식_사유선택취소.png"),full_page=True)
        print("TC_3_1_1_4(12)_제13호서식_사유_선택_취소:PASS")


    #직접입력 선택
        # await new_tab.click('xpath=//*[@id="radix-«r0»"]/div[2]/div[3]/form/section/div[8]/div/div[1]')
        await new_tab.get_by_role("checkbox", name="직접 입력").click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_5(1)_직접입력선택.png"),full_page=True)
        print("TC_3_1_1_5(1)_직접입력_선택 :PASS")

    #직접입력
        await new_tab.locator("input[name=\"direct-input-text\"]").fill("dnrtest")
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_5(2)_직접입력.png"),full_page=True)
        print("TC_3_1_1_5(2)_직접입력 :PASS")

    #저장 클릭     
        await new_tab.locator('//div[text()="저장"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_6_동의_저장클릭.png"),full_page=True) 
        print("TC_3_1_1_6_동의_저장_클릭 :PASS")


    #DNR 원복
        try:
                await new_tab.click("button:has-text('DNR')")
                await asyncio.sleep(1)
        except Exception as e:
                log_to_file(
                        f"[오류] DNR 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("DNR 버튼 클릭 중 오류 발생") from e
        
        await new_tab.locator('//div[text()="저장"]').click()
        await asyncio.sleep(1)
        await new_tab.screenshot(path=os.path.join(version_dir, "3_1_1_7_비동의_저장클릭.png"),full_page=True) 
        print("TC_3_1_1_7_비동의_저장_클릭 :PASS")

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행