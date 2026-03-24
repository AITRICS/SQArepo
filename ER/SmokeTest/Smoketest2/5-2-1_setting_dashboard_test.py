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

    # #생성된 계정으로 로그인
    #     base_dir = os.path.dirname(os.path.abspath(__file__))
    #     file_path = os.path.join(base_dir, "generated_id.json")
    #     with open(file_path, "r", encoding="utf-8") as f:
    #             data = json.load(f)
    #     random_regi_id = data["random_regi_id"]
    #     await page.locator("input[name=\"username\"]").click()
    #     await page.locator("input[name=\"username\"]").fill(random_regi_id)
    #     await asyncio.sleep(1)
    #     await page.locator("input[name=\"password\"]").click()
    #     await page.locator("input[name=\"password\"]").fill(config.APPROVE_USER_PW)
    #     await asyncio.sleep(1)
    #     await page.get_by_text("로그인").click()
    #     await asyncio.sleep(1)

    # #중복 로그인 예외처리
    #     try:
    #         allow_button = page.locator("button:has-text('중복')") 
    #         await page.get_by_text("예").click()
    #         await asyncio.sleep(2)
    #         print("[중복 로그인] 허용 버튼 클릭 완료")

    #     except:
    #         print("[중복 로그인] 알림 없음, 정상 로그인 중")
    #     await asyncio.sleep(2)

    
#Admin 로그인
        await login(page, config.ADMIN_ID, config.ADMIN_PASSWORD)

    #Setting 진입
        await page.get_by_text("Settings").click()
        await asyncio.sleep(2)
        
    #대시보드_화면설정 클릭
        await page.get_by_role("button", name="대시보드 화면 설정").click()
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_1_대시보드_화면설정_진입.png"),full_page=True)
        print("TC_5_2_1_1(1)_Setting_대시보드_화면설정_진입 :PASS")
        
    #초기화버튼
        await page.get_by_role("button", name="초기화").click()
        await asyncio.sleep(1)
        await page.locator('//div[text()="예"]').click()
        await asyncio.sleep(1)


    #Area_off
        await page.click('xpath=//*[@id="Area-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_2_Area_off.png"),full_page=True)
        print("TC_5_2_1_2_Area_off :PASS")

    #Bed_off
        await page.click('xpath=//*[@id="Bed-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_3_Bed_off.png"),full_page=True)
        print("TC_5_2_1_3_Bed_off :PASS")

    #Alarm type_off
        await page.click('xpath=//*[@id="Alarm type-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_4_Alarm type_off.png"),full_page=True)
        print("TC_5_2_1_4_Alarm type_off :PASS")

    #Alarm date_off
        await page.click('xpath=//*[@id="Alarm date-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_5_Alarm date_off.png"),full_page=True)
        print("TC_5_2_1_5_Alarm date_off :PASS")

    #BRES_off
        await page.click('xpath=//*[@id="BRES-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_6_BRES_off.png"),full_page=True)
        print("TC_5_2_1_6_BRES_off :PASS")

    #PRES_off
        await page.click('xpath=//*[@id="PRES-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_7_PRES_off.png"),full_page=True)
        print("TC_5_2_1_7_PRES_off :PASS")

    #CRES_off
        await page.click('xpath=//*[@id="CRES-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_8_CRES_off.png"),full_page=True)
        print("TC_5_2_1_8_CRES_off :PASS")

    #ER Arrival date_off
        await page.click('xpath=//*[@id="ER Arrival date-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_9_ER Arrival date_off.png"),full_page=True)
        print("TC_5_2_1_9_ER Arrival date_off :PASS")

    #KTAS_off
        await page.click('xpath=//*[@id="KTAS-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_10_KTAS_off.png"),full_page=True)
        print("TC_5_2_1_10_KTAS_off :PASS")

    #Chief Complaint_off
        await page.click('xpath=//*[@id="Chief Complaint-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_11_Chief Complaint_off.png"),full_page=True)
        print("TC_5_2_1_11_Chief Complaint_off :PASS")

    #SBP_off
        await page.click('xpath=//*[@id="SBP-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_12_SBP_off.png"),full_page=True)
        print("TC_5_2_1_12_SBP_off :PASS")

    #DBP_off
        await page.click('xpath=//*[@id="DBP-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_13_DBP_off.png"),full_page=True)
        print("TC_5_2_1_13_DBP_off :PASS")

    #PR_off
        await page.click('xpath=//*[@id="PR-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_14_PR_off.png"),full_page=True)
        print("TC_5_2_1_14_PR_off :PASS")

    #RR_off
        await page.click('xpath=//*[@id="RR-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_15_RR_off.png"),full_page=True)
        print("TC_5_2_1_15_RR_off :PASS")

    #BT_off
        await page.click('xpath=//*[@id="BT-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_16_BT_off.png"),full_page=True)
        print("TC_5_2_1_16_BT_off :PASS")


    #SpO2_off
        await page.click('xpath=//*[@id="SpO2-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_17_SpO2_off.png"),full_page=True)
        print("TC_5_2_1_17_SpO2_off :PASS")

    #Mental status_off
        await page.click('xpath=//*[@id="Mental status-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_18_Mental status_off.png"),full_page=True)
        print("TC_5_2_1_18_Mental status_off :PASS")

    #PRES_on
        await page.click('xpath=//*[@id="PRES-switch"]')
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_1_19_PRES_on.png"),full_page=True)
        print("TC_5_2_1_19_PRES_on :PASS")

    # Drag KTAS
        LIST_ITEM_SEL = '.flex.flex-col.w-full.h-\\[40px\\]'
        LABEL_SEL = '.text-body-base-500.text-text-primary'
        DRAG_HANDLE_SEL = 'svg[role="button"][aria-roledescription="sortable"]'

        async def move_item_to_top(page, label_text="KTAS"):
            # 리스트 아이템들
            items = page.locator(LIST_ITEM_SEL)
            # 라벨이 label_text인 아이템
            target_item = items.filter(has=page.locator(f'{LABEL_SEL}:has-text("{label_text}")')).first
            # 맨 위 아이템
            top_item = items.first

            await target_item.wait_for()
            await top_item.wait_for()

            # 드래그 핸들 (cursor-grab 아이콘)
            handle = target_item.locator(DRAG_HANDLE_SEL)
            await handle.wait_for()

            # 방법 A: drag_to (HTML5 DnD 지원 시)
            try:
                await handle.drag_to(top_item, target_position={"x": 10, "y": 10})
                return
            except Exception:
                pass

            # 방법 B: 마우스 동작으로 강제 드래그(커스텀 DnD일 때 유용)
            hb = await handle.bounding_box()
            tb = await top_item.bounding_box()
            assert hb and tb, "bounding_box를 가져오지 못했습니다."

            # 현재 핸들 위치에서 버튼 누르고
            await page.mouse.move(hb["x"] + hb["width"]/2, hb["y"] + hb["height"]/2)
            await page.mouse.down()
            # 리스트 맨 위 근처로 이동(살짝 위쪽으로)
            await page.mouse.move(tb["x"] + 10, tb["y"] + 5, steps=20)
            await page.mouse.up()

        await move_item_to_top(page, "KTAS")
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_3_1_순서변경.png"),full_page=True)
        print("TC_5_2_3_1_순서_변경 :PASS")

    #저장버튼
        await page.get_by_role("button", name="저장").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_3_2_저장클릭.png"),full_page=True)
        print("TC_5_2_3_2_저장_클릭 :PASS")

    #초기화버튼
        await page.get_by_role("button", name="초기화").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_2_1_초기화클릭.png"),full_page=True)       
        print("TC_5_2_2_1_초기화_클릭 :PASS")

    #초기화팝업 X 버튼 클릭
        await page.locator("button:has-text('Close')").click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_2_2())_초기화팝업_x버튼클릭.png"),full_page=True)
        print("TC_5_2_2_2())_초기화팝업_x버튼_클릭 :PASS")

    #초기화 아니오 버튼 클릭
        await page.get_by_role("button", name="초기화").click()
        await asyncio.sleep(1)
        await page.locator('//div[text()="아니오"]').click()
        
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_2_2(2)_초기화팝업_아니오_클릭.png"),full_page=True)
        print("TC_5_2_2_2(2)_초기화팝업_아니오_클릭 :PASS")

    #초기화 예 버튼 클릭
        await page.get_by_role("button", name="초기화").click()
        await asyncio.sleep(1)
        await page.locator('//div[text()="예"]').click()
        await asyncio.sleep(1)
        await page.screenshot(path=os.path.join(version_dir, "5_2_2_3_초기화팝업_예_클릭.png"),full_page=True)
        print("TC_5_2_2_3_초기화팝업_예_클릭 :PASS")

        await context.close() # 콘텍스트 종료
        await browser.close() # 브라우저 종료

async def main():
        async with async_playwright() as playwright:
                await run1(playwright)


if __name__ == "__main__":
        asyncio.run(main()) #실행