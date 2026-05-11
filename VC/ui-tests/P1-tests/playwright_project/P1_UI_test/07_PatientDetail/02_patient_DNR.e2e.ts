import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = 'TC_002_007 Patient Detail/[02. 환자 상세 - DNR 설정 확인]';

test.beforeEach(async ({ page }) => {
  test.setTimeout(0);
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

async function getPatientId(page: Page, row: Locator): Promise<string> {
  const patientInfoIndex = await getColIndex(page, 'Patient info');
  return (await row.locator(`td:nth-child(${patientInfoIndex}) button > p`).innerText()).trim();
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

async function getDnrState(detailPage: Page): Promise<boolean> {
  const toggle = detailPage.getByTestId('patient-detail-info-dnr');
  return (await toggle.getAttribute('aria-checked')) === 'true';
}

async function reloadAndWait(page: Page) {
  await page.reload();
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
}

// ========== 테스트 ==========

test('DNR 등록 확인', async ({ page }) => {
  const firstRow = page.locator('tbody tr').first();
  const patientId = await getPatientId(page, firstRow);
  const detailPage = await openPatientDetailTab(page, firstRow);

  const toggle = detailPage.getByTestId('patient-detail-info-dnr');
  await expect(toggle).toBeVisible({ timeout: 10000 });

  // ON 상태면 OFF로 초기화
  if (await getDnrState(detailPage)) {
    console.log('ℹ️ 초기 DNR ON → OFF로 초기화');
    await toggle.click();
    await expect(detailPage.getByRole('dialog', { name: 'DNR 해제' })).toBeVisible({ timeout: 5000 });
    await detailPage.getByRole('button', { name: '예' }).click();
    await detailPage.waitForTimeout(1000);
  }

  // 등록 진행
  await toggle.click();
  const dialog = detailPage.getByRole('dialog', { name: 'DNR환자로 등록하시겠습니까?' });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await screenShot(detailPage, senarioName, '1. DNR 등록 다이얼로그 확인');
  console.log('✅ DNR 등록 다이얼로그 확인');

  await detailPage.getByRole('checkbox', { name: '별지 제1호서식 확인' }).click();
  await detailPage.getByRole('button', { name: '등록' }).click();
  await expect(detailPage.getByText('DNR환자로 등록하였습니다.')).toBeVisible({ timeout: 5000 });
  await screenShot(detailPage, senarioName, '2. DNR 등록 완료 확인');
  console.log('✅ DNR 등록 완료 확인');

  expect(await getDnrState(detailPage)).toBe(true);
  await detailPage.close();

  // 대시보드 새로고침 후 D 뱃지 확인
  await reloadAndWait(page);
  await expect(page.getByRole('button', { name: `D ${patientId} EMR ID 복사` })).toBeVisible({ timeout: 10000 });
  await screenShot(page, senarioName, '3. 대시보드 DNR 뱃지 확인');
  console.log('✅ 대시보드 D 뱃지 확인');
});

test('DNR 해제 확인', async ({ page }) => {
  const firstRow = page.locator('tbody tr').first();
  const patientId = await getPatientId(page, firstRow);
  const detailPage = await openPatientDetailTab(page, firstRow);

  const toggle = detailPage.getByTestId('patient-detail-info-dnr');
  await expect(toggle).toBeVisible({ timeout: 10000 });

  // OFF 상태면 ON으로 초기화
  if (!(await getDnrState(detailPage))) {
    console.log('ℹ️ 초기 DNR OFF → ON으로 초기화');
    await toggle.click();
    await detailPage.getByRole('checkbox', { name: '별지 제1호서식 확인' }).click();
    await detailPage.getByRole('button', { name: '등록' }).click();
    await detailPage.waitForTimeout(1000);
  }

  // 해제 진행
  await toggle.click();
  const dialog = detailPage.getByRole('dialog', { name: 'DNR 해제' });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await screenShot(detailPage, senarioName, '4. DNR 해제 다이얼로그 확인');
  console.log('✅ DNR 해제 다이얼로그 확인');

  await detailPage.getByRole('button', { name: '예' }).click();
  await expect(detailPage.getByText('DNR을 해제하였습니다.')).toBeVisible({ timeout: 5000 });
  expect(await getDnrState(detailPage)).toBe(false);
  await screenShot(detailPage, senarioName, '5. DNR 해제 완료 확인');
  console.log('✅ DNR 해제 완료 확인');

  await detailPage.close();

  // 대시보드 새로고침 후 D 뱃지 없음 확인
  await reloadAndWait(page);
  await expect(page.getByRole('button', { name: `D ${patientId} EMR ID 복사` })).not.toBeVisible({ timeout: 5000 });
  await expect(page.getByRole('button', { name: `${patientId} EMR ID 복사` })).toBeVisible({ timeout: 10000 });
  await screenShot(page, senarioName, '6. 대시보드 DNR 뱃지 제거 확인');
  console.log('✅ 대시보드 D 뱃지 제거 확인');
});

test('DNR 직접 입력 등록 확인', async ({ page }) => {
  const firstRow = page.locator('tbody tr').first();
  const patientId = await getPatientId(page, firstRow);
  const detailPage = await openPatientDetailTab(page, firstRow);

  const toggle = detailPage.getByTestId('patient-detail-info-dnr');
  await expect(toggle).toBeVisible({ timeout: 10000 });

  // ON 상태면 OFF로 초기화
  if (await getDnrState(detailPage)) {
    console.log('ℹ️ 초기 DNR ON → OFF로 초기화');
    await toggle.click();
    await expect(detailPage.getByRole('dialog', { name: 'DNR 해제' })).toBeVisible({ timeout: 5000 });
    await detailPage.getByRole('button', { name: '예' }).click();
    await detailPage.waitForTimeout(1000);
  }

  await toggle.click();
  const dialog = detailPage.getByRole('dialog', { name: 'DNR환자로 등록하시겠습니까?' });
  await expect(dialog).toBeVisible({ timeout: 5000 });

  await detailPage.getByRole('checkbox', { name: '직접 입력' }).click();

  const textbox = detailPage.getByRole('textbox');
  await expect(textbox).toBeVisible({ timeout: 3000 });
  await textbox.fill('P1 auto test');
  console.log('✅ DNR 직접 입력 텍스트박스 확인');

  await detailPage.getByRole('button', { name: '등록' }).click();
  await expect(detailPage.getByText('DNR환자로 등록하였습니다.')).toBeVisible({ timeout: 5000 });
  expect(await getDnrState(detailPage)).toBe(true);
  await screenShot(detailPage, senarioName, '8. DNR 직접 입력 등록 완료 확인');
  console.log('✅ DNR 직접 입력 등록 완료 확인');

  await detailPage.close();

  // 대시보드 새로고침 후 D 뱃지 확인
  await reloadAndWait(page);
  await expect(page.getByRole('button', { name: `D ${patientId} EMR ID 복사` })).toBeVisible({ timeout: 10000 });
  await screenShot(page, senarioName, '9. 대시보드 DNR 뱃지 확인');
  console.log('✅ 대시보드 D 뱃지 확인');
});

test('DNR 변경 이력 확인', async ({ page }) => {
  const firstRow = page.locator('tbody tr').first();
  const detailPage = await openPatientDetailTab(page, firstRow);

  const toggle = detailPage.getByTestId('patient-detail-info-dnr');
  await expect(toggle).toBeVisible({ timeout: 10000 });

  await detailPage.getByRole('button', { name: 'DNR change history' }).click();

  const historyDialog = detailPage.getByRole('dialog', { name: 'DNR Change History' });
  await expect(historyDialog).toBeVisible({ timeout: 5000 });
  await screenShot(detailPage, senarioName, '7. DNR 변경 이력 모달 확인');
  console.log('✅ DNR 변경 이력 모달 확인');

  await detailPage.close();
});
