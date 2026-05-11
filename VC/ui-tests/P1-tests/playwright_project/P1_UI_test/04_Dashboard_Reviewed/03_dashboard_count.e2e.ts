import { test, expect, type Page } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { getReviewedCount } from '../../playwright/fixture/patientCount.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = 'TC_002_004 Dashboard - Reviewed/[03. Reviewed - 대시보드 환자 카운트]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
  await page.getByRole('tab', { name: 'Reviewed' }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

test('Reviewed 환자 카운트 확인', async ({ page }) => {
  const uiCounts = await checkReviewedCounts(page);
  await screenShot(page, senarioName, '1. Reviewed 환자 카운트 확인');

  const dbData = await getReviewedCount();
  const dbCounts = dbData.length > 0 ? dbData[0] : { all_count: 0, done_count: 0, error_count: 0 };

  expect(uiCounts.all).toBe(dbCounts.all_count);
  expect(uiCounts.complete).toBe(dbCounts.done_count);
  expect(uiCounts.error).toBe(dbCounts.error_count);
  console.log('✅ Reviewed 카운트 확인');
});

test('Reviewed 환자 상태 필터 확인', async ({ page }) => {
  const dbData = await getReviewedCount();
  const dbCounts = dbData.length > 0 ? dbData[0] : { all_count: 0, done_count: 0, error_count: 0 };

  // 1) COMPLETE OFF, ERROR ON → Complete 없어야 함
  await setCheckbox(page, 'checkbox-DONE', false);
  await setCheckbox(page, 'checkbox-ERROR', true);
  await waitTableReady(page);

  await expectNoStatusValue(page, 'Complete');
  const uiCounts1 = await checkReviewedCounts(page);
  expect(uiCounts1.error).toBe(dbCounts.error_count);
  await screenShot(page, senarioName, '3. Error On 확인');
  console.log('✅ Error 상태 필터 확인');

  // 2) COMPLETE ON, ERROR OFF → Error 없어야 함
  await setCheckbox(page, 'checkbox-DONE', true);
  await setCheckbox(page, 'checkbox-ERROR', false);
  await waitTableReady(page);

  await expectNoStatusValue(page, 'Error');
  const uiCounts2 = await checkReviewedCounts(page);
  expect(uiCounts2.complete).toBe(dbCounts.done_count);
  await screenShot(page, senarioName, '2. Complete On 확인');
  console.log('✅ Complete 상태 필터 확인');

  // 3) COMPLETE OFF, ERROR OFF → 환자 목록이 없습니다
  await setCheckbox(page, 'checkbox-DONE', false);
  await setCheckbox(page, 'checkbox-ERROR', false);
  await waitTableReady(page);

  await expect(page.getByText('환자 목록이 없습니다')).toBeVisible({ timeout: 5000 });
  await screenShot(page, senarioName, '4. Complete Off, Error Off 확인');
  console.log('✅ 환자 목록이 없습니다 노출 확인');
});

async function checkReviewedCounts(page: Page): Promise<{ all: number, complete: number, error: number }> {
  const textContent = (await page.getByText(/전체\d*Complete\d*Error\d*/).textContent()) ?? '';
  const match = textContent.match(/전체(\d*)?Complete(\d*)?Error(\d*)?/);

  return {
    all:      match?.[1] ? parseInt(match[1], 10) : 0,
    complete: match?.[2] ? parseInt(match[2], 10) : 0,
    error:    match?.[3] ? parseInt(match[3], 10) : 0,
  };
}

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

async function expectNoStatusValue(page: Page, forbiddenStatus: 'Complete' | 'Error') {
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

test.afterAll(async () => {
  await closeConnection();
});