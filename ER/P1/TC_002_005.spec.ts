import { test, expect, type Page,type Browser, chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { shot } from "./pre_setting";
import { createUser, Login, adminPageLogin } from "./pre_setting";
import { dbSelectOne, dbUpdateOrThrow } from "./pre_setting";
import { ADMIN_ID, ADMIN_PASSWORD, MANAGER_ID, MANAGER_PASSWORD, ADMIN_PAGE_ID, ADMIN_PAGE_PASSWORD, ADMIN_URL } from "./config";

console.log("[BOOT pre_setting]", new Date().toISOString());

type GeneratedId = { random_regi_id: string };

function readGeneratedId(filePath: string): GeneratedId {
  const raw = fs.readFileSync(filePath, { encoding: "utf-8" });
  return JSON.parse(raw) as GeneratedId;
}

const APPROVE_USER_PW = process.env.APPROVE_USER_PW ?? "change_this!1";

// tests 폴더 기준으로 ../script/generated_id.json
const generatedIdPath = path.resolve(__dirname,  "generated_id.json");

test.describe("TC_002_005", () => {
  test("TC_002_005 Dashboard Options", async ({ page }, testInfo) => {
    if (!fs.existsSync(generatedIdPath)) {
      throw new Error(`generated_id.json not found: ${generatedIdPath}`);
    }

    const { random_regi_id } = readGeneratedId(generatedIdPath);
    console.log("baseURL =", JSON.stringify(process.env.BASE_URL));

    await test.step("1) 상단 GNB 메뉴 확인", async () => {
      await page.goto("/login");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);

      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill(random_regi_id);
      await page.waitForTimeout(300);

      await page.locator('input[name="password"]').click();
      await page.locator('input[name="password"]').fill(APPROVE_USER_PW);
      await page.waitForTimeout(300);

      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      
      try {
  
  const dupLoginHeader = page.locator(`xpath=//h2[text()='중복 로그인 안내']`);
  await dupLoginHeader.waitFor({ timeout: 3000 });

  await page.waitForTimeout(1000);
  await page.getByText("예").click();


  await page.waitForLoadState("networkidle");
} catch {
}
      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_005_1_상단 GNB 메뉴 확인");
      console.log("▶TC_002_005_1_상단 GNB 메뉴 확인_PASS");
    });


//TC_002_002_2
  await test.step("2) 검색 페이지 이동", async () => {

    await page.locator('[data-testid="gnb-search-button"]').click();
    await page.waitForTimeout(2000);
    await page.locator('input[placeholder="환자 검색"]').fill('11');
    await page.waitForTimeout(2000);
    await page.locator('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[2]/div/div').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_2_검색_이동_성공");
    console.log("▶TC_002_005_2_검색_이동_PASS");
});

  await test.step("3) 뒤로가기 클릭", async () => {
    await page.locator('[data-testid="search-back-button"]').click();
    await page.waitForTimeout(1000);
    await shot(page, testInfo, "TC_002_005_3_검색_뒤로가기_성공");
    console.log('▶TC_002_005_3_검색_뒤로가기_PASS');
  });


await test.step("4) 검색 결과가 없는 경우 확인", async () => {
    await page.locator('[data-testid="gnb-search-button"]').click();
    await page.waitForTimeout(2000);
    await page.locator('input[placeholder="환자 검색"]').fill('11111111');
    await page.waitForTimeout(2000);
    await page.locator('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[2]/div/div').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_4_검색 결과가 없는 경우");
    console.log("▶TC_002_005_4_검색 결과가 없는 경우_PASS");
});

await test.step("5) 환자 검색 결과 정렬 기능 확인", async () => {
    await page.locator('[data-testid="search-input"]').fill('11')
    await page.waitForTimeout(2000);
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: '검색' }).click();
    await page.waitForTimeout(2000);

    await page.locator('[data-sort-id="PATIENT_ID"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_5_환자 검색 결과_PID_정렬(1)");
    console.log("▶TC_002_005_5_환자 검색 결과_PID_정렬(1)_PASS");

    await page.locator('[data-sort-id="PATIENT_ID"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_5_환자 검색 결과_PID_정렬(2)");
    console.log("▶TC_002_005_5_환자 검색 결과_PID_정렬(2)_PASS");


    await page.locator('[data-sort-id="NAME"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_5_환자 검색 결과_PNAME_정렬(1)");
    console.log("▶TC_002_005_5_환자 검색 결과_PNAME_정렬(1)_PASS");

    await page.locator('[data-sort-id="NAME"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_5_환자 검색 결과_PNAME_정렬(2)");
    console.log("▶TC_002_005_5_환자 검색 결과_PNAME_정렬(2)_PASS");

    await page.locator('[data-sort-id="ADMISSION_DT"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_5_환자 검색 결과_ER Arrival date_정렬(1)");
    console.log("▶TC_002_005_5_환자 검색 결과_ER Arrival date_정렬(1)_PASS");

    await page.locator('[data-sort-id="ADMISSION_DT"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_5_환자 검색 결과_ER Arrival date_정렬(2)");
    console.log("▶TC_002_005_5_환자 검색 결과_ER Arrival date_정렬(2)_PASS");
});

await test.step("6) 관찰 환자 필터 기본값 확인", async () => {
    await page.getByText("Dashboard").click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_6_관찰 환자 필터_기본값_확인");
    console.log("▶TC_002_005_6_관찰 환자 필터_기본값 확인_PASS");
  });

await test.step("7) 관찰 환자 필터 기본값 확인", async () => {
    await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/tbody/tr[1]/td[1]');
    await page.waitForTimeout(1000);
    await page.locator('[data-testid="observing-filter-toggle"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_7_관찰 환자 필터_설정");
    console.log("▶TC_002_005_7_관찰 환자 필터_설정_PASS");
    await page.locator('[data-testid="observing-filter-toggle"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_7_관찰 환자 필터_설정_해제");
    console.log("▶TC_002_005_7_관찰 환자 필터_설정_해제_PASS");

    await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/tbody/tr[1]/td[1]');
    await page.waitForTimeout(1000); 
  });



await test.step("8) 대시보드 필터 탭 표시 확인", async () => {
    await page.locator('[data-testid="filter-trigger"][data-filter-label="AI Score"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_8_대시보드 필터_AI Score_탭_표시_확인");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_탭 표시 확인_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="KTAS"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_8_대시보드 필터_KTAS_탭_표시_확인");
    console.log("▶TC_002_005_8_대시보드 필터_KTAS_탭 표시 확인_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Mental status"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_8_대시보드 필터_Mental status_탭_표시_확인");
    console.log("▶TC_002_005_8_대시보드 필터_Mental status_탭 표시 확인_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_8_대시보드 필터_Vital sign_탭_표시_확인");
    console.log("▶TC_002_005_8_대시보드 필터_Vital sign_탭 표시 확인_PASS");
  });


await test.step("9) 대시보드 AI Score 필터 적용", async () => {
    await page.locator('[data-testid="filter-trigger"][data-filter-label="AI Score"]').click();
    await page.waitForTimeout(2000);
    await page.locator('#BRES_g').click();
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_BRES_필터 설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_BRES_필터 설정_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="AI Score"]').click();
    await page.waitForTimeout(2000);
    await page.locator('#BRES_g').click();
    await page.locator('#CRES_g').click();
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_CRES_필터 설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_CRES_필터 설정_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="AI Score"]').click();
    await page.waitForTimeout(2000);
    await page.locator('#CRES_g').click();
    await page.locator('#PRES_g').click();
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_PRES_필터 설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_PRES_필터 설정_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="AI Score"]').click();
    await page.waitForTimeout(2000);
    await page.locator('#PRES_g').click();
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);

  });

await test.step("10) 대시보드 KTAS 필터 적용", async () => {
    await page.locator('[data-testid="filter-trigger"][data-filter-label="KTAS"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="1"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_KTAS_1_설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_KTAS_1_설정_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="KTAS"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="1"]').click()
    await page.locator('button[role="checkbox"][id="2"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_KTAS_2_설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_KTAS_2_설정_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="KTAS"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="2"]').click()
    await page.locator('button[role="checkbox"][id="3"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_KTAS_3_설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_KTAS_3_설정_PASS");    

    await page.locator('[data-testid="filter-trigger"][data-filter-label="KTAS"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="3"]').click()
    await page.locator('button[role="checkbox"][id="4"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_KTAS_4_설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_KTAS_4_설정_PASS"); 

    await page.locator('[data-testid="filter-trigger"][data-filter-label="KTAS"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="4"]').click()
    await page.locator('button[role="checkbox"][id="5"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_KTAS_5_설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_KTAS_5_설정_PASS"); 

    await page.locator('[data-testid="filter-trigger"][data-filter-label="KTAS"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="5"]').click()
    await page.locator('button[role="checkbox"][id="8"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_KTAS_기타_설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_KTAS_기타_설정_PASS"); 

    await page.locator('[data-testid="filter-trigger"][data-filter-label="KTAS"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="8"]').click()
    await page.locator('button[role="checkbox"][id="9"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_9_대시보드 필터_AI Score_KTAS_미상_설정");
    console.log("▶TC_002_005_8_대시보드 필터_AI Score_KTAS_미상_설정_PASS"); 

    await page.locator('[data-testid="filter-trigger"][data-filter-label="KTAS"]').click();
    await page.waitForTimeout(2000);

    await page.locator('button[role="checkbox"][id="9"]').click()
    await page.getByText('적용').click();

  });


await test.step("11) 대시보드 Vital Sign 필터 적용", async () => {
    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="SBP_g"]').click()
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_11_대시보드 필터_Vital Sign_SBP_g_설정");
    console.log("▶TC_002_005_11_대시보드 필터_AI Score_SBP_g_설정_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="SBP_g"]').click()
    await page.locator('button[role="checkbox"][id="SBP_l"]').click()
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_11_대시보드 필터_Vital Sign_SBP_l_설정");
    console.log("▶TC_002_005_11_대시보드 필터_AI Score_SBP_l_설정_PASS");


    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(1000);
    await page.locator('button[role="checkbox"][id="SBP_l"]').click();
    await page.click('xpath=//*[@id="PR_g"]');
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_11_대시보드 필터_Vital Sign_PR_g_선택_적용");
    console.log("▶TC_002_005_11_대시보드 필터_Vital Sign_PR_g_선택_적용_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(1000);
    await page.click('xpath=//*[@id="PR_g"]');
    await page.click('xpath=//*[@id="PR_l"]');
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_11_대시보드 필터_Vital Sign_PR_l_선택_적용");
    console.log("▶TC_002_005_11_대시보드 필터_Vital Sign_PR_l_선택_적용_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(1000);
    await page.click('xpath=//*[@id="PR_l"]');
    await page.click('xpath=//*[@id="RR_g"]');
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_11_대시보드 필터_Vital Sign_RR_g_선택_적용");
    console.log("▶TC_002_005_11_대시보드 필터_Vital Sign_RR_g_선택_적용_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(1000);
    await page.click('xpath=//*[@id="RR_g"]');
    await page.click('xpath=//*[@id="RR_l"]');
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_11_대시보드 필터_Vital Sign_RR_l_선택_적용");
    console.log("▶TC_002_005_11_대시보드 필터_Vital Sign_RR_l_선택_적용_PASS");


    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(1000);
    await page.click('xpath=//*[@id="RR_l"]');
    await page.click('xpath=//*[@id="BT_g"]');
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_11_대시보드 필터_Vital Sign_BT_g_선택_적용");
    console.log("▶TC_002_005_11_대시보드 필터_Vital Sign_BT_g_선택_적용_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(1000);
    await page.click('xpath=//*[@id="BT_g"]');
    await page.click('xpath=//*[@id="BT_l"]');
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_11_대시보드 필터_Vital Sign_BT_l_선택_적용");
    console.log("▶TC_002_005_11_대시보드 필터_Vital Sign_BT_l_선택_적용_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(1000);
    await page.click('xpath=//*[@id="BT_l"]');
    await page.click('xpath=//*[@id="SpO2_l"]');
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_11_대시보드 필터_Vital Sign_BT_l_선택_적용");
    console.log("▶TC_002_005_11_대시보드 필터_Vital Sign_BT_l_선택_적용_PASS");


    await page.locator('[data-testid="filter-trigger"][data-filter-label="Vital sign"]').click();
    await page.waitForTimeout(1000);
    await page.click('xpath=//*[@id="SpO2_l"]');
    await page.locator('button').getByText('적용').click();
    await page.waitForTimeout(2000);
  });

await test.step("12) 대시보드 Mental Status 필터 적용", async () => {
    await page.locator('[data-testid="filter-trigger"][data-filter-label="Mental status"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="Alert"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_12_대시보드 필터_Mental Status_Alert_선택_적용");
    console.log("▶TC_002_005_12_대시보드 필터_Mental Status_Alert_선택_적용_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Mental status"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="Alert"]').click()
    await page.locator('button[role="checkbox"][id="Drowsy"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_12_대시보드 필터_Mental Status_Drowsy_선택_적용");
    console.log("▶TC_002_005_12_대시보드 필터_Mental Status_Drowsy_선택_적용_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Mental status"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="Drowsy"]').click()
    await page.locator('button[role="checkbox"][id="Stupor"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_12_대시보드 필터_Mental Status_Stupor_선택_적용");
    console.log("▶TC_002_005_12_대시보드 필터_Mental Status_Stupor_선택_적용_PASS");

    await page.locator('[data-testid="filter-trigger"][data-filter-label="Mental status"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="Stupor"]').click()
    await page.locator('button[role="checkbox"][id="Semicoma"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_12_대시보드 필터_Mental Status_Semicoma_선택_적용");
    console.log("▶TC_002_005_12_대시보드 필터_Mental Status_Semicoma_선택_적용_PASS");


    await page.locator('[data-testid="filter-trigger"][data-filter-label="Mental status"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="Semicoma"]').click()
    await page.locator('button[role="checkbox"][id="Coma"]').click()
    await page.getByText('적용').click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_005_12_대시보드 필터_Mental Status_Coma_선택_적용");
    console.log("▶TC_002_005_12_대시보드 필터_Mental Status_Coma_선택_적용_PASS");


    await page.locator('[data-testid="filter-trigger"][data-filter-label="Mental status"]').click();
    await page.waitForTimeout(2000);
    await page.locator('button[role="checkbox"][id="Coma"]').click()
    await page.getByText('적용').click();

  });

    let adminPage: Page;
    let adminBrowser: Browser; // 상단에 import { type Browser } from "@playwright/test" 추가

    await test.step("13) Score 비활성화 항목 표시 여부 확인", async () => {
      adminBrowser = await chromium.launch({ headless: false });
      const adminContext = await adminBrowser.newContext();
      adminPage = await adminContext.newPage();
      await adminPage.goto(ADMIN_URL);
      await adminPage.setViewportSize({ width: 1920, height: 1080 });

      await adminPageLogin(adminPage, ADMIN_PAGE_ID, ADMIN_PAGE_PASSWORD, { loginPath: "/login" });
      await adminPage.waitForTimeout(1000);

      await adminPage.getByText("데이터 설정").click();
      await adminPage.waitForTimeout(1000);

      await adminPage.getByText("예측모델 관리").click();
      await adminPage.waitForTimeout(1000)

      await adminPage.locator('[data-testid="switch-PRES"]').click();
      await adminPage.waitForTimeout(1000);
      await adminPage.locator('[data-testid="submit-button"]').click();

      await page.waitForTimeout(2000);
      await page.reload();
      await page.waitForTimeout(2000);
      await page.locator('[data-testid="filter-trigger"][data-filter-label="AI Score"]').click();
      await page.waitForTimeout(2000);
      await shot(page, testInfo, "TC_002_005_13_PRES항목 제거_확인");
      console.log('▶TC_002_005_13_PRES항목 제거_확인_PASS');

      await adminPage.locator('[data-testid="switch-PRES"]').click();
      await adminPage.waitForTimeout(1000);
      await adminPage.locator('[data-testid="submit-button"]').click();
      await adminPage.waitForTimeout(1000);




  });


  });
});