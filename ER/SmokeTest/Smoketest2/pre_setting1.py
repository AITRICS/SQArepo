import asyncio
import config
import json
import pymysql
from playwright.async_api import async_playwright, Playwright
from playwright.sync_api import sync_playwright


def get_db_connection():
    return pymysql.connect(
        host='192.168.1.212',
        port=3306,       # 또는 실제 DB 주소
        user='root',
        password='cV72Buj3[m:7hl=@!',
        db='vitalcare',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

    
        
async def run1(playwright: Playwright) -> None:


        browser = await playwright.chromium.launch(headless=False) # 크롬 사용
        context = await browser.new_context()  # 새 콘텍스트 생성 
        page = await context.new_page() # 새 페이지 열기
        await page.goto(config.BASE_URL)
        await page.set_viewport_size({'width': 1920, 'height': 1080})
        
        await asyncio.sleep(2)
    #계정 생성 클릭
        await page.get_by_text("계정생성").click()

    #ID 입력
        await page.locator("input[name=\"username\"]").click()
        await page.locator("input[name=\"username\"]").fill("sohee2")

        await page.locator("input[name=\"username\"]").press("Tab")

    #PW 입력
        await page.locator("input[name=\"password\"]").fill("change_this!1")
        await page.locator("input[name=\"password\"]").press("Tab")
        await page.locator("input[name=\"confirmPassword\"]").fill("change_this!1")


    #다음 클릭
        await page.get_by_text("다음").click()


    #이름 입력
        await page.locator("input[name=\"name\"]").fill("어드민")


    #휴대폰번호 입력
        await page.locator("input[name=\"phone\"]").fill("010-9999-9999")


    #사용자유형 입력
        await page.locator('xpath=/html/body/div[2]/div/div/div[2]/form/div[1]/div[3]/button').click()
        await page.locator('div[role="option"] >> text=의사').click()
    
        await page.keyboard.press('Escape')
        await asyncio.sleep(2)

    #사용자그룹 입력
        await page.click('xpath=/html/body/div[2]/div/div/div[2]/form/div[1]/div[4]/button')
        await page.locator('div[role="option"] >> text=가정의학과').click()
        await page.keyboard.press('Escape')


    #다음 클릭
        await page.get_by_text("다음").click()


    #서비스약관동의 클릭
        await page.click('xpath=//*[@id="isAllAgree"]')

    
    #다음 클릭 >생성 완료
        await page.click('xpath=/html/body/div[2]/div/div/div[2]/form/div[2]/div[1]/button')
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(2)

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료





        conn = get_db_connection()

        try:
            with conn.cursor() as cursor:
                sql = "UPDATE accounts_user SET role = %s WHERE username = %s"
                cursor.execute(sql, ('ROLE_TYPE_ADMIN', 'sohee2'))
                conn.commit()
                print("✅ role 값이 성공적으로 업데이트되었습니다.")
        finally:
            conn.close()

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())