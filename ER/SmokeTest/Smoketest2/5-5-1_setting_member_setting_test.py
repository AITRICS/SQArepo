import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
from exceptions import ElementNotFoundError, TimeoutError
from log_failure import log_to_file
import os
from pre_setting import create_user
import json

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script5"
os.makedirs(version_dir, exist_ok=True)


SCRIPT_NAME = "5-5-1_setting_member_setting_test.py"

async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})

#테스트용 계정 생성
        await create_user(page,"smoketest2")
        print("계정 생성완료") 

#Admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)


#Setting 클릭
        await page.get_by_text("Settings").click()
        await asyncio.sleep(1)
#계정 관리 클릭
        await page.get_by_text("계정 관리").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_5_1_1_멤버 관리 진입.png"),full_page=True)
        print("TC_5_5_1_1_Setting_멤버 관리_진입 :PASS")


#테스트용 계정 승인
        await page.click("//tr[td//div[text()='smoketest2']]//button[div[text()='계정 승인']]")
        # await page.click('xpath=/html/body/div[2]/div[2]/div/div[2]/div/div/div[3]/div/div/table/tbody/tr[15]/td[8]/div/button/div[2]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_5_1_2_계정 승인.png"),full_page=True)
        print("TC_5_5_1_2_계정 승인 :PASS")

#계정 선택
        try:
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        except Exception as e:
                log_to_file(f"페이지 스크롤 오류: {e}", script_name=SCRIPT_NAME)
                raise Exception("페이지 스크롤 중 오류 발생") from e
        await asyncio.sleep(2)

        try:
                await page.get_by_text("smoketest2").nth(1).click()
        except Exception:
                log_to_file(f"[오류] 요소 클릭 실패: {config.DELETE_USER_ID}", script_name=SCRIPT_NAME)
                raise ElementNotFoundError(text="smoketest2")
        

#사용자유형 드랍다운 버튼 선택
        try:
                await page.locator('[data-testid="select-user-type-trigger"]').click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_5_2_1_사용자유형_드랍다운_선택.png"),full_page=True)
                print("TC_5_5_2_1_사용자유형_드랍다운_선택 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 사용자유형  드랍다운 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("사용자유형 드랍다운 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#간호사 선택
        try:
                await page.locator('[role="option"]', has_text="간호사").click()
        except Exception as e:
                log_to_file(
                        f"[오류] 간호사 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("간호사 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_5_2_2_간호사_선택.png"),full_page=True)
        print("TC_5_5_2_2_간호사_선택 :PASS")

#사용자소속 드랍다운 버튼 선택
        try:
                # await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[3]/div[5]/button')
                await page.locator('[data-testid="select-user-group-trigger"]').click()
                await asyncio.sleep(1)
                await page.screenshot(path=os.path.join(version_dir, "5_5_2_3_사용자소속_드랍다운_선택.png"),full_page=True)
                print("TC_5_5_2_3_사용자소속_드랍다운_선택 :PASS")

        except Exception as e:
                log_to_file(
                        f"[오류] 사용자소속 드랍다운 버튼 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("사용자소속 드랍다운 버튼 클릭 중 오류 발생") from e
        await asyncio.sleep(1)

#응급실 선택
        try:
                await page.locator('[role="option"]', has_text="응급실").click()
        except Exception as e:
                log_to_file(
                        f"[오류] 응급실 클릭 실패: {e.__class__.__name__}: {e}",
                        script_name=SCRIPT_NAME)
                raise Exception("응급실 클릭 중 오류 발생") from e
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_5_2_4_응급실_선택.png"),full_page=True)
        print("TC_5_5_2_4_응급실_선택 :PASS")

        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[4]/div/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_5_2_5_저장.png"),full_page=True)
        print("TC_5_5_2_5_사용자 그룹_소속_저장 :PASS")





#계정정보_닫기 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[1]/button')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_5_3_1_계정정보_닫기 클릭.png"),full_page=True)
        print("TC_5_5_3_1_계정정보_닫기_클릭 :PASS")

#계정 선택
        try:
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        except Exception as e:
                log_to_file(f"페이지 스크롤 오류: {e}", script_name=SCRIPT_NAME)
                raise Exception("페이지 스크롤 중 오류 발생") from e
        await asyncio.sleep(2)

        try:
                await page.get_by_text("smoketest2").nth(1).click()
        except Exception:
                log_to_file(f"[오류] 요소 클릭 실패: {config.DELETE_USER_ID}", script_name=SCRIPT_NAME)
                raise ElementNotFoundError(text="smoketest2")
        

#계정 삭제 진행
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[1]/div[1]/button/div[2]')
        await asyncio.sleep(1)
        await page.locator('//div[text()="삭제"]').click()
        await asyncio.sleep(1) 




#테스트용 계정 선택
#생성된 계정 클릭
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "generated_id.json")
        with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

        random_regi_id = data["random_regi_id"]

        try:
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        except Exception as e:
                log_to_file(f"페이지 스크롤 오류: {e}", script_name=SCRIPT_NAME)
                raise Exception("페이지 스크롤 중 오류 발생") from e
        await asyncio.sleep(1)

        try:
                await page.click(f"text={random_regi_id}")
        except Exception:
                log_to_file(f"[오류] 요소 클릭 실패: {config.DELETE_USER_ID}", script_name=SCRIPT_NAME)
                raise ElementNotFoundError(f"text={config.DELETE_USER_ID}")
                

#계정 삭제 진행
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[1]/div[1]/button/div[2]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_5_1_3_계정삭제_선택.png"),full_page=True)
        print("TC_5_5_1_3_계정삭제_선택 :PASS")

        await page.locator('//div[text()="삭제"]').click()
        await asyncio.sleep(1) 
        await page.screenshot(path=os.path.join(version_dir, "5_5_1_4_계정삭제_완료.png"),full_page=True)
        print("TC_5_5_1_4_계정삭제_완료 :PASS")



        

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료





async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행