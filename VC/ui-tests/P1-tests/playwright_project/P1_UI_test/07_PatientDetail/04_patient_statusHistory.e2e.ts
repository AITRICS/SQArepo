import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = 'TC_002_007 Patient Detail/[04. 환자 상세 - 상태 변경 이력]';

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

async function openStatusHistoryModal(detailPage: Page) {
  await detailPage.getByRole('button', { name: 'Status Change History' }).click();
  await expect(detailPage.getByRole('dialog', { name: 'Status Change History' })).toBeVisible({ timeout: 5000 });
}

// ========== 테스트 ==========

test('상태 변경 이력 모달 노출 확인', async ({ page }) => {
  const detailPage = await openPatientDetailTab(page, page.locator('tbody tr').first());

  await detailPage.getByRole('button', { name: 'Status Change History' }).click();

  const dialog = detailPage.getByRole('dialog', { name: 'Status Change History' });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await screenShot(detailPage, senarioName, '1. 상태 변경 이력 모달 노출 확인');
  console.log('✅ 상태 변경 이력 모달 노출 확인');

  await detailPage.close();
});

test('상태 변경 이력 모달 구성 확인', async ({ page }) => {
  const firstRow = page.locator('tbody tr').first();

  // 대시보드에서 EMR ID 추출
  const patientInfoIndex = await getColIndex(page, 'Patient info');
  const emrId = (await firstRow.locator(`td:nth-child(${patientInfoIndex}) button > p`).innerText()).trim();

  const detailPage = await openPatientDetailTab(page, firstRow);

  // 환자 상세 페이지에서 환자 이름/성별/나이 추출 (예: "QA0301630011(M/26)")
  const patientInfoText = (await detailPage.getByText(/\([MF]\/\d+\)/).first().textContent())?.trim() ?? '';

  await openStatusHistoryModal(detailPage);

  const dialog = detailPage.getByRole('dialog', { name: 'Status Change History' });

  await expect(detailPage.getByRole('heading', { name: 'Status Change History' })).toBeVisible();
  console.log('✅ 모달명 표시 확인');

  await expect(detailPage.getByRole('button', { name: 'Close' })).toBeVisible();
  console.log('✅ 닫기 버튼 표시 확인');

  // 환자 상세 페이지의 환자 정보와 모달 내 환자 정보 일치 확인
  await expect(dialog.getByText(patientInfoText)).toBeVisible();
  await expect(dialog.getByText(emrId)).toBeVisible();
  console.log('✅ 환자 정보 표시 확인');

  // 상태 변경 이력 테이블 표시 확인 (날짜는 동적이므로 행 존재 여부 확인)
  await expect(dialog.getByRole('row').nth(1)).toBeVisible({ timeout: 5000 });
  console.log('✅ 상태 변경 이력 테이블 표시 확인');

  await screenShot(detailPage, senarioName, '2. 상태 변경 이력 모달 구성 확인');

  await detailPage.close();
});

test('상태 변경 이력 테이블 컬럼 확인', async ({ page }) => {
  const detailPage = await openPatientDetailTab(page, page.locator('tbody tr').first());
  await openStatusHistoryModal(detailPage);

  await expect(detailPage.getByRole('columnheader', { name: 'Date' })).toBeVisible();
  await expect(detailPage.getByRole('columnheader', { name: 'Change to' })).toBeVisible();
  await expect(detailPage.getByRole('columnheader', { name: 'ID' })).toBeVisible();
  console.log('✅ Date 컬럼 확인');
  console.log('✅ Change to 컬럼 확인');
  console.log('✅ ID 컬럼 확인');

  // Date 컬럼 날짜 형식 확인 (yyyy-mm-dd hh:mm)
  const dialog = detailPage.getByRole('dialog', { name: 'Status Change History' });
  const firstDataRow = dialog.getByRole('row').nth(1);
  await expect(firstDataRow).toBeVisible({ timeout: 5000 });
  const dateText = (await firstDataRow.getByRole('cell').first().textContent())?.trim() ?? '';
  expect(dateText).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  console.log(`✅ Date 형식 확인: ${dateText}`);

  await screenShot(detailPage, senarioName, '3. 상태 변경 이력 테이블 컬럼 확인');

  await detailPage.close();
});

test('상태 변경 이력 모달 닫기 버튼 동작 확인', async ({ page }) => {
  const detailPage = await openPatientDetailTab(page, page.locator('tbody tr').first());
  await openStatusHistoryModal(detailPage);

  await detailPage.getByRole('button', { name: 'Close' }).click();

  await expect(detailPage.getByRole('dialog', { name: 'Status Change History' })).not.toBeVisible({ timeout: 5000 });
  await screenShot(detailPage, senarioName, '4. 상태 변경 이력 모달 닫기 확인');
  console.log('✅ 상태 변경 이력 모달 닫기 확인');

  await detailPage.close();
});
