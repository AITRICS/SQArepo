import { test, expect, type Page,type Browser, chromium } from "@playwright/test";
import * as fs from "fs";
import * as mysql from "mysql2/promise";
import * as path from "path";
import { shot } from "./pre_setting";
import { createUser, Login, adminPageLogin } from "./pre_setting";
import { dbSelectOne, dbUpdateOrThrow, dbCount, oracleCount, encryptAESCBC } from "./pre_setting";
import { type Locator } from "@playwright/test";
import { ADMIN_ID, ADMIN_PASSWORD, MANAGER_ID, MANAGER_PASSWORD, ADMIN_PAGE_ID, ADMIN_PAGE_PASSWORD, ADMIN_URL } from "./config";

console.log("[BOOT pre_setting]", new Date().toISOString());

test.describe("TC_002_004", () => {
  test("TC_002_004 환자상세", async ({ page, context }, testInfo) => {

    let newTab: Page;

    await test.step("1) 환자 상세 진입", async () => {
      await Login(page, ADMIN_ID, ADMIN_PASSWORD, { loginPath: "/login" });
      await page.waitForTimeout(300);

      try {
        const dupLoginHeader = page.locator(`xpath=//h2[text()='중복 로그인 안내']`);
        await dupLoginHeader.waitFor({ timeout: 3000 });
        await page.waitForTimeout(1000);
        await page.getByText("예").click();
        await page.waitForLoadState("networkidle");
      } catch {}

      [newTab] = await Promise.all([
        context.waitForEvent('page'),
        page.locator('xpath=/html/body/div[3]/div[2]/div/div[2]/div/div[1]/table/tbody/tr[6]/td[3]').click(),
      ]);
      await newTab.waitForLoadState('domcontentloaded');
      await newTab.setViewportSize({ width: 1920, height: 1080 });
      await shot(newTab, testInfo, "TC_002_004_01_환자상세_진입");
      console.log('▶TC_002_004_01_환자상세_진입_PASS');
    });

    await test.step("2) 관찰 설정 / 해제", async () => {
      await newTab.locator('[data-testid="observing-toggle-chip"]').nth(0).click();
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_02_관찰설정_클릭");
      console.log('▶TC_002_004_02_관찰설정_클릭_PASS');

      await newTab.locator('[data-testid="observing-toggle-chip"]').nth(0).click();
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_02_관찰설정_해제");
      console.log('▶TC_002_004_02_관찰설정_해제_PASS');
    });

    await test.step("3) DNR 미등록 환자_DNR 버튼 클릭 / 닫기", async () => {
      await newTab.getByRole('button', { name: 'DNR' }).click();
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_03_DNR_클릭");
      console.log('▶TC_002_004_03_DNR_클릭_PASS');

      await newTab.getByRole('button', { name: 'Close' }).click();
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_03_DNR_x버튼_클릭");
      console.log('▶TC_002_004_03_DNR_x버튼_클릭_PASS');
    });

    await test.step("4) DNR 사유 선택 / 취소", async () => {
      await newTab.getByRole('button', { name: 'DNR' }).click();
      await newTab.waitForTimeout(1000);

      const checkboxItems = [
        { name: '별지 제1호서식 확인',  id: '제1호서식'  },
        { name: '별지 제9호서식 확인',  id: '제9호서식'  },
        { name: '별지 제10호서식 확인', id: '제10호서식' },
        { name: '별지 제11호서식 확인', id: '제11호서식' },
        { name: '별지 제12호서식 확인', id: '제12호서식' },
        { name: '별지 제13호서식 확인', id: '제13호서식' },
      ];

      for (const item of checkboxItems) {
        // 선택
        await newTab.getByRole('checkbox', { name: item.name }).click();
        await newTab.waitForTimeout(1000);
        await shot(newTab, testInfo, `TC_002_004_04_${item.id}_사유선택`);
        console.log(`▶TC_002_004_04_${item.id}_사유선택_PASS`);

        // 취소
        await newTab.getByRole('checkbox', { name: item.name }).click();
        await newTab.waitForTimeout(1000);
        await shot(newTab, testInfo, `TC_002_004_04_${item.id}_사유선택취소`);
        console.log(`▶TC_002_004_04_${item.id}_사유선택취소_PASS`);
      }

      // 직접입력
      await newTab.getByRole('checkbox', { name: '직접 입력' }).click();
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_04_직접입력_선택");
      console.log('▶TC_002_004_04_직접입력_선택_PASS');

      await newTab.locator('input[name="direct-input-text"]').fill("dnrtest");
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_04_직접입력");
      console.log('▶TC_002_004_04_직접입력_PASS');

      // 저장
      await newTab.getByRole('button', { name: '저장' }).click();
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_04_동의_저장_클릭");
      console.log('▶TC_002_004_04_동의_저장_클릭_PASS');
    });

    await test.step("5) DNR 등록환자_DNR 버튼 클릭 / 닫기", async () => {
      await newTab.getByRole('button', { name: 'DNR' }).click();
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_05_DNR_클릭");
      console.log('▶TC_002_004_05_DNR_클릭_PASS');

      await newTab.locator('div').getByText('취소').click();
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_03_05_DNR_취소_버튼_클릭");
      console.log('▶TC_002_004_05_DNR_취소_버튼_클릭_PASS');
    });

    await test.step("6) DNR History 클릭 / 스크롤 ", async () => {
      await newTab.getByRole('button', { name: 'DNR' }).click();
      await newTab.waitForTimeout(1000);
      await newTab.locator('button').filter({ has: newTab.locator('div > div', { hasText: 'DNR History' }) }).click();
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_06_DNR_history_클릭");
      console.log('▶TC_002_004_06_DNR_history_클릭_PASS');

      const scrollableDiv = newTab.locator('div.px-\\[32px\\].max-h-\\[800px\\].overflow-y-auto');
      await scrollableDiv.evaluate(el => el.scrollTop = el.scrollHeight);
      await newTab.waitForTimeout(1000);
      await shot(newTab, testInfo, "TC_002_004_06_DNR_history_스크롤");
      console.log('▶TC_002_004_06_DNR_history_스크롤_PASS');
    });



  await test.step("7) DNR 등록 환자_비동의 모달 확인", async () => {
    await newTab.getByRole('button', { name: 'DNR' }).click();
    await newTab.waitForTimeout(1000);
    await shot(newTab, testInfo, "TC_002_004_07_비동의 모달 확인");
    console.log('▶TC_002_004_07_비동의 모달 확인_PASS');
});


  await test.step("8) DNR 등록 환자_비동의 모달 확인", async () => {
    await newTab.getByRole('button', { name: '저장' }).click();
    await newTab.waitForTimeout(1000);
    await shot(newTab, testInfo, "TC_002_004_08_비동의_저장_클릭");
    console.log('▶TC_002_004_08_비동의_저장_클릭"_PASS');
});


await test.step("9) 처치 진입 ", async () => {
  await newTab.locator('[data-testid="action-drawer-trigger"]').click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_09_처치_진입");
  console.log('▶TC_002_004_09_처치_진입_PASS');

  });

await test.step("10) 처치 등록 취소", async () => {
  const today = new Date();
  const yearValue = String(today.getFullYear());
  const monthValue = String(today.getMonth()); // 0-indexed
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const formattedDay = `${today.getMonth() + 1}월${today.getDate()}일`;

  // 캘린더 열기
  await newTab.locator('[data-testid="date-picker-trigger"]').click();
  await newTab.waitForTimeout(1000);

  // 년 선택
  await newTab.locator('select.rdp-years_dropdown').selectOption({ value: yearValue });
  await newTab.waitForTimeout(1000);

  // 월 선택
  await newTab.locator('select.rdp-months_dropdown').selectOption({ value: monthValue });
  await newTab.waitForTimeout(1000);

  // 날짜 선택
  await newTab.locator(`td[data-day="${todayStr}"] button`).click();
  await newTab.waitForTimeout(1000);

  // 시 입력
  const currentHour = String(today.getHours());
  await newTab.locator('input[data-testid="manual-hours-input"]').fill(currentHour);
  await newTab.waitForTimeout(1000);

  // 분 입력
  const currentMinute = String(today.getMinutes()).padStart(2, '0');
  await newTab.locator('input[data-testid="manual-minutes-input"]').fill(currentMinute);
  await newTab.waitForTimeout(1000);

  await newTab.locator('[data-action-state="CPR"]').click();
  await newTab.waitForTimeout(1000);

  // 취소 클릭
  await newTab.locator('[data-testid="action-cancel-button"]').click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_10_취소버튼_클릭");
  console.log('▶TC_002_004_10_취소버튼_클릭_PASS');

  // 취소 클릭 후 예 클릭

  await newTab.locator('[data-testid="action-alert-confirm-button"]').click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_10_취소버튼_예_클릭");
  console.log('▶TC_002_004_10_취소버튼_예_클릭_PASS');

});

await test.step("11) 처치 등록", async () => {
  // VASOPRESSOR 재선택
  await newTab.locator('[data-action-state="VASOPRESSOR"]').click();
  await newTab.waitForTimeout(1000);

  // 내용 입력
  await newTab.locator('input[data-testid="action-comment-input"]').fill("test");
  await newTab.waitForTimeout(1000);

  // 저장
  await newTab.locator('[data-testid="action-save-button"]').click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_11_처치_저장버튼_클릭");
  console.log('▶TC_002_004_11_처치_저장버튼_클릭_PASS');
});



await test.step("12) 처치 수정/ 취소", async () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const formattedDay = `${today.getMonth() + 1}월${today.getDate()}일`;

  // 수정 버튼 클릭
  await newTab.locator('[data-testid="action-history-item-edit-button"]').nth(0).click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_12_처치_수정버튼_클릭");
  console.log('▶TC_002_004_12_처치_수정버튼_클릭_PASS');

  // 캘린더 열기
  await newTab.locator('[data-testid="date-picker-trigger"]').click();
  await newTab.waitForTimeout(1000);

  // 이전달
  await newTab.getByRole('button', { name: 'Go to the Previous Month' }).click();
  await newTab.waitForTimeout(1000);


  // 다음달
  await newTab.getByRole('button', { name: 'Go to the Next Month' }).click();
  await newTab.waitForTimeout(1000);


  // 오늘 날짜 선택
  await newTab.locator(`td[data-day="${todayStr}"] button`).click();
  await newTab.waitForTimeout(1000);

  // 저장
  await newTab.getByRole('button', { name: '저장' }).click();
  await newTab.waitForTimeout(2000);
  await shot(newTab, testInfo, "TC_002_004_12_처치_수정_저장버튼_클릭");
  console.log('▶TC_002_004_12_처치_수정_저장버튼_클릭_PASS');

  await newTab.locator('[data-testid="action-history-item-edit-button"]').nth(0).click();
  await newTab.waitForTimeout(1000);
  await newTab.locator('[data-testid="action-cancel-button"]').click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_12_처치_수정_취소버튼_클릭");
  console.log('▶TC_002_004_12_처치_수정_취소버튼_클릭_PASS');
  await newTab.locator('[data-testid="action-alert-confirm-button"]').click();



});

await test.step("13) 처치 삭제/취소", async () => {
  // 삭제 클릭 → 아니오
  await newTab.locator('[data-testid="action-history-item-delete-button"]').nth(0).click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_13_처치_삭제버튼_클릭");
  console.log('▶TC_002_004_13_처치_삭제버튼_클릭_PASS');

  await newTab.locator('div').getByText('아니오').click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_13_처치_삭제버튼_아니오_클릭");
  console.log('▶TC_002_004_13_처치_삭제버튼_아니오_클릭_PASS');

  // 삭제 클릭 → 예
  await newTab.locator('[data-testid="action-history-item-delete-button"]').nth(0).click();
  await newTab.waitForTimeout(1000);
  await newTab.locator('div').getByText('예').click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_13_처치_삭제버튼_예_클릭");
  console.log('▶TC_002_004_13_처치_삭제버튼_예_클릭_PASS');
});


await test.step("14) 문진정보 자세히보기 / 닫기", async () => {
  await newTab.locator('[data-testid="chief-complaint-trigger"]').click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_14_문진정보_자세히보기");
  console.log('▶TC_002_004_14_문진정보_자세히보기_PASS');

  await newTab.locator('[data-testid="chief-complaint-trigger"]').click();
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_14_문진정보_닫기_클릭");
  console.log('▶TC_002_004_01_문진정보_닫기_클릭_PASS');
});

await test.step("15) 알람 이력 테이블 구성 확인", async () => {
  await newTab.waitForTimeout(1000);
  await shot(newTab, testInfo, "TC_002_004_15_알람 이력 테이블 구성 확인");
  console.log('▶TC_002_004_15_알람 이력 테이블 구성 확인_PASS');

});


  let adminPage: Page;
    let adminBrowser: Browser; // 상단에 import { type Browser } from "@playwright/test" 추가

    await test.step("16) 어드민 데이터 설정 진입", async () => {
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
      await shot(adminPage, testInfo, "TC_002_004_16_PRES_off");
      console.log('▶TC_002_004_16_PRES_off_PASS');

      await newTab.reload();
      await newTab.waitForTimeout(2000);
      await shot(newTab, testInfo, "TC_002_004_16_PRES항목 제거_확인");
      console.log('▶TC_002_004_16_PRES항목 제거_확인_PASS');

      await adminPage.locator('[data-testid="switch-PRES"]').click();
      await adminPage.waitForTimeout(1000);
      await adminPage.locator('[data-testid="submit-button"]').click();
      await adminPage.waitForTimeout(1000);





  });
});
});