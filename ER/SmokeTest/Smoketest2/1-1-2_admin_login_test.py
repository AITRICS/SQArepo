import asyncio
from playwright.async_api import async_playwright, Playwright
import xml.etree.ElementTree as ET
from datetime import datetime
import config
from pre_setting import login
from playwright.async_api import TimeoutError as PlaywrightTimeoutError, Error as PlaywrightError
import os

version = config.VERSION
version_dir = fr"Z:\SmokeTest\ER\SmokeTest2\v1.0.0\{version}\script1"
os.makedirs(version_dir, exist_ok=True)

async def run1(playwright: Playwright) -> None:

        browser = await playwright.chromium.launch(headless=False, args=['--autoplay-policy=no-user-gesture-required'])
        context = await browser.new_context()

        page = await context.new_page()

        await page.goto(config.BASE_URL)
        
#admin 로그인
        await page.set_viewport_size({'width': 1920, 'height': 1080})
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

        await page.screenshot(path=os.path.join(version_dir, "1_1_2_1_Admin_로그인완료.png"),full_page=True)
        print("TC_1_1_2_1_Admin_로그인완료 :PASS")
        await asyncio.sleep(2)


        await context.close()
        await browser.close()

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main())