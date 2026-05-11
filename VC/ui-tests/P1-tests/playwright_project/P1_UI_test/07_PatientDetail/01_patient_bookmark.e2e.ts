import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { executeQuery } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = 'TC_002_007 Patient Detail/[01. 환자 상세 - 북마크 및 상단고정]';

const TOAST_BOOKMARK_ON = '북마크 등록이 완료되었습니다.';
const TOAST_BOOKMARK_OFF = '북마크 해제가 완료되었습니다.';
const TOAST_PIN_ON = '상단 고정을 설정했습니다.';
const TOAST_PIN_OFF = '상단 고정을 해제했습니다.';

test.beforeEach(async ({ page }) => {
  test.setTimeout(0);
  await executeQuery(`DELETE FROM accounts_pin WHERE username = '${adminID}'`);
  await page.goto('/ko/login');
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

// ========== 헬퍼 ==========

async function getColIndex(page: Page, colName: string): Promise<number> {
  const headers = await page.locator('table thead tr th').allTextContents();
  const idx = headers.findIndex(h => h.trim().includes(colName));
  if (idx < 0) throw new Error(`Column not found: ${colName}`);
  return idx + 1;
}

async function openPatientDetailTab(page: Page, row: Locator): Promise<Page> {
  const locationIndex = await getColIndex(page, 'Location');
  const [detailPage] = await Promise.all([
    page.context().waitForEvent('page'),
    row.locator(`td:nth-child(${locationIndex})`).click(),
  ]);
  await detailPage.waitForLoadState('domcontentloaded');
  await detailPage.waitForTimeout(1500);
  return detailPage;
}

async function expectToastAndWait(page: Page, text: string) {
  const toast = page.getByText(text);
  await toast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  await Promise.race([
    toast.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {}),
    toast.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {}),
  ]);
}

// ========== 테스트 ==========

test('환자 상세 북마크 on/off 확인', async ({ page }) => {
  const patientInfoIndex = await getColIndex(page, 'Patient info');
  const firstRow = page.locator('tbody tr').first();
  const patientId = (await firstRow.locator(`td:nth-child(${patientInfoIndex}) button > p`).innerText()).trim();
  console.log(`Patient ID: ${patientId}`);

  const detailPage = await openPatientDetailTab(page, firstRow);

  const bookmarkButton = detailPage.getByTestId('patient-detail-info-favorite');
  await expect(bookmarkButton).toBeVisible({ timeout: 10000 });

  // 첫 클릭으로 현재 상태 감지
  await bookmarkButton.click();
  const startedOff = await detailPage.getByText(TOAST_BOOKMARK_ON)
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);

  if (startedOff) {
    // 초기 상태 OFF → ON 됨
    await screenShot(detailPage, senarioName, '1. 북마크 on 확인');
    console.log('✅ 북마크 on 확인');
    await expectToastAndWait(detailPage, TOAST_BOOKMARK_ON);
    await detailPage.waitForTimeout(1000);

    // ON → OFF
    await bookmarkButton.click();
    await expect(detailPage.getByText(TOAST_BOOKMARK_OFF)).toBeVisible({ timeout: 5000 });
    await screenShot(detailPage, senarioName, '2. 북마크 off 확인');
    console.log('✅ 북마크 off 확인');
    await expectToastAndWait(detailPage, TOAST_BOOKMARK_OFF);
  } else {
    // 초기 상태 ON → OFF 됨
    await screenShot(detailPage, senarioName, '1. 북마크 off 확인');
    console.log('✅ 북마크 off 확인');
    await expectToastAndWait(detailPage, TOAST_BOOKMARK_OFF);
    await detailPage.waitForTimeout(1000);

    // OFF → ON
    await bookmarkButton.click();
    await expect(detailPage.getByText(TOAST_BOOKMARK_ON)).toBeVisible({ timeout: 5000 });
    await screenShot(detailPage, senarioName, '2. 북마크 on 확인');
    console.log('✅ 북마크 on 확인');
    await expectToastAndWait(detailPage, TOAST_BOOKMARK_ON);
  }

  await detailPage.close();
});

test('환자 상세 상단고정 on/off 확인', async ({ page }) => {
  const patientInfoIndex = await getColIndex(page, 'Patient info');
  const firstRow = page.locator('tbody tr').first();
  const patientId = (await firstRow.locator(`td:nth-child(${patientInfoIndex}) button > p`).innerText()).trim();
  console.log(`Patient ID: ${patientId}`);

  const detailPage = await openPatientDetailTab(page, firstRow);

  const pinButton = detailPage.getByTestId('patient-detail-info-pin');
  await expect(pinButton).toBeVisible({ timeout: 10000 });

  // 첫 클릭으로 현재 상태 감지
  await pinButton.click();
  const startedUnpinned = await detailPage.getByText(TOAST_PIN_ON)
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);

  if (startedUnpinned) {
    // 초기 상태 해제 → 고정됨
    await screenShot(detailPage, senarioName, '3. 상단고정 on 확인');
    console.log('✅ 상단고정 on 확인');
    await expectToastAndWait(detailPage, TOAST_PIN_ON);
    await detailPage.close();

    // 대시보드 새로고침 후 상단 고정 영역 확인
    await page.reload();
    await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
    const pinnedRow = page
      .locator('table tbody tr')
      .filter({ has: page.getByLabel('Unpin from top') })
      .filter({ hasText: patientId });
    await expect(pinnedRow).toBeVisible({ timeout: 10000 });
    console.log('✅ 대시보드 상단 고정 영역 확인');

    // 상세 다시 열어서 상단고정 OFF
    const detailPage2 = await openPatientDetailTab(page, pinnedRow);
    const pinButton2 = detailPage2.getByTestId('patient-detail-info-pin');
    await expect(pinButton2).toBeVisible({ timeout: 10000 });
    await detailPage2.waitForTimeout(1000);

    await pinButton2.click();
    await expect(detailPage2.getByText(TOAST_PIN_OFF)).toBeVisible({ timeout: 5000 });
    await screenShot(detailPage2, senarioName, '4. 상단고정 off 확인');
    console.log('✅ 상단고정 off 확인');
    await expectToastAndWait(detailPage2, TOAST_PIN_OFF);
    await detailPage2.close();

    // 대시보드 새로고침 후 일반 영역 복귀 확인
    await page.reload();
    await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
    const restoredRow = page.locator('table tbody tr').filter({ hasText: patientId }).first();
    await expect(restoredRow).toBeVisible({ timeout: 10000 });
    await expect(restoredRow.getByLabel('Pin to top')).toBeVisible({ timeout: 5000 });
    console.log('✅ 대시보드 일반 영역 복귀 확인');
  } else {
    // 초기 상태 고정됨 → 해제됨
    await screenShot(detailPage, senarioName, '3. 상단고정 off 확인');
    console.log('✅ 상단고정 off 확인');
    await expectToastAndWait(detailPage, TOAST_PIN_OFF);
    await detailPage.close();

    // 대시보드 새로고침 후 일반 영역 확인
    await page.reload();
    await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
    const normalRow = page.locator('table tbody tr').filter({ hasText: patientId }).first();
    await expect(normalRow).toBeVisible({ timeout: 10000 });
    await expect(normalRow.getByLabel('Pin to top')).toBeVisible({ timeout: 5000 });
    console.log('✅ 대시보드 일반 영역 확인');

    // 상세 다시 열어서 상단고정 ON
    const detailPage2 = await openPatientDetailTab(page, normalRow);
    const pinButton2 = detailPage2.getByTestId('patient-detail-info-pin');
    await expect(pinButton2).toBeVisible({ timeout: 10000 });
    await detailPage2.waitForTimeout(1000);

    await pinButton2.click();
    await expect(detailPage2.getByText(TOAST_PIN_ON)).toBeVisible({ timeout: 5000 });
    await screenShot(detailPage2, senarioName, '4. 상단고정 on 확인');
    console.log('✅ 상단고정 on 확인');
    await expectToastAndWait(detailPage2, TOAST_PIN_ON);
    await detailPage2.close();

    // 대시보드 새로고침 후 상단 고정 영역 확인
    await page.reload();
    await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
    const pinnedRow = page
      .locator('table tbody tr')
      .filter({ has: page.getByLabel('Unpin from top') })
      .filter({ hasText: patientId });
    await expect(pinnedRow).toBeVisible({ timeout: 10000 });
    console.log('✅ 대시보드 상단 고정 영역 확인');
  }
});