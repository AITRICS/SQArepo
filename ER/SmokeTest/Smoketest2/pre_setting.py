# login.py
import asyncio
import config
import json
import pymysql
from playwright.async_api import async_playwright, Playwright
from playwright.sync_api import sync_playwright


#admin 계정 로그인 함수
async def login(page, user_id, password):
    await page.goto(config.BASE_URL)


    await page.wait_for_timeout(3000)


    await page.locator("input[name=\"username\"]").click()
    await page.fill('input[name="username"]', config.ADMIN_ID)
    await asyncio.sleep(1)
    await page.locator("input[name=\"username\"]").press("Tab")
    await page.fill('input[name="password"]', config.ADMIN_PASSWORD)
    await asyncio.sleep(2)
    await page.locator('[data-testid="login-button"]').nth(0).click()
    # await page.click('xpath=/html/body/div[3]/div[2]/div/div[1]/form/div[3]/button')

    #중복 로그인 예외처리
    try:
        
        await page.wait_for_selector("//h2[text()='중복 로그인 안내']", timeout=3000)
        await asyncio.sleep(1)
        await page.get_by_text("예").click()


        await page.wait_for_load_state('networkidle')


    except:
         pass

    # 로그인 완료 대기
    
    await asyncio.sleep(1)



#생성된 계정 로그인 함수
async def approve_login(page, user_id, password):
    await page.goto(config.BASE_URL)

    with open("generated_id.json", "r") as f:
                data = json.load(f)

    random_regi_id = data["random_regi_id"]
    await page.locator("input[name=\"username\"]").click()
    await page.fill('input[name="username"]', random_regi_id)
    await page.locator("input[name=\"username\"]").press("Tab")
    await page.fill('input[name="password"]', config.APPROVE_USER_PW)
    
    await page.locator('[data-testid="login-button"]').nth(0).click()

    #중복 로그인 예외처리
    try:
        
        allow_button = page.locator("button:has-text('중복')")
        await allow_button.wait_for(timeout=3000)
        await allow_button.click()
    except:
        pass

    # 로그인 완료 대기
    await page.wait_for_load_state('networkidle')



#admin 페이지 로그인 함수
async def admin_page_login(page, user_id, password):
    await page.goto(config.ADMIN_URL)

    await page.locator("input[name=\"username\"]").click()
    await page.fill('input[name="username"]', config.ADMIN_PAGE_ID)
    await asyncio.sleep(1)
    await page.locator("input[name=\"username\"]").press("Tab")
    await page.fill('input[name="password"]', config.ADMIN_PAGE_PASSWORD)
    await asyncio.sleep(1)
    await page.get_by_text("로그인").click()
    

    # 로그인 완료 대기
    
    await asyncio.sleep(1)


#계정 생성 함수
async def create_user(page, user_id: str):
    await page.goto(config.BASE_URL)

    await page.get_by_text("계정생성").click()

    #ID 입력
    await page.locator("input[name=\"username\"]").click()
    await page.locator("input[name=\"username\"]").fill(user_id)

    await page.locator("input[name=\"username\"]").press("Tab")

    #PW 입력
    await page.locator("input[name=\"password\"]").fill("change_this!1")
    await page.locator("input[name=\"password\"]").press("Tab")
    await page.locator("input[name=\"confirmPassword\"]").fill("change_this!1")
    await asyncio.sleep(2)

    #다음 클릭
    await page.get_by_text("다음").click()


    #이름 입력
    await page.locator("input[name=\"name\"]").fill("smoketest2")


    #휴대폰번호 입력
    await page.locator("input[name=\"phone\"]").fill("010-9999-9999")


    #사용자유형 입력
    await page.locator('[data-testid="select-user-type-trigger"]').click()
    await asyncio.sleep(1)
    await page.locator('div[role="option"] >> text=의사').click()
    
    await page.keyboard.press('Escape')
    await asyncio.sleep(2)

    #사용자그룹 입력
    await page.locator('[data-testid="select-user-group-trigger"]').click()
    await asyncio.sleep(1)
    await page.locator('div[role="option"] >> text=가정의학과').click()
    await page.keyboard.press('Escape')
    await asyncio.sleep(2)

    #다음 클릭
    await page.get_by_text("다음").click()


    #서비스약관동의 클릭
    await page.click('xpath=//*[@id="isAllAgree"]')
    await asyncio.sleep(2)
    
    #다음 클릭 >생성 완료
    await page.click('xpath=/html/body/div[3]/div/div/div[2]/form/div[2]/div[1]/button')
    await page.wait_for_load_state('networkidle')
    await asyncio.sleep(2)