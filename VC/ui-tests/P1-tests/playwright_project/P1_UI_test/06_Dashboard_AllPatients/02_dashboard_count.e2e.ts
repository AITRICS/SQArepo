import { test, expect, type Page } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { getAllPatientsCount } from '../../playwright/fixture/patientCount.js';
import { closeConnection } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = 'TC_002_006 Dashboard - All Patients/[02. All Patients - 대시보드 환자 카운트]';

test.beforeEach(async ({ page }) => {
  test.setTimeout(0);
  await page.goto('/ko/login');
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
  // TODO: 실제 UI의 All Patients 탭 이름으로 수정 필요
  await page.getByRole('tab', { name: 'All Patients' }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

// checkbox testId → UI label 매핑 (스크린샷 번호 순서 기준)
const STATUSES = [
  { checkboxId: 'checkbox-NO_STATUS',  label: 'No status' as const },
  { checkboxId: 'checkbox-SCREENED',   label: 'New'       as const },
  { checkboxId: 'checkbox-OBSERVING',  label: 'Observing' as const },
  { checkboxId: 'checkbox-DONE',       label: 'Complete'  as const },
  { checkboxId: 'checkbox-ERROR',      label: 'Error'     as const },
  { checkboxId: 'checkbox-DISMISSED',  label: 'Dismissed' as const },
] as const;

test('All Patients 환자 카운트 확인', async ({ page }) => {
  const uiCounts = await checkAllPatientsCounts(page);
  await screenShot(page, senarioName, '1. All Patients 카운트 확인');

  const dbData = await getAllPatientsCount();
  const db = dbData.length > 0 ? dbData[0] : {
    all_count: 0, no_status_count: 0, screened_count: 0,
    observing_count: 0, done_count: 0, error_count: 0, dismissed_count: 0,
  };

  expect(uiCounts.all).toBe(db.all_count);
  expect(uiCounts.no_status).toBe(db.no_status_count);
  expect(uiCounts.new).toBe(db.screened_count);
  expect(uiCounts.observing).toBe(db.observing_count);
  expect(uiCounts.complete).toBe(db.done_count);
  expect(uiCounts.error).toBe(db.error_count);
  expect(uiCounts.dismissed).toBe(db.dismissed_count);
  console.log('✅ All Patients 카운트 확인');
});

test('All Patients 환자 상태 필터 확인', async ({ page }) => {

  let screenshotIndex = 2;

  // 상태별 OFF → 해당 상태 테이블 미노출 확인 → 다시 ON
  for (const { checkboxId, label } of STATUSES) {
    await setCheckbox(page, checkboxId, false);
    await waitTableReady(page);

    await expectNoStatusValue(page, label);
    await screenShot(page, senarioName, `${screenshotIndex}. ${label} off 카운트 확인`);
    console.log(`✅ ${label} off 카운트 확인`);
    screenshotIndex++;

    await setCheckbox(page, checkboxId, true);
    await waitTableReady(page);
  }

  // 전체 OFF → 환자 목록이 없습니다
  for (const { checkboxId } of STATUSES) {
    await setCheckbox(page, checkboxId, false);
  }
  await waitTableReady(page);
  await expect(page.getByText('환자 목록이 없습니다')).toBeVisible({ timeout: 5000 });
  await screenShot(page, senarioName, `${screenshotIndex}. 모두 off 카운트 확인`);
  console.log('✅ No Status, New, Observing, Complete, Error, Dismissed off 카운트 확인');
});

type StatusLabel = 'No status' | 'New' | 'Observing' | 'Complete' | 'Error' | 'Dismissed';
type CountsKey = 'all' | 'no_status' | 'new' | 'observing' | 'complete' | 'error' | 'dismissed';


async function setCheckbox(page: Page, testId: string, checked: boolean) {
  const cb = page.getByTestId(testId);
  if (checked) {
    await cb.check();
  } else {
    await cb.uncheck();
  }
}

async function waitTableReady(page: Page) {
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
}

async function expectNoStatusValue(page: Page, forbiddenStatus: StatusLabel) {
  const headers = page.locator('table thead th');
  const headerCount = await headers.count();

  let statusColIndex = -1;
  for (let i = 0; i < headerCount; i++) {
    const text = (await headers.nth(i).innerText()).trim();
    if (text === 'Status') {
      statusColIndex = i + 1;
      break;
    }
  }
  expect(statusColIndex).toBeGreaterThan(0);

  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count();
  for (let r = 0; r < rowCount; r++) {
    const cell = rows.nth(r).locator(`td:nth-child(${statusColIndex})`);
    await expect(cell.getByRole('combobox', { name: forbiddenStatus })).toHaveCount(0);
  }
}

async function checkAllPatientsCounts(page: Page): Promise<Record<CountsKey, number>> {
  const textContent = (await page.getByText(/전체\d*No status\d*New\d*Observing\d*Complete\d*Error\d*Dismissed\d*/).textContent()) ?? '';
  const match = textContent.match(/전체(\d*)?No status(\d*)?New(\d*)?Observing(\d*)?Complete(\d*)?Error(\d*)?Dismissed(\d*)?/);

  const parse = (v: string | undefined) => (v ? parseInt(v, 10) : 0);
  return {
    all:       parse(match?.[1]),
    no_status: parse(match?.[2]),
    new:       parse(match?.[3]),
    observing: parse(match?.[4]),
    complete:  parse(match?.[5]),
    error:     parse(match?.[6]),
    dismissed: parse(match?.[7]),
  };
}

test.afterAll(async () => {
  await closeConnection();
});
