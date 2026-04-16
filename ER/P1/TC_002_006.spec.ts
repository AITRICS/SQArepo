import { test, expect, Page } from "@playwright/test";
import type { TestInfo } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { shot } from "./pre_setting";
import { createUser } from "./pre_setting";
import { dbSelectOne, dbUpdateOrThrow } from "./pre_setting";
import { MANAGER_ID, MANAGER_PASSWORD } from "./config";
console.log("[BOOT pre_setting]", new Date().toISOString());

type GeneratedId = { random_regi_id: string };

function readGeneratedId(filePath: string): GeneratedId {
  const raw = fs.readFileSync(filePath, { encoding: "utf-8" });
  return JSON.parse(raw) as GeneratedId;
}

const APPROVE_USER_PW = process.env.APPROVE_USER_PW ?? "change_this!1";
const generatedIdPath = path.resolve(__dirname, "generated_id.json");


async function testPhoneNumberChange(
  page: Page,
  testInfo: TestInfo,
  role: string,
  tcNumber: string
) {
  // 휴대폰 번호 변경 진입
  await page.getByText('휴대폰 번호 변경').click();
  await page.waitForTimeout(1000);
  await page.getByText('저장').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 번호 변경
  await page.getByText('휴대폰 번호 변경').click();
  await page.waitForTimeout(1000);
  await page.locator('input[name="phone"]').fill('010-9467-6738');
  await page.waitForTimeout(1000);
  await page.getByText('저장').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await shot(page, testInfo, `${tcNumber}_[${role}] 휴대폰번호변경_완료`);
  console.log(`▶${tcNumber}_[${role}] 휴대폰번호변경_완료_PASS`);

  // 원복
  await page.getByText('휴대폰 번호 변경').click();
  await page.waitForTimeout(1000);
  await page.locator('input[name="phone"]').fill('0');
  await page.waitForTimeout(1000);
  await page.getByText('저장').click();
  await page.waitForLoadState('networkidle');
}


async function testPasswordChange(
  page: Page,
  testInfo: TestInfo,
  role: string,
  tcNumbers: string,
  credentials: {
    userId: string;
    oldPassword: string;
    newPassword: string;
  }
) {
  // 비밀번호 변경 진입
  await page.getByText('비밀번호 변경').click();
  await page.waitForTimeout(1000);

  await page.locator('input[name="oldPassword"]').fill(credentials.oldPassword);
  await page.waitForTimeout(1000);
  await page.locator('[data-testid="password-eye-toggle"]').nth(0).click();

  await page.locator('input[name="newPassword"]').fill(credentials.newPassword);
  await page.waitForTimeout(1000);
  await page.locator('[data-testid="password-eye-toggle"]').nth(1).click();
  await page.waitForTimeout(1000);

  await page.locator('input[name="confirmPassword"]').fill(credentials.newPassword);
  await page.waitForTimeout(1000);
  await page.locator('[data-testid="password-eye-toggle"]').nth(2).click();
  await page.waitForTimeout(1000);

  await page.getByText('저장').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, `${tcNumbers}_[${role}] 비밀번호변경_완료`);
  console.log(`▶${tcNumbers}_[${role}] 비밀번호변경_완료_PASS`);

  // 로그아웃
  await page.locator('[data-testid="logout-button"]').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, `${tcNumbers}_[${role}] 로그아웃_완료`);
  console.log(`▶${tcNumbers}_[${role}] 로그아웃_완료_PASS`);

  // 변경된 비밀번호로 재로그인
  await page.locator('input[name="username"]').fill(credentials.userId);
  await page.waitForTimeout(1000);
  await page.locator('input[name="password"]').fill(credentials.newPassword);
  await page.waitForTimeout(1000);
  await page.locator('[data-testid="password-eye-toggle"]').click();
  await page.waitForTimeout(2000);
  await page.locator('[data-testid="login-button"]').nth(0).click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await shot(page, testInfo, `${tcNumbers}_[${role}] 비밀번호변경계정_로그인`);
  console.log(`▶${tcNumbers}_[${role}] 비밀번호변경계정_로그인_PASS`);





}

async function testProductInfoEnter(page: Page, testInfo: TestInfo, role: string, tcNumber: string) {
  await page.getByText("Settings").click();
  await page.getByText('제품정보').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, `${tcNumber}_[${role}] 제품정보_진입`);
  console.log(`▶${tcNumber}_[${role}] 제품정보_진입_PASS`);
}

async function testProductManualDownload(page: Page, testInfo: TestInfo, role: string, tcNumber: string) {
  await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[2]/div[2]/button');
  await page.waitForTimeout(2000);
  await shot(page, testInfo, `${tcNumber}_[${role}] 제품설명서_다운로드`);
  console.log(`▶${tcNumber}_[${role}] 제품설명서_다운로드_PASS`);
}

async function testServiceTerms(page: Page, testInfo: TestInfo, context: BrowserContext, role: string, tcNumber: string) {
  const [serviceTab] = await Promise.all([
    context.waitForEvent('page'),
    page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[3]/div[7]/div[2]/div[1]/button'),
  ]);
  await page.waitForTimeout(1000);
  await serviceTab.waitForLoadState();
  await serviceTab.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(2000);
  await shot(serviceTab, testInfo, `${tcNumber}_[${role}] 서비스이용약관_확인`);
  console.log(`▶${tcNumber}_[${role}] 서비스이용약관_확인_PASS`);
  await serviceTab.close();
  await page.bringToFront();
  await page.waitForTimeout(1000);
}

async function testPrivacyPolicy(page: Page, testInfo: TestInfo, context: BrowserContext, role: string, tcNumber: string) {
  const [privacyTab] = await Promise.all([
    context.waitForEvent('page'),
    page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[3]/div[7]/div[2]/div[2]/button'),
  ]);
  await privacyTab.waitForLoadState();
  await privacyTab.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1000);
  await shot(privacyTab, testInfo, `${tcNumber}_[${role}] 개인정보처리방침_확인`);
  console.log(`▶${tcNumber}_[${role}] 개인정보처리방침_확인_PASS`);
  await privacyTab.close();
  await page.bringToFront();
  await page.waitForTimeout(1000);

}



async function testDashboardSettingsEnter(page: Page, testInfo: TestInfo, role: string, tcNumber: string) {
  await page.getByRole('button', { name: '대시보드 화면 설정' }).click();
  await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
  await page.waitForTimeout(2000);
  await shot(page, testInfo, `${tcNumber}_[${role}] 대시보드_화면설정_진입`);
  console.log(`▶${tcNumber}_[${role}] 대시보드_화면설정_진입_PASS`);
}


async function testDashboardColumnToggle(page: Page, testInfo: TestInfo, role: string, tcNumbers: string) {
  // 초기화
  await page.getByRole('button', { name: '초기화' }).click();
  await page.waitForTimeout(1000);
  await page.locator('//div[text()="예"]').click();
  await page.waitForTimeout(1000);

  // 스위치 off
  const switchIds = [
    'Area', 'Bed', 'Alarm type', 'Alarm date',
    'BRES', 'PRES', 'CRES', 'ER Arrival date',
    'KTAS', 'Chief Complaint', 'SBP', 'DBP',
    'PR', 'RR', 'BT', 'SpO2', 'Mental status',
  ];

  for (const id of switchIds) {
    await page.click(`xpath=//*[@id="${id}-switch"]`);
    await page.waitForTimeout(1000);
  }

  // PRES on + 마지막 한 장
  await page.click(`xpath=//*[@id="PRES-switch"]`);
  await page.waitForTimeout(1000);
  await shot(page, testInfo, `${tcNumbers}_[${role}] 전체off_PRES_on`);
  console.log(`▶${tcNumbers}_[${role}] 전체off_PRES_on_PASS`);

  // 초기화 팝업 테스트
  await page.getByRole('button', { name: '초기화' }).click();
  await page.waitForTimeout(1000);
  await page.locator('//div[text()="예"]').click();
  await page.waitForTimeout(1000);
}

// 3. 컬럼 순서변경 + 저장 + 초기화
async function testDashboardOrderAndSave(page: Page, testInfo: TestInfo, role: string, tcNumbers: {
  순서변경: string;
  저장: string;
}) {
  // KTAS 드래그
  const LIST_ITEM_SEL = '.flex.flex-col.w-full.h-\\[40px\\]';
  const LABEL_SEL = '.text-body-base-500.text-text-primary';
  const DRAG_HANDLE_SEL = 'svg[role="button"][aria-roledescription="sortable"]';

  const items = page.locator(LIST_ITEM_SEL);
  const targetItem = items.filter({ has: page.locator(`${LABEL_SEL}:has-text("KTAS")`) }).first();
  const topItem = items.first();

  await targetItem.waitFor();
  await topItem.waitFor();

  const handle = targetItem.locator(DRAG_HANDLE_SEL);
  await handle.waitFor();

  try {
    await handle.dragTo(topItem, { targetPosition: { x: 10, y: 10 } });
  } catch {
    const hb = await handle.boundingBox();
    const tb = await topItem.boundingBox();
    if (!hb || !tb) throw new Error('bounding_box를 가져오지 못했습니다.');
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.mouse.move(tb.x + 10, tb.y + 5, { steps: 20 });
    await page.mouse.up();
  }

  await page.waitForTimeout(1000);
  await shot(page, testInfo, `${tcNumbers.순서변경}_[${role}] 순서변경`);
  console.log(`▶${tcNumbers.순서변경}_[${role}] 순서변경_PASS`);

  // 저장
  await page.getByRole('button', { name: '저장' }).click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, `${tcNumbers.저장}_[${role}] 저장_클릭`);
  console.log(`▶${tcNumbers.저장}_[${role}] 저장_클릭_PASS`);
}


async function testNoticeEnter(page: Page, testInfo: TestInfo, role: string, tcNumber: string) {
  await page.getByText('공지사항').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, `${tcNumber}_[${role}] 공지사항_진입`);
  console.log(`▶${tcNumber}_[${role}] 공지사항_진입_PASS`);
}

async function testNoticeActions(page: Page, testInfo: TestInfo, role: string, tcNumber: string) {
  // 리스트 선택
  await page.click('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[3]/div/div[2]/div/table/tbody/tr[1]/td[2]');
  await page.waitForTimeout(1000);
  await page.getByText('목록으로').click();
  // 다음 페이지
  await page.getByRole('button', { name: 'Go to next page' }).click();
  await page.waitForTimeout(1000);

  // 마지막 페이지
  await page.getByRole('button', { name: 'Go to End page' }).click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, `${tcNumber}_[${role}] 공지사항_페이지이동`);
  console.log(`▶${tcNumber}_[${role}] 공지사항_페이지이동_PASS`);

  // 이전 페이지
  await page.getByRole('button', { name: 'Go to previous page' }).click();
  await page.waitForTimeout(1000);

  // 첫 페이지
  await page.getByRole('button', { name: 'Go to start page' }).click();
  await page.waitForTimeout(1000);

}




test.describe("TC_002_006", () => {
  test("TC_002_006 Settings", async ({ page , context}, testInfo) => {
    if (!fs.existsSync(generatedIdPath)) {
      throw new Error(`generated_id.json not found: ${generatedIdPath}`);
    }

    const { random_regi_id } = readGeneratedId(generatedIdPath);
    console.log("baseURL =", JSON.stringify(process.env.BASE_URL));

    await test.step("1) member-로그아웃 진행", async () => {
      await page.goto("/login");
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);

      await page.locator('input[name="username"]').fill(random_regi_id);
      await page.waitForTimeout(300);
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
      } catch {}

      await page.locator('[data-testid="logout-button"]').click();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_006_1_user-로그아웃 진행");
      console.log("▶TC_002_006_1_user-로그아웃 진행_PASS");

    });

    await test.step("2) member-설정 메뉴 이동", async () => {
      await page.locator('input[name="username"]').fill(random_regi_id);
      await page.waitForTimeout(2000);
      await page.locator('input[name="password"]').fill(APPROVE_USER_PW);
      await page.waitForTimeout(2000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(4000);

      await page.getByText("Settings").click();
      await page.waitForTimeout(2000);
      await shot(page, testInfo, "TC_002_006_2_user-Settings_이동_성공");
      console.log("▶TC_002_006_2_user-Settings_이동_PASS");
    });

    await test.step("3) member-휴대폰 번호 변경", async () => {
      await testPhoneNumberChange(page, testInfo, 'user', 'TC_002_006_03', );
    });

    await test.step("4) member-비밀번호 변경", async () => {
      await testPasswordChange(page, testInfo, 'user', 'TC_002_006_04', {
  userId:      random_regi_id,
  oldPassword: APPROVE_USER_PW,
  newPassword: 'change_this!!1',
});
    });

    await test.step("5) member-제품 정보 이동", async () => {
      await testProductInfoEnter(page, testInfo, 'user', 'TC_002_006_05', );
  });

    await test.step("6) member-제품 설명서 다운로드", async () => {
      await testProductManualDownload(page, testInfo, 'user', 'TC_002_006_06', );
  });

    await test.step("7) member-이용약관 출력", async () => {
      await testServiceTerms(page, testInfo,context, 'user', 'TC_002_006_07', );
  });

    await test.step("8) member-개인정보처리방침 출력", async () => {
      await testPrivacyPolicy(page, testInfo,context, 'user', 'TC_002_006_08', );
  });

    await test.step("9) member-대시보드 설정 페이지 구성 확인", async () => {
      await testDashboardSettingsEnter(page, testInfo, 'user', 'TC_002_006_09', );
  });

    await test.step("10) member-대시보드 컬럼 순서 변경 기능 확인", async () => {
      await testDashboardOrderAndSave(page, testInfo, 'user', {
    순서변경: 'TC_002_006_10',
    저장:     'TC_002_006_10',
  });
});

    await test.step("11) member-대시보드 컬럼 on/off 설정 기능 확인", async () => {
      await testDashboardColumnToggle(page, testInfo, 'user', 'TC_002_006_11');
});


    await test.step("12) member-공지사항 진입 확인", async () => {
      await testNoticeEnter(page, testInfo, 'user', 'TC_002_006_12');
});

    await test.step("13) member-공지사항 내용 확인", async () => {
      await testNoticeActions(page, testInfo, 'user', 'TC_002_006_13');
});


await test.step("14) manager-로그아웃 진행", async () => {
      await page.locator('[data-testid="logout-button"]').click();
      await page.waitForTimeout(2000);

      await page.locator('input[name="username"]').fill(MANAGER_ID);
      await page.waitForTimeout(300);
      await page.locator('input[name="password"]').fill(MANAGER_PASSWORD);
      await page.waitForTimeout(300);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(1000);

      try {
        const dupLoginHeader = page.locator(`xpath=//h2[text()='중복 로그인 안내']`);
        await dupLoginHeader.waitFor({ timeout: 3000 });
        await page.waitForTimeout(1000);
        await page.getByText("예").click();
        await page.waitForLoadState("networkidle");
      } catch {}

      await page.locator('[data-testid="logout-button"]').click();
      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_006_14_manager-로그아웃 진행");
      console.log("▶TC_002_006_14_manager-로그아웃 진행_PASS");

    });



        await test.step("15) manager-설정 메뉴 이동", async () => {
      await page.locator('input[name="username"]').fill(MANAGER_ID);
      await page.waitForTimeout(300);
      await page.locator('input[name="password"]').fill(MANAGER_PASSWORD);
      await page.waitForTimeout(2000);
      await page.locator('[data-testid="login-button"]').click();
      await page.waitForTimeout(4000);

      await page.getByText("Settings").click();
      await page.waitForTimeout(2000);
      await shot(page, testInfo, "TC_002_006_15_manager-Settings_이동_성공");
      console.log("▶TC_002_006_15_manager-Settings_이동_PASS");
    });

    await test.step("16) manager-휴대폰 번호 변경", async () => {
      await testPhoneNumberChange(page, testInfo, 'user', 'TC_002_006_16', );
    });

    await test.step("17) manager-비밀번호 변경", async () => {
      await testPasswordChange(page, testInfo, 'user', 'TC_002_006_17', {
  userId:      MANAGER_ID,
  oldPassword: MANAGER_PASSWORD,
  newPassword: 'change_this!!1',
});
    });









  });
  });
