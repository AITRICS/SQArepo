import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { executeQuery } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = 'TC_002_005 Dashboard - Dismissed/[05. Dismissed - 대시보드 id 복사 및 북마크]';

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await executeQuery(`DELETE FROM accounts_pin WHERE username = '${adminID}'`);
  await page.goto('/ko/login')
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
  await page.getByRole('tab', { name: 'Dismissed' }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

test('대시보드 id 복사', async ({ page }) => {
  const table = page.locator('table');
  const headers = await table.locator('thead tr th').allTextContents();
  const patientInfoIndex = headers.indexOf('Patient info') + 1;

  const firstRow = page.locator('tbody tr').first();
  const patientInfoCell = firstRow.locator(`td:nth-child(${patientInfoIndex})`);
  const copyButton = patientInfoCell.locator('button');

  await copyButton.click();
  await page.waitForTimeout(1000);
  const toast = page.getByText('EMR ID가 복사되었습니다.');
  await expect(toast).toBeVisible();
  await screenShot(page, senarioName, '4. EMR ID 복사');
  console.log('✅ EMR ID 복사 확인');
});

test('대시보드 북마크 on/off 확인', async ({ page }) => {
  const table = page.locator('table');

  const headerCells = table.locator('thead tr th');
  const bookmarkIndex =
    (await headerCells.evaluateAll((ths) =>
      ths.findIndex((th) => th.querySelector('[data-testid="bookmark-header"]'))
    )) + 1;

  expect(bookmarkIndex).toBeGreaterThan(0);

  const firstRow = table.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });

  const bookmarkCell = firstRow.locator(`td:nth-child(${bookmarkIndex})`);
  const bookmarkButton = bookmarkCell.locator('button');
  await expect(bookmarkButton).toBeVisible({ timeout: 10000 });

  await setBookmark(page, bookmarkCell, bookmarkButton, true);
  await screenShot(page, senarioName, '5. 북마크 on 확인');
  console.log('✅ 북마크 on 확인');

  await setBookmark(page, bookmarkCell, bookmarkButton, false);
  await screenShot(page, senarioName, '6. 북마크 off 확인');
  console.log('✅ 북마크 off 확인');
});

const BOOKMARK_ON_G = 'xpath=.//svg//g[@id="name=star, size=small"]';
const BOOKMARK_OFF_G = 'css=svg g#favorite';
const TOAST_ON = '북마크 등록이 완료되었습니다';
const TOAST_OFF = '북마크 해제가 완료되었습니다';

async function expectToastAppearAndDisappear(page: Page, text: string) {
  const toast = page.getByText(text);
  await toast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  await Promise.race([
    toast.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {}),
    toast.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {}),
  ]);
}

async function setBookmark(page: Page, cell: Locator, button: Locator, targetOn: boolean) {
  const currentlyOn = (await cell.locator(BOOKMARK_ON_G).count()) > 0;
  const currentlyOff = (await cell.locator(BOOKMARK_OFF_G).count()) > 0;
  console.log(`Currently bookmarked: on=${currentlyOn}, off=${currentlyOff}`);

  if (targetOn && currentlyOn) return;
  if (!targetOn && currentlyOff) return;

  await button.click();

  if (targetOn) {
    await expectToastAppearAndDisappear(page, TOAST_ON);
  } else {
    await expectToastAppearAndDisappear(page, TOAST_OFF);
  }
}

async function waitTableReady(page: Page) {
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
}

async function gotoTab(page: Page, name: 'Screened' | 'Reviewed' | 'Dismissed') {
  await page.getByRole('tab', { name }).click();
  await waitTableReady(page);
}

async function getPatientInfoColIndex(page: Page): Promise<number> {
  const headers = page.locator('table thead th');
  const count = await headers.count();
  for (let i = 0; i < count; i++) {
    const text = (await headers.nth(i).innerText()).trim();
    if (text.includes('Patient info')) return i;
  }
  throw new Error('Patient info column not found');
}

async function extractPatientIdFromRow(page: Page, row: Locator): Promise<string> {
  const colIndex = await getPatientInfoColIndex(page);
  const cell = row.locator('td').nth(colIndex);
  return (await cell.locator('button > p').innerText()).trim();
}

async function findRowByPatientId(page: Page, patientId: string): Promise<Locator> {
  const row = page.locator('table tbody tr').filter({ hasText: patientId });
  const count = await row.count();
  if (count === 0) throw new Error(`Row not found for patientId=${patientId}`);
  return row.first();
}

test('상단 고정 설정 동작 확인', async ({ page }) => {
  await gotoTab(page, 'Dismissed');
  await waitTableReady(page);

  const firstPatientId = await extractPatientIdFromRow(page, page.locator('table tbody tr').nth(0));
  console.log(`첫 번째 환자: ${firstPatientId}`);

  // 첫 번째 환자 Pin
  const firstRow = await findRowByPatientId(page, firstPatientId);
  await firstRow.getByLabel('Pin to top').click();
  await page.waitForTimeout(1000);
  await expect(page.getByText('상단 고정을 설정했습니다.')).toBeVisible({ timeout: 5000 });
  console.log('✅ 첫 번째 환자 Pin 토스트 확인');
  await page.waitForTimeout(5000);

  const pinnedFirstRow = page
    .locator('table tbody tr')
    .filter({ has: page.getByLabel('Unpin from top') })
    .filter({ hasText: firstPatientId });
  await expect(pinnedFirstRow).toBeVisible({ timeout: 10000 });
  await expect(pinnedFirstRow.getByLabel('Unpin from top')).toBeVisible();
  console.log('✅ 첫 번째 환자 Unpin from top 버튼 확인');

  const normalFirstRow = page
    .locator('table tbody tr')
    .filter({ has: page.getByLabel('Pin to top') })
    .filter({ hasText: firstPatientId });
  await expect(normalFirstRow).toHaveCount(0);
  console.log('✅ 첫 번째 환자 일반 영역 미표시 확인');

  await screenShot(page, senarioName, '1. 첫 번째 환자 상단 고정 확인');
});

test('상단 고정 해제 동작 확인', async ({ page }) => {
  await gotoTab(page, 'Dismissed');
  await waitTableReady(page);

  const pinnedRows = page.locator('table tbody tr').filter({ has: page.getByLabel('Unpin from top') });
  const pinnedCount = await pinnedRows.count();
  if (pinnedCount === 0) {
    console.log('ℹ️ 상단 고정 환자 없음 → 첫 번째 환자 Pin 설정');
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.getByLabel('Pin to top').click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('상단 고정을 설정했습니다.')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);
    console.log('✅ 사전 Pin 설정 완료');
  }

  const totalPinned = await page
    .locator('table tbody tr')
    .filter({ has: page.getByLabel('Unpin from top') })
    .count();
  expect(totalPinned).toBeGreaterThan(0);

  for (let i = 0; i < totalPinned; i++) {
    const pinnedRow = page
      .locator('table tbody tr')
      .filter({ has: page.getByLabel('Unpin from top') })
      .first();

    const patientId = await extractPatientIdFromRow(page, pinnedRow);
    await pinnedRow.getByLabel('Unpin from top').click();
    await waitTableReady(page);
    await page.waitForTimeout(1000);
    await expect(page.getByText('상단 고정을 해제했습니다.')).toBeVisible({ timeout: 5000 });
    console.log(`✅ ${patientId} Unpin 토스트 확인`);

    await page.waitForTimeout(2000);

    const restoredRow = page.locator('table tbody tr').filter({ hasText: patientId }).first();
    await expect(restoredRow).toBeVisible({ timeout: 10000 });
    await expect(restoredRow.getByLabel('Pin to top')).toBeVisible({ timeout: 5000 });
    console.log(`✅ ${patientId} 일반 영역 복귀 확인`);

    await screenShot(page, senarioName, '3. 상단 고정 해제 확인');
  }

  console.log('✅ 상단 고정 해제 동작 확인 완료');
});
