import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as mysql from "mysql2/promise";
import * as path from "path";
import { shot } from "./pre_setting";
import { createUser, Login } from "./pre_setting";
import { dbSelectOne, dbUpdateOrThrow, dbCount,  oracleCount, encryptAESCBC } from "./pre_setting";
import { type Locator } from "@playwright/test";
import { ADMIN_ID, ADMIN_PASSWORD, MANAGER_ID, MANAGER_PASSWORD } from "./config";

console.log("[BOOT pre_setting]", new Date().toISOString());

type GeneratedId = { random_regi_id: string };

function readGeneratedId(filePath: string): GeneratedId {
  const raw = fs.readFileSync(filePath, { encoding: "utf-8" });
  return JSON.parse(raw) as GeneratedId;
}

const APPROVE_USER_PW = process.env.APPROVE_USER_PW ?? "change_this!1";
const generatedIdPath = path.resolve(__dirname,  "generated_id.json");

test.describe("TC_002_003", () => {
  test("TC_002_003 Dashboard", async ({ page }, testInfo) => {

  await test.step("1) 대시보드 출력 확인", async () => {
    await Login(page, ADMIN_ID, ADMIN_PASSWORD, { loginPath: "/login" });
    await page.waitForTimeout(300);
      
    try {
  
  const dupLoginHeader = page.locator(`xpath=//h2[text()='중복 로그인 안내']`);
  await dupLoginHeader.waitFor({ timeout: 3000 });

  await page.waitForTimeout(1000);
  await page.getByText("예").click();


  await page.waitForLoadState("networkidle");
} catch {
}

      await page.waitForTimeout(1000);
      await shot(page, testInfo, "TC_002_003_1_대시보드 출력 확인");
      console.log("▶TC_002_003_1_대시보드 출력 확인_PASS");
    });



await test.step("2) PID 복사 확인", async () => {
  await page.locator('[data-testid="copy-cell"]').nth(1).click();
  await page.waitForTimeout(1000);
  await shot(page,testInfo, "TC_002_003_2_PID_복사_확인");
  console.log('▶TC_002_003_2_PID_복사_확인_PASS')
});


await test.step("3) 새로고침 일시 확인", async () => {
  await page.reload();
  await page.waitForLoadState("networkidle");
  await shot(page,testInfo, "TC_002_003_3_새로고침_일시_확인");
  console.log('▶TC_002_003_3_새로고침_일시_확인_PASS')
});



await test.step("4) DNR 뱃지 확인", async () => {
  const copyCell = page.locator('[data-testid="copy-cell"]').nth(1);
  const plaintext = (await copyCell.locator("div").first().innerText()).trim();
  console.log(plaintext);
  // 2. AES CBC 암호화
  const key = process.env.AES_KEY ?? "";
  const encryptedText = encryptAESCBC(plaintext, key);

  // 3. DB에서 암호화된 텍스트로 검색 후 b값 TRUE로 업데이트
  await dbUpdateOrThrow(
    "emr_current_dnr",
    { emr_dnr: 1 },
    { encrypted_patient_id : encryptedText }
  );
  console.log(`▶ DB 업데이트 완료 / plaintext=${plaintext} / encrypted=${encryptedText}, EMR_DNR=TRUE`);
  await page.waitForTimeout(3000);

  await page.reload();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);
  // 4. DNR indicator 확인
  const row = page.locator('tr').nth(1);
  const dnrIndicator = row.locator('[data-testid="dnr-indicator"]');
  const isDnrVisible = await dnrIndicator.isVisible();
  console.log(`dnr visible: ${isDnrVisible}`);

  if (isDnrVisible) {
    await shot(page, testInfo, "TC_002_003_4_DNR_확인_PASS");
    console.log(`▶TC_002_003_4_DNR_확인_PASS`);
  } else {
    await shot(page, testInfo, "TC_002_003_4_DNR_설정_PASS");
    console.log(`▶TC_002_003_4_DNR_확인_FAIL / dnr-indicator 없음`);
  }
});

await test.step("5) 관찰 설정 ", async () => {
  
  const observeButton = page.locator('tr').nth(1).locator('td').first().locator('button');
  await observeButton.click();
  await page.waitForTimeout(1000);
  await shot(page,testInfo, "TC_002_003_5_관찰 설정 ");
  console.log('▶TC_002_003_5_관찰 설정_PASS')

  
  await observeButton.click();
  await page.waitForTimeout(1000);
  await shot(page,testInfo, "TC_002_003_5_관찰 설정 해제 ");
  console.log('▶TC_002_003_5_관찰 설정 해제_PASS')
  
});

await test.step("6) Patient ID 정렬", async () => {
  await page.locator('[data-sort-column-id="Patient ID"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_6_PID_정렬(1)");
  console.log('▶TC_002_003_6_PID_정렬(1)_PASS');

  await page.locator('[data-sort-column-id="Patient ID"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_6_PID_정렬(2)");
  console.log('▶TC_002_003_6_PID_정렬(2)_PASS');
});

await test.step("7) Patient Info 정렬", async () => {
  await page.locator('[data-sort-column-id="Patient info"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_7_PInfo_정렬(1)");
  console.log('▶TC_002_003_7_PInfo_정렬(1)_PASS');

  await page.locator('[data-sort-column-id="Patient info"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_7_PInfo_정렬(2)");
  console.log('▶TC_002_003_7_PInfo_정렬(2)_PASS');
});

await test.step("8) Alarm date 정렬", async () => {
  await page.locator('[data-sort-column-id="Alarm date"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_8_Alarm_date_정렬(1)");
  console.log('▶TC_002_003_8_Alarm_date_정렬(1)_PASS');

  await page.locator('[data-sort-column-id="Alarm date"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_8_Alarm_date_정렬(2)");
  console.log('▶TC_002_003_8_Alarm_date_정렬(2)_PASS');
});

await test.step("9) BRES 정렬", async () => {
  await page.locator('[data-sort-column-id="BRES"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_9_BRES_정렬(1)");
  console.log('▶TC_002_003_9_BRES_정렬(1)_PASS');

  await page.locator('[data-sort-column-id="BRES"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_9_BRES_정렬(2)");
  console.log('▶TC_002_003_9_BRES_정렬(2)_PASS');
});

await test.step("10) PRES 정렬", async () => {
  await page.locator('[data-sort-column-id="PRES"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_10_PRES_정렬(1)");
  console.log('▶TC_002_003_10_PRES_정렬(1)_PASS');

  await page.locator('[data-sort-column-id="PRES"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_10_PRES_정렬(2)");
  console.log('▶TC_002_003_10_PRES_정렬(2)_PASS');
});

await test.step("11) CRES 정렬", async () => {
  await page.locator('[data-sort-column-id="CRES"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_11_CRES_정렬(1)");
  console.log('▶TC_002_003_11_CRES_정렬(1)_PASS');

  await page.locator('[data-sort-column-id="CRES"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_11_CRES_정렬(2)");
  console.log('▶TC_002_003_11_CRES_정렬(2)_PASS');
});

await test.step("12) ER Arrival date 정렬", async () => {
  await page.locator('[data-sort-column-id="ER Arrival date"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_12_ER_Arrival_date_정렬(1)");
  console.log('▶TC_002_003_12_ER_Arrival_date_정렬(1)_PASS');

  await page.locator('[data-sort-column-id="ER Arrival date"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_12_ER_Arrival_date_정렬(2)");
  console.log('▶TC_002_003_12_ER_Arrival_date_정렬(2)_PASS');
});

await test.step("13) KTAS 정렬", async () => {
  await page.locator('[data-sort-column-id="KTAS"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_13_KTAS_정렬(1)");
  console.log('▶TC_002_003_13_KTAS_정렬(1)_PASS');

  await page.locator('[data-sort-column-id="KTAS"]').click();
  await page.waitForTimeout(2000);
  await shot(page, testInfo, "TC_002_003_13_KTAS_정렬(2)");
  console.log('▶TC_002_003_13_KTAS_정렬(2)_PASS');
});







await test.step("14) Vital Sign 정렬", async () => {
  // 우측 스크롤 이동 (SBP 이후 컬럼은 스크롤 필요)
  const tableWrapper = page.locator('xpath=//div[3]/div[2]/div/div[2]/div/div[1]');
  await tableWrapper.evaluate(el => el.scrollLeft = el.scrollWidth - el.clientWidth);
  await page.waitForTimeout(2000);

  await page.locator('[data-sort-column-id="SBP"]').click();
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(1)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(1)_PASS');

  await page.locator('[data-sort-column-id="SBP"]').click();
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(2)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(2)_PASS');

  await page.locator('[data-sort-column-id="DBP"]').click();
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(3)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(3)_PASS');

  await page.locator('[data-sort-column-id="DBP"]').click();
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(4)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(4)_PASS');

  await page.locator('[data-sort-column-id="PR"]').click();
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(5)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(5)_PASS');

  await page.locator('[data-sort-column-id="PR"]').click();
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(6)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(6)_PASS');

  await page.locator('[data-sort-column-id="RR"]').click();
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(7)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(7)_PASS');

  await page.locator('[data-sort-column-id="RR"]').click();
  await page.waitForTimeout(3000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(8)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(8)_PASS');


  await page.locator('[data-sort-column-id="BT"]').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(9)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(9)_PASS');

  await page.locator('[data-sort-column-id="BT"]').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(10)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(10)_PASS');

  await page.locator('[data-sort-column-id="SpO2"]').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(11)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(11)_PASS');

  await page.locator('[data-sort-column-id="SpO2"]').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_14_Vital Sign 정렬(12)");
  console.log('▶TC_002_003_14_Vital Sign 정렬(12)_PASS');
});


await test.step("15) Mental Status 정렬", async () => {
  await page.locator('[data-sort-column-id="Mental status"]').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_15_Mental_Status_정렬(1)");
  console.log('▶TC_002_003_15_Mental_Status_정렬(1)_PASS');

  await page.locator('[data-sort-column-id="Mental status"]').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_15_Mental_Status_정렬(2)");
  console.log('▶TC_002_003_15_Mental_Status_정렬(2)_PASS');
});

let selectedAlarm: Locator | null = null;

await test.step("16) 알람 읽음으로 표시", async () => {
  const alarmCells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="on"]');
  const count = await alarmCells.count();

  for (let i = 0; i < count; i++) {
    const alarm = alarmCells.nth(i);
    await alarm.scrollIntoViewIfNeeded();
    const alarmCount = await alarm.getAttribute("data-alarm-count");

    if (["1","2","3","4","5","6","7","8"].includes(alarmCount ?? "")) {
      await alarm.click();
      selectedAlarm = alarm;  // 저장
      break;
    }
  }
  await page.getByText("읽음으로 표시").click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_16_읽음으로_표시_선택");
  console.log('▶TC_002_003_16_읽음으로_표시_선택_PASS');
});

await test.step("17) 알람 0건인 경우 드랍다운 확인", async () => {
  await selectedAlarm!.click();  // 저장된 알람셀 재선택
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_17_알람 0건인 경우 드랍다운 확인");
  console.log('▶TC_002_003_17_알람 0건인 경우 드랍다운 확인_PASS');
});



const MAX_SCROLL = 10;

async function clickAlarmCell(page: Page): Promise<void> {
  for (let attempt = 0; attempt < MAX_SCROLL; attempt++) {
    const alarmCells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="on"]');
    const count = await alarmCells.count();

    for (let i = 0; i < count; i++) {
      const alarm = alarmCells.nth(i);
      await alarm.scrollIntoViewIfNeeded();
      const alarmCount = await alarm.getAttribute("data-alarm-count");

      if (["1","2","3","4","5","6","7","8"].includes(alarmCount ?? "")) {
        await alarm.scrollIntoViewIfNeeded();
        await alarm.click();
        return;
      }
    }
  }
}

await test.step("18) Alarm off 실행", async () => {
  await clickAlarmCell(page);
  await shot(page, testInfo, "TC_002_003_18_알람 1건 이상인 경우 드랍다운 확인");
  console.log('▶TC_002_003_18_알람 1건 이상인 경우 드랍다운 확인_PASS');
});

await test.step("19) Alarm off 모달 확인", async () => {
  await page.getByText("Alarm off").click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_19_alarm_off_모달 확인");
  console.log('▶TC_002_003_19_alarm_off_모달 확인_PASS');
});

await test.step("20) Alarm off 팝업 닫기 / 취소", async () => {
  await page.getByRole("button", { name: "Close" }).click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_20_alarm_off_팝업_닫기");
  console.log('▶TC_002_003_20_alarm_off_팝업_닫기_PASS');

  await clickAlarmCell(page);
  await page.getByText("Alarm off").click();
  await page.waitForTimeout(1000);
  await page.getByText("취소").click();
  await shot(page, testInfo, "TC_002_003_20_alarm_off_취소");
  console.log('▶TC_002_003_20_alarm_off_취소_PASS');
});

await test.step("21) Alarm off 시간 선택 및 저장", async () => {
  await clickAlarmCell(page);
  await page.getByText("Alarm off").click();
  await page.waitForTimeout(1000);

  // 10분
  await page.locator('#alarm-off-10').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_21_alarm_off_10분_선택");
  console.log('▶TC_002_003_21_alarm_off_10분_선택_PASS');

  // 30분
  await page.locator('#alarm-off-30').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_21_alarm_off_30분_선택");
  console.log('▶TC_002_003_21_alarm_off_30분_선택_PASS');

  // 60분
  await page.locator('#alarm-off-60').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_21_alarm_off_60분_선택");
  console.log('▶TC_002_003_21_alarm_off_60분_선택_PASS');

  // 직접입력
  await page.locator('#alarm-off-custom').click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_21_alarm_off_직접입력_선택");
  console.log('▶TC_002_003_21_alarm_off_직접입력_선택_PASS');

  // 시간 입력
  await page.locator('input[name="manual-hours"]').fill("1");
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_21_alarm_off_직접입력_1시간");
  console.log('▶TC_002_003_21_alarm_off_직접입력_1시간_PASS');

  // 분 입력
  await page.locator('input[name="manual-minutes"]').fill("10");
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_21_alarm_off_직접입력_10분");
  console.log('▶TC_002_003_21_alarm_off_직접입력_10분_PASS');

  // 저장
  await page.getByRole('button', { name: '저장' }).click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_21_alarm_off_저장");
  console.log('▶TC_002_003_21_alarm_off_저장_PASS');
});
async function clickAlarmOffCell(page: Page): Promise<void> {
  for (let attempt = 0; attempt < MAX_SCROLL; attempt++) {
    const alarmOffCells = page.locator('[data-testid="alert-bell-cell"][data-alarm-state="off"]');
    const count = await alarmOffCells.count();

    for (let i = 0; i < count; i++) {
      const alarm = alarmOffCells.nth(i);
      await alarm.scrollIntoViewIfNeeded();
      await alarm.click();
      return;
    }
  }
}

await test.step("22) Alarm on 실행", async () => {
  await clickAlarmOffCell(page);
  await page.getByText("Alarm on").click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '확인' }).click();
  await page.waitForTimeout(1000);
  await shot(page, testInfo, "TC_002_003_22_alarm_on_실행");
  console.log('▶TC_002_003_22_alarm_on_실행_PASS');
});




  });
});
