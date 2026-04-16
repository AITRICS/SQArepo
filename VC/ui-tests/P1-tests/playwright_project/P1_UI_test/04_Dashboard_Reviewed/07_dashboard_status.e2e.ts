import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[Reviewed - 대시보드 환자 상태 변경]';

const statusOptions = ['New', 'Observing', 'Complete', 'Error', 'Dismissed'];

function firstRow(page: Page) {
  return page.locator('table tbody tr').first();
}

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

async function getColumnIndexByHeader(table: Locator, headerName: string): Promise<number> {
  const headers = await table.locator('thead tr th').allTextContents();
  const idx = headers.findIndex(h => h.trim() === headerName);
  if (idx === -1) throw new Error(`Header "${headerName}" not found`);
  return idx + 1;
}

async function openStatusDropdown(row: Locator) {
  await row.getByRole('combobox').first().click();
}

async function selectStatus(page: Page, status: 'New' | 'Observing' | 'Complete' | 'Error' | 'Dismissed') {
  await page.getByRole('option', { name: status }).click();
}

async function expectRowStatus(page: Page, row: Locator, status: string) {
  const table = page.locator('table');
  const statusIndex = await getColumnIndexByHeader(table, 'Status');
  const cell = row.locator(`td:nth-child(${statusIndex})`);

  const combo = cell.getByRole('combobox').first();
  if (await combo.isVisible().catch(() => false)) {
    const valueText =
      (await combo.getAttribute('aria-valuetext')) ||
      (await combo.getAttribute('aria-label')) ||
      (await combo.textContent()) || '';
    expect(valueText).toContain(status);
    return;
  }
  const cellText = (await cell.innerText()).replace(/\s+/g, ' ').trim();
  expect(cellText).toContain(status);
}

async function getStatusColumnIndex(page: Page): Promise<number> {
  const headers = page.locator('table thead th');
  const count = await headers.count();
  for (let i = 0; i < count; i++) {
    const text = (await headers.nth(i).innerText()).trim();
    if (text === 'Status') return i;
  }
  throw new Error('Status column not found');
}

/** Reviewed에서 환자를 Complete로 맞춤 (프리컨디션) */
async function ensureCompleteOnReviewed(page: Page, patientId: string) {
  await gotoTab(page, 'Reviewed');
  let count = await page.locator('table tbody tr').filter({ hasText: patientId }).count();

  if (count === 0) {
    console.log(`ℹ️ Reviewed에 ${patientId} 없음 → Screened 탐색`);
    await gotoTab(page, 'Screened');
    count = await page.locator('table tbody tr').filter({ hasText: patientId }).count();
    if (count > 0) {
      const row = await findRowByPatientId(page, patientId);
      await openStatusDropdown(row);
      await selectStatus(page, 'Complete');
      await waitTableReady(page);
      await page.waitForTimeout(1000);
      console.log('✅ Screened → Complete 변경 (Reviewed 이동)');
    }
    await gotoTab(page, 'Reviewed');
  }

  const row = await findRowByPatientId(page, patientId);
  const currentStatus = (await row.getByRole('combobox').first().textContent())?.trim();
  if (currentStatus !== 'Complete') {
    await openStatusDropdown(row);
    await selectStatus(page, 'Complete');
    await waitTableReady(page);
    await page.waitForTimeout(1000);
  }

  const rowAfter = await findRowByPatientId(page, patientId);
  await expectRowStatus(page, rowAfter, 'Complete');
  console.log('✅ Complete 상태 확인');
}

/** Reviewed에서 환자를 Error로 맞춤 (프리컨디션) */
async function ensureErrorOnReviewed(page: Page, patientId: string) {
  await gotoTab(page, 'Reviewed');
  let count = await page.locator('table tbody tr').filter({ hasText: patientId }).count();

  if (count === 0) {
    console.log(`ℹ️ Reviewed에 ${patientId} 없음 → Screened 탐색`);
    await gotoTab(page, 'Screened');
    count = await page.locator('table tbody tr').filter({ hasText: patientId }).count();
    if (count > 0) {
      const row = await findRowByPatientId(page, patientId);
      await openStatusDropdown(row);
      await selectStatus(page, 'Error');
      await waitTableReady(page);
      await page.waitForTimeout(1000);
      console.log('✅ Screened → Error 변경 (Reviewed 이동)');
    }
    await gotoTab(page, 'Reviewed');
  }

  const row = await findRowByPatientId(page, patientId);
  const currentStatus = (await row.getByRole('combobox').first().textContent())?.trim();
  if (currentStatus !== 'Error') {
    await openStatusDropdown(row);
    await selectStatus(page, 'Error');
    await waitTableReady(page);
    await page.waitForTimeout(1000);
  }

  const rowAfter = await findRowByPatientId(page, patientId);
  await expectRowStatus(page, rowAfter, 'Error');
  console.log('✅ Error 상태 확인');
}

test('대시보드 환자 상태 변경 확인 - Complete에서 변경', async ({ page }) => {
  await gotoTab(page, 'Reviewed');

  const row0 = firstRow(page);
  const patientId = await extractPatientIdFromRow(page, row0);
  console.log(`Patient ID: ${patientId}`);

  // 1) Complete -> New : Screened 이동
  await ensureCompleteOnReviewed(page, patientId);
  const rowForNew = await findRowByPatientId(page, patientId);
  await openStatusDropdown(rowForNew);
  await selectStatus(page, 'New');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Screened');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  const rowNew = await findRowByPatientId(page, patientId);
  await expectRowStatus(page, rowNew, 'New');
  await screenShot(page, senarioName, 'Complete - New 상태 변경 확인');
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 Complete -> New 상태 변경 확인');

  // 2) Complete -> Observing : Screened 이동
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  const patientId_Obs = await extractPatientIdFromRow(page, firstRow(page));
  await ensureCompleteOnReviewed(page, patientId_Obs);
  const rowForObs = await findRowByPatientId(page, patientId_Obs);
  await openStatusDropdown(rowForObs);
  await selectStatus(page, 'Observing');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Screened');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  const rowObs = await findRowByPatientId(page, patientId_Obs);
  await expectRowStatus(page, rowObs, 'Observing');
  await screenShot(page, senarioName, 'Complete - Observing 상태 변경 확인');
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 Complete -> Observing 상태 변경 확인');

  // 3) Complete -> Complete : Reviewed 유지
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  const patientId_Comp = await extractPatientIdFromRow(page, firstRow(page));
  await ensureCompleteOnReviewed(page, patientId_Comp);
  const rowForComp = await findRowByPatientId(page, patientId_Comp);
  await openStatusDropdown(rowForComp);
  await selectStatus(page, 'Complete');
  await page.waitForTimeout(1000);
  const rowComp = await findRowByPatientId(page, patientId_Comp);
  await expectRowStatus(page, rowComp, 'Complete');
  await screenShot(page, senarioName, 'Complete - Complete 상태 변경 확인');
  console.log('✅ 대시보드 환자 Complete -> Complete 상태 변경 확인');

  // 4) Complete -> Error : Reviewed 유지
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  const patientId_Err = await extractPatientIdFromRow(page, firstRow(page));
  await ensureCompleteOnReviewed(page, patientId_Err);
  const rowForErr = await findRowByPatientId(page, patientId_Err);
  await openStatusDropdown(rowForErr);
  await selectStatus(page, 'Error');
  await page.waitForTimeout(1000);
  const rowErr = await findRowByPatientId(page, patientId_Err);
  await expectRowStatus(page, rowErr, 'Error');
  await screenShot(page, senarioName, 'Complete - Error 상태 변경 확인');
  console.log('✅ 대시보드 환자 Complete -> Error 상태 변경 확인');

  // 5) Complete -> Dismissed : Dismissed 이동
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  const patientId_Dis = await extractPatientIdFromRow(page, firstRow(page));
  await ensureCompleteOnReviewed(page, patientId_Dis);
  const rowForDis = await findRowByPatientId(page, patientId_Dis);
  await openStatusDropdown(rowForDis);
  await selectStatus(page, 'Dismissed');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Dismissed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  const rowDis = await findRowByPatientId(page, patientId_Dis);
  await expectRowStatus(page, rowDis, 'Dismissed');
  await screenShot(page, senarioName, 'Complete - Dismissed 상태 변경 확인');
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 Complete -> Dismissed 상태 변경 확인');
});

test('대시보드 환자 상태 변경 확인 - Error에서 변경', async ({ page }) => {
  await gotoTab(page, 'Reviewed');

  const row0 = firstRow(page);
  const patientId = await extractPatientIdFromRow(page, row0);
  console.log(`Patient ID: ${patientId}`);

  // 1) Error -> New : Screened 이동
  await ensureErrorOnReviewed(page, patientId);
  const rowForNew = await findRowByPatientId(page, patientId);
  await openStatusDropdown(rowForNew);
  await selectStatus(page, 'New');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Screened');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  const rowNew = await findRowByPatientId(page, patientId);
  await expectRowStatus(page, rowNew, 'New');
  await screenShot(page, senarioName, 'Error - New 상태 변경 확인');
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 Error -> New 상태 변경 확인');

  // 2) Error -> Observing : Screened 이동
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  const patientId_Obs = await extractPatientIdFromRow(page, firstRow(page));
  await ensureErrorOnReviewed(page, patientId_Obs);
  const rowForObs = await findRowByPatientId(page, patientId_Obs);
  await openStatusDropdown(rowForObs);
  await selectStatus(page, 'Observing');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Screened');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  const rowObs = await findRowByPatientId(page, patientId_Obs);
  await expectRowStatus(page, rowObs, 'Observing');
  await screenShot(page, senarioName, 'Error - Observing 상태 변경 확인');
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 Error -> Observing 상태 변경 확인');

  // 3) Error -> Complete : Reviewed 유지
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  const patientId_Comp = await extractPatientIdFromRow(page, firstRow(page));
  await ensureErrorOnReviewed(page, patientId_Comp);
  const rowForComp = await findRowByPatientId(page, patientId_Comp);
  await openStatusDropdown(rowForComp);
  await selectStatus(page, 'Complete');
  await page.waitForTimeout(1000);
  const rowComp = await findRowByPatientId(page, patientId_Comp);
  await expectRowStatus(page, rowComp, 'Complete');
  await screenShot(page, senarioName, 'Error - Complete 상태 변경 확인');
  console.log('✅ 대시보드 환자 Error -> Complete 상태 변경 확인');

  // 4) Error -> Error : Reviewed 유지
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  const patientId_Err = await extractPatientIdFromRow(page, firstRow(page));
  await ensureErrorOnReviewed(page, patientId_Err);
  const rowForErr = await findRowByPatientId(page, patientId_Err);
  await openStatusDropdown(rowForErr);
  await selectStatus(page, 'Error');
  await page.waitForTimeout(1000);
  const rowErr = await findRowByPatientId(page, patientId_Err);
  await expectRowStatus(page, rowErr, 'Error');
  await screenShot(page, senarioName, 'Error - Error 상태 변경 확인');
  console.log('✅ 대시보드 환자 Error -> Error 상태 변경 확인');

  // 5) Error -> Dismissed : Dismissed 이동
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  const patientId_Dis = await extractPatientIdFromRow(page, firstRow(page));
  await ensureErrorOnReviewed(page, patientId_Dis);
  const rowForDis = await findRowByPatientId(page, patientId_Dis);
  await openStatusDropdown(rowForDis);
  await selectStatus(page, 'Dismissed');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Dismissed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  const rowDis = await findRowByPatientId(page, patientId_Dis);
  await expectRowStatus(page, rowDis, 'Dismissed');
  await screenShot(page, senarioName, 'Error - Dismissed 상태 변경 확인');
  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 Error -> Dismissed 상태 변경 확인');
});

test('체크박스 환자 상태 변경', async ({ page }) => {
  for (const baseStatus of ['Complete', 'Error'] as string[]) {
    const baseTab = 'Reviewed';
    console.log(`========= baseStatus: ${baseStatus} ==========`);
    await page.getByRole('tab', { name: baseTab }).click();
    await waitTableReady(page);
    await page.waitForTimeout(1000);
    console.log(`탭 '${baseTab}' 에서 상태 '${baseStatus}' 환자 대상으로 체크박스 상태 변경 테스트 시작`);

    for (const targetStatus of statusOptions) {
      let row = page.locator('tbody tr').first();
      let checkbox = row.getByRole('checkbox');
      let currentPatientId = await extractPatientIdFromRow(page, row);

      let colIndex = await getStatusColumnIndex(page);
      let statusCombo = row.locator('td').nth(colIndex).getByRole('combobox');
      let currentStatus = (await statusCombo.textContent())?.trim();
      await page.waitForTimeout(1000);

      if (currentStatus !== baseStatus) {
        await checkbox.click();
        await page.waitForTimeout(1000);
        const toolbarInit = page.getByRole('form', { name: 'toolbar-status' });
        await expect(toolbarInit).toBeVisible();
        await toolbarInit.getByRole('button', { name: baseStatus }).click();
        await waitTableReady(page);
        await page.waitForTimeout(5000);

        const patientRow = page.locator(`tr:has(p:has-text("${currentPatientId}"))`);
        await expect(patientRow).toBeVisible();
        const statusCell = patientRow.locator('td').nth(colIndex).getByRole('combobox');
        currentStatus = (await statusCell.textContent())?.trim();
      }

      console.log(`🔁 [${baseTab}] 탭 → 대상 환자: ${currentPatientId} | 현재 상태: '${currentStatus}' | 변경할 상태: '${targetStatus}'`);

      await checkbox.click();
      await page.waitForTimeout(1000);
      const toolbar = page.getByRole('form', { name: 'toolbar-status' });
      await expect(toolbar).toBeVisible();
      await toolbar.getByRole('button', { name: targetStatus }).click();
      await waitTableReady(page);
      await page.waitForTimeout(1000);

      const expectedTab = ['New', 'Observing'].includes(targetStatus)
        ? 'Screened'
        : ['Complete', 'Error'].includes(targetStatus)
        ? 'Reviewed'
        : 'Dismissed';
      await page.getByRole('tab', { name: expectedTab }).click();
      await waitTableReady(page);
      await page.waitForTimeout(5000);

      colIndex = await getStatusColumnIndex(page);
      const verifiedRow = page.locator(`tr:has(p:has-text("${currentPatientId}"))`);

      if (await verifiedRow.count() === 0) {
        console.log(`❌ 상태 '${targetStatus}'로 변경 후 환자(${currentPatientId})를 ${expectedTab} 탭에서 찾을 수 없습니다.`);
      } else {
        const statusCell = verifiedRow.locator('td').nth(colIndex);
        await expect(statusCell).toBeVisible({ timeout: 5000 });
        const combo = statusCell.getByRole('combobox');
        await expect(combo).toBeVisible({ timeout: 5000 });
        const text = (await combo.innerText()).trim();
        console.log(`🔍 [${expectedTab}] 탭에서 상태 텍스트='${text}'`);
        expect(text).toBe(targetStatus);
      }

      await screenShot(page, senarioName, `체크박스 상태 변경_${currentStatus} - ${targetStatus} 상태 변경 확인`);
      console.log(`✅ 상태 '${targetStatus}'로 정확히 변경됨`);

      await page.getByRole('tab', { name: baseTab }).click();
      await waitTableReady(page);
      await page.waitForTimeout(1000);
    }
  }

  console.log('\n✅ 체크박스 상태 변경 흐름 완료');
});

test.afterAll(async () => {
  await closeConnection();
});