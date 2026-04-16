import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { shot } from "./pre_setting";
import { createUser } from "./pre_setting";
import { dbSelectOne, dbUpdateOrThrow } from "./pre_setting";
console.log("[BOOT pre_setting]", new Date().toISOString());

type GeneratedId = { random_regi_id: string };

function readGeneratedId(filePath: string): GeneratedId {
  const raw = fs.readFileSync(filePath, { encoding: "utf-8" });
  return JSON.parse(raw) as GeneratedId;
}

const APPROVE_USER_PW = process.env.APPROVE_USER_PW ?? "change_this!1";

// tests 폴더 기준으로 ../script/generated_id.json
const generatedIdPath = path.resolve(__dirname,  "generated_id.json");

test.describe("TC_002_002", () => {
  test("TC_002_002 Home", async ({ page }, testInfo) => {
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
      await shot(page, testInfo, "TC_002_002_1_상단 GNB 메뉴 확인");
      console.log("▶TC_002_002_1_상단 GNB 메뉴 확인_PASS");
    });


//TC_002_002_2
  await test.step("2) page 이동", async () => {

    await page.waitForTimeout(300);
    await shot(page, testInfo, "TC_002_002_2_대시보드_이동_성공");
    console.log("▶TC_002_002_2_대시보드_이동_PASS");

    await page.getByText("Report").click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_002_2_Report_이동_성공");
    console.log("▶TC_002_002_2_Report_이동_PASS");

    await page.getByText("Settings").click();
    await page.waitForTimeout(2000);
    await shot(page, testInfo, "TC_002_002_2_Settings_이동_성공");
    console.log("▶TC_002_002_2_Settings_이동_PASS");

  await page.locator('[data-testid="gnb-search-button"]').click();
  await page.waitForTimeout(2000);
  await page.locator('input[placeholder="환자 검색"]').fill('11');
  await page.waitForTimeout(2000);
  await page.locator('xpath=/html/body/div[3]/div[1]/div[2]/div[1]/div[2]/div/div').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_002_2_검색_이동_성공");
  console.log("▶TC_002_002_2_검색_이동_PASS");

});







  });
});