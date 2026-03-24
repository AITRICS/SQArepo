import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
import json
import html 
import os

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script1"
os.makedirs(version_dir, exist_ok=True)


async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False) 
        context = await browser.new_context()
        page = await context.new_page()
        await page.goto(config.BASE_URL)
        
#admin 로그인
        await page.set_viewport_size({'width': 1920, 'height': 1080})
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)
        

#setting 진입
        await page.get_by_text("Settings").click()

#계정관리 진입
        await page.get_by_text("계정 관리").click()
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(1000)

#생성된 계정 클릭
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "generated_id.json")
        with open(file_path, "r") as f:
                data = json.load(f)

        random_regi_id = data["random_regi_id"]
        await page.click(f"text={random_regi_id}")
        await asyncio.sleep(2)
        

#임시비밀번호 발급 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[1]/div[2]/button/div[2]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_5_9_1_임시비밀번호 발급_클릭.png"),full_page=True)
        print("TC_1_5_9_1_임시비밀번호 발급_클릭 :PASS")


#임시비밀번호 발급 취소 클릭
        await page.locator('//div[text()="취소"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_5_9_2(1)_임시비밀번호_발급취소.png"),full_page=True)
        print("TC_1_5_9_2(1)_임시비밀번호_발급_취소 :PASS")

#임시비밀번호 발급 x버튼 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[1]/div[2]/button/div[2]')
        await asyncio.sleep(1)
        await page.locator("button:has-text('Close')").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_5_9_2(2)_임시비밀번호_발급_x버튼.png"),full_page=True)
        print("TC_1_5_9_2(2)_임시비밀번호_발급_x버튼_클릭 :PASS")

#임시비밀번호 발급 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[1]/div[2]/button/div[2]')
        await asyncio.sleep(1)
        await page.locator('(//button[.//div[text()="임시 비밀번호 발급"]])[2]').click()
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "1_5_9_3_임시비밀번호_발급완료.png"),full_page=True)
        print("TC_1_5_9_3_임시비밀번호_발급_완료 :PASS")

#임시비밀번호 발급 완료 x버튼 클릭
        
        await page.locator("button:has-text('Close')").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_5_9_4_임시비밀번호_발급완료_x버튼.png"),full_page=True)
        print("TC_1_5_9_4_임시비밀번호_발급완료_x버튼_클릭 :PASS")

#임시비밀번호 발급 클릭
        await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div/div[5]/div[2]/div[1]/div[2]/button/div[2]')
        await asyncio.sleep(2)
        await page.locator('(//button[.//div[text()="임시 비밀번호 발급"]])[2]').click()
        await asyncio.sleep(3)
        await page.screenshot(path=os.path.join(version_dir, "1_5_9_5(1)_임시비밀번호_발급완료.png"),full_page=True)
        print("TC_1_5_9_5(1)_임시비밀번호_발급_완료 :PASS")
        password_locator = page.locator('//div[contains(@class, "text-text-secondary")]')

#임시번호 텍스트 추출
        xpath = (
        '//div[contains(@class, "flex") and contains(@class, "items-center") '
        'and contains(@class, "mt-[32px]") and contains(@class, "px-[12px]") '
        'and contains(@class, "w-full") and contains(@class, "h-[36px]") '
        'and contains(@class, "border") and contains(@class, "border-border-enabled") '
        'and contains(@class, "rounded-[6px]") and contains(@class, "text-body-base-400") '
        'and contains(@class, "text-text-secondary")]'
)
        password_locator = page.locator(f'xpath={xpath}')
        raw_password = await password_locator.inner_text()


        print(f"추출된 임시 비밀번호: {raw_password}")

        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, "temp_password.txt")

        with open(file_path, "w", encoding="utf-8") as f:
                f.write(raw_password)

#임시비밀번호 복사 클릭
        await page.locator("button:has-text('비밀번호 복사')").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_5_9_5(2)_임시비밀번호_복사.png"),full_page=True)
        print("TC_1_5_9_5(2)_임시비밀번호_복사_클릭 :PASS")

#임시비밀번호 발급 닫기 클릭
        await page.locator('//div[text()="닫기"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "1_5_9_5(3)_임시비밀번호_닫기.png"),full_page=True)
        print("TC_1_5_9_5(3)_임시비밀번호_닫기_클릭 :PASS")

        await context.close()
        await browser.close()

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main())