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
        await asyncio.sleep(1)

    #중복 로그인 예외처리
        try:
            allow_button = page.locator("button:has-text('중복')") 
            await page.get_by_text("예").click()
            await asyncio.sleep(2)

        except:
            pass

        await asyncio.sleep(1)


    #Setting 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(1)
        
    #제품정보 클릭
        await page.get_by_text("제품정보").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_4_1_1_제품정보.png"),full_page=True)
        print("TC_5_4_1_1_Setting_제품정보_진입 :PASS")
        

    #제품설명서 다운로드 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[2]/div[2]/button')
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "5_4_1_2_제품설명서 다운로드.png"),full_page=True)
        print("TC_5_4_1_2_제품설명서_다운로드 :PASS")

    #서비스이용약관동의 전문 클릭
        async with context.expect_page() as new_page_info:
            await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[3]/div[7]/div[2]/div[1]/button')
    
            await asyncio.sleep(1)
            await page.screenshot(path=os.path.join(version_dir, "5_4_2_1_서비스이용약관_클릭.png"),full_page=True)
            print("TC_5_4_2_1_서비스이용약관_클릭 :PASS")

        await asyncio.sleep(2)
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state()
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "5_4_2_2_서비스이용약관_클릭.png"),full_page=True)  
        print("TC_5_4_2_2_서비스이용약관_확인 :PASS")
        
        await new_tab.close()
        await page.bring_to_front()
        await asyncio.sleep(1)


    #개인정보처리방침 클릭
        async with context.expect_page() as new_page_info:
            await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[3]/div[7]/div[2]/div[2]/button')
            await page.screenshot(path=os.path.join(version_dir, "5_4_2_3_개인정보처리방침_클릭.png"),full_page=True)
            print("TC_5_4_2_3_개인정보처리방침_클릭 :PASS")

        await asyncio.sleep(1)
        new_tab = await new_page_info.value
        await new_tab.wait_for_load_state()
        await new_tab.set_viewport_size({'width': 1920, 'height': 1080})
        await new_tab.screenshot(path=os.path.join(version_dir, "5_4_2_4_개인정보처리방침_클릭.png"),full_page=True)  
        print("TC_5_4_2_4_개인정보처리방침_확인 :PASS")
        await new_tab.close()
        await page.bring_to_front()
        await asyncio.sleep(1)

        await page.click('xpath=/html/body/div[3]/div[1]/div[2]/div[3]/button')
        await asyncio.sleep(1)
        
        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행