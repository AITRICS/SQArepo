import { test, expect, chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { shot } from "./pre_setting";
import { createUser } from "./pre_setting";
import { dbSelectOne, dbUpdateOrThrow } from "./pre_setting";
import { ADMIN_ID, ADMIN_PASSWORD, MANAGER_ID, MANAGER_PASSWORD } from "./config";
import { Login } from "./pre_setting";

type GeneratedId = { random_regi_id: string };

function readGeneratedId(filePath: string): GeneratedId {
  const raw = fs.readFileSync(filePath, { encoding: "utf-8" });
  return JSON.parse(raw) as GeneratedId;
}

const APPROVE_USER_PW = process.env.APPROVE_USER_PW ?? "change_this!1";
const generatedIdPath = path.resolve(__dirname,  "generated_id.json");
console.log("[BOOT]", new Date().toISOString());

test.describe("TC_002_001", () => {
  test("TC_002_001 Landing Page", async ({ page, browser, baseURL }, testInfo) => {
    if (!fs.existsSync(generatedIdPath)) {
      throw new Error(`generated_id.json not found: ${generatedIdPath}`);
    }

    const { random_regi_id } = readGeneratedId(generatedIdPath);
    console.log("baseURL =", JSON.stringify(process.env.BASE_URL));

    //TC_002_001_1
    await test.step("1) 로그인페이지", async () => {
      await page.goto("/login");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(4000);
      await shot(page, testInfo, "TC_002_001_1_로그인페이지");
      console.log("▶TC_002_001_1_로그인페이지_PASS");
    });

    //TC_002_001_2
    await test.step("2) 계정생성페이지", async () => {
      await page.getByText("계정생성").click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(4000);
      await shot(page, testInfo, "TC_002_001_2_계정생성페이지");
      console.log("▶TC_002_001_2_계정생성페이지_PASS");
    });

    //TC_002_001_3
    await test.step("3) 필수 항목 입력 시, 다음 버튼 활성화", async () => {
      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill(random_regi_id);
      await page.locator('input[name="username"]').press("Tab");
      await page.waitForTimeout(1000);
      await page.locator('input[name="password"]').fill("change_this!1");
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="password-eye-toggle"]').nth(0).click();
      await page.waitForTimeout(1000);
      await page.locator('input[name="password"]').press("Tab");
      await page.locator('input[name="confirmPassword"]').fill("change_this!1");
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="password-eye-toggle"]').nth(1).click();
      await page.waitForTimeout(1000);
      const nextBtn = page.getByText("다음");
      await expect(nextBtn).toBeEnabled();
      await shot(page, testInfo, "TC_002_001_3_필수항목입력_다음버튼활성화");
      console.log("▶TC_002_001_3_필수항목입력_다음버튼활성화_PASS");
      await nextBtn.click();
      await page.waitForTimeout(1000);
    });

    //TC_002_001_4
    await test.step("4) 계정 생성 완료", async () => {
      await page.locator('input[name="name"]').fill(random_regi_id);
      await page.waitForTimeout(1000);
      await page.locator('input[name="phone"]').fill("010-9999-9999");
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="select-user-type-trigger"]').click();
      await page.locator('div[role="option"] >> text=의사').click();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="select-user-group-trigger"]').click();
      await page.locator('div[role="option"] >> text=가정의학과').click();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);
      await page.getByText("다음").click();
      await page.waitForTimeout(1000);
      await page.locator('xpath=//*[@id="isAllAgree"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="next-button"]').click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_001_4_계정생성완료");
      console.log("▶TC_002_001_4_계정생성완료_PASS");
    });

    //TC_002_001_5
    await test.step("5) 로그인 페이지 이동", async () => {
      await shot(page, testInfo, "TC_002_001_5_로그인페이지_이동");
      console.log("▶TC_002_001_5_로그인페이지_이동_PASS");
    });

    //TC_002_001_6
    await test.step("6) 미승인 계정 로그인 5회 시도", async () => {
      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill(random_regi_id);
      await page.waitForTimeout(1000);
      await page.locator('input[name="password"]').click();
      await page.locator('input[name="password"]').fill(APPROVE_USER_PW);
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_001_6_미승인계정_로그인_5회_시도");
      console.log("▶TC_002_001_6_미승인계정_로그인_5회_시도_PASS");
    });

    //TC_002_001_7
  await test.step("7) 등록된 계정 로그인 4회 시도", async () => {
    const userId = "P1test";
    await createUser(page, userId, {
    name: "P1test",
    phone: "010-9999-9999",
    userTypeText: "의사",
    userGroupText: "가정의학과",});

      await page.waitForTimeout(300);
      await dbUpdateOrThrow("accounts_user", { is_active: 1 }, { username: "P1test"});
      await page.waitForTimeout(300);
      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill("P1test");
      await page.waitForTimeout(1000);
      await page.locator('input[name="password"]').click();
      await page.locator('input[name="password"]').fill("c11");
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_001_7_등록계정_로그인_4회_시도");
      console.log("▶TC_002_001_7_등록계정_로그인_4회_시도_PASS");
    });

    //TC_002_001_8
  await test.step("8) 등록된 계정 로그인 5회 시도", async () => {
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_001_8_등록계정_로그인_5회_시도");
      console.log("▶TC_002_001_8_등록계정_로그인_5회_시도_PASS");
    });


    //TC_002_001_9
  await test.step("9) 승인 계정 로그인 성공", async () => {
      await dbUpdateOrThrow("accounts_user", { is_active: 1 }, { username: random_regi_id});
      await page.waitForTimeout(1000);
      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill(random_regi_id);
      await page.waitForTimeout(2000);
      await page.locator('input[name="password"]').click();
      await page.locator('input[name="password"]').fill(APPROVE_USER_PW);
      await page.waitForTimeout(2000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(4000);
      await shot(page, testInfo, "TC_002_001_9_승인계정_로그인_성공");
      console.log("▶TC_002_001_9_승인계정_로그인_성공_PASS");
      await page.locator('[data-testid="logout-button"]').click();
    });

    

//TC_002_001_10
    await test.step("10) manager 계정 4회 로그인 실패 후, 로그인 성공시 실패 횟수 초기화 확인", async () => {
      await page.goto("/login");
      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill(MANAGER_ID);
      await page.waitForTimeout(1000);
      await page.locator('input[name="password"]').click();
      await page.locator('input[name="password"]').fill("11");
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('input[name="password"]').click();
      await page.locator('input[name="password"]').fill(MANAGER_PASSWORD);
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(3000);
      await page.locator('[data-testid="logout-button"]').click();

      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill(MANAGER_ID);
      await page.waitForTimeout(1000);
      await page.locator('input[name="password"]').click();
      await page.locator('input[name="password"]').fill("11");
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(3000);
      await shot(page, testInfo, "TC_002_001_10_manager_계정_로그인횟수_초기화_성공");
      console.log("▶TC_002_001_10_manager_계정_로그인횟수_초기화_PASS");
      
});


//TC_002_001_11
    await test.step("11) manager 계정 5회 로그인 실패 후, 잠김 확인", async () => {
      await page.goto("/login");
      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill(MANAGER_ID);
      await page.waitForTimeout(1000);
      await page.locator('input[name="password"]').click();
      await page.locator('input[name="password"]').fill("11");
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_001_11_manager_계정_로그인시도_5회");
      console.log("▶TC_002_001_11_manager_계정_로그인시도_5회_PASS");
      await page.waitForTimeout(3000);
});


//TC_002_001_12
    await test.step("12) manager 계정 로그인 성공", async () => {
      await dbUpdateOrThrow("accounts_user", { incorrect_password_tries: 0 }, { username: MANAGER_ID});
      await page.waitForTimeout(3000);

      await Login(page, MANAGER_ID, MANAGER_PASSWORD, { loginPath: "/login" });
      await page.waitForTimeout(300);
      await shot(page, testInfo, "TC_002_001_12_manager_계정_로그인_성공");
      console.log("▶TC_002_001_12_manager_계정_로그인_성공_PASS");
      await page.waitForTimeout(3000);
      await page.locator('[data-testid="logout-button"]').click();
});


//TC_002_001_13
  await test.step("13) admin 계정 로그인", async () => {
    await Login(page, ADMIN_ID, ADMIN_PASSWORD, { loginPath: "/login" });
    await page.waitForTimeout(300);
    await shot(page, testInfo, "TC_002_001_13_admin_계정_로그인_성공");
    console.log("▶TC_002_001_13_admin_계정_로그인_성공_PASS");
});


//TC_002_001_14
await test.step("14) admin 계정 로그인 5회 실패 시, 잠기지 않음 확인", async () => {
      await page.locator('[data-testid="logout-button"]').click();
      await page.locator('input[name="username"]').click();
      await page.locator('input[name="username"]').fill(ADMIN_ID);
      await page.waitForTimeout(1000);
      await page.locator('input[name="password"]').click();
      await page.locator('input[name="password"]').fill("11");
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_001_14_admin_계정_로그인 5회_실패_잠기지_않음");
      console.log("▶TC_002_001_14_admin_계정_로그인 5회_실패_잠기지_않음_PASS");
    });    
  });
});