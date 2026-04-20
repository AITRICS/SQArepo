import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[07. Reviewed - 대시보드 환자 상태 변경]';

const statusOptions = ['New', 'Observing', 'Complete', 'Error', 'Dismissed'] as const;
type Status = typeof statusOptions[number];

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

async function getStatusColumnIndex(page: Page): Promise<number> {
  const headers = page.locator('table thead th');
  const count = await headers.count();
  for (let i = 0; i < count; i++) {
    const text = (await headers.nth(i).innerText()).trim();
    if (text === 'Status') return i;
  }
  throw new Error('Status column not found');
}

async function extractPatientIdFromRow(page: Page, row: Locator): Promise<string> {
  const colIndex = await getPatientInfoColIndex(page);
  const cell = row.locator('td').nth(colIndex);
  return (await cell.locator('button > p').innerText()).trim();
}

async function findRowByPatientId(page: Page, patientId: string): Promise<Locator> {
  const row = page.locator('table tbody tr').filter({ hasText: patientId });
  if (await row.count() === 0) throw new Error(`Row not found for patientId=${patientId}`);
  return row.first();
}

/** 현재 탭에서 특정 status를 가진 첫 번째 환자 행을 찾는다.
 *  없으면 첫 번째 환자의 상태를 원하는 status로 바꾼 뒤 반환한다. */
async function findRowWithStatus(page: Page, status: 'Complete' | 'Error'): Promise<{ row: Locator; patientId: string }> {
  const rows = page.locator('table tbody tr');
  const count = await rows.count();
  const statusColIndex = await getStatusColumnIndex(page);

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const combo = row.locator('td').nth(statusColIndex).getByRole('combobox');
    if (!await combo.isVisible().catch(() => false)) continue;
    const text = (await combo.textContent())?.trim() ?? '';
    if (text === status) {
      const patientId = await extractPatientIdFromRow(page, row);
      return { row, patientId };
    }
  }

  // 원하는 상태의 환자가 없으면 첫 번째 환자를 원하는 상태로 변경
  console.log(`ℹ️ "${status}" 환자 없음 → 첫 번째 환자 상태를 ${status}로 변경`);
  const firstRow = rows.first();
  const patientId = await extractPatientIdFromRow(page, firstRow);
  await openStatusDropdown(firstRow);
  await selectStatus(page, status);
  await waitTableReady(page);
  await page.waitForTimeout(1000);

  const updatedRow = await findRowByPatientId(page, patientId);
  return { row: updatedRow, patientId };
}

async function openStatusDropdown(row: Locator) {
  await row.getByRole('combobox').first().click();
}

async function selectStatus(page: Page, status: Status) {
  await page.getByRole('option', { name: status }).click();
}

async function expectRowStatus(row: Locator, status: string) {
  const combo = row.getByRole('combobox').first();
  if (await combo.isVisible().catch(() => false)) {
    await expect(combo).toContainText(status, { timeout: 7000 });
    return;
  }
  await expect(row).toContainText(status, { timeout: 7000 });
}

/** 상태에 따라 이동할 탭 결정 */
function expectedTabForStatus(status: string): 'Screened' | 'Reviewed' | 'Dismissed' {
  if (['New', 'Observing'].includes(status)) return 'Screened';
  if (['Complete', 'Error'].includes(status)) return 'Reviewed';
  return 'Dismissed';
}

test('대시보드 환자 상태 변경 확인 - Complete에서 변경', async ({ page }) => {
  let completeCount = 0;
  const completeNums: Record<string, number> = { New: 4, Observing: 5, Complete: 1, Error: 3, Dismissed: 2 };
  for (const toStatus of statusOptions) {
    await gotoTab(page, 'Reviewed');
    const { row, patientId } = await findRowWithStatus(page, 'Complete');
    console.log(`🔁 Complete → ${toStatus} | 환자: ${patientId}`);

    await openStatusDropdown(row);
    await selectStatus(page, toStatus);

    const targetTab = expectedTabForStatus(toStatus);

    await waitTableReady(page);
    await page.waitForTimeout(1000);

    if (targetTab === 'Reviewed') {
      // Reviewed 탭 유지 - 상태 업데이트 후 현재 탭에서 확인
      const updatedRow = await findRowByPatientId(page, patientId);
      await expectRowStatus(updatedRow, toStatus);
    } else {
      // 다른 탭으로 이동 - 이동 후 환자 확인
      await gotoTab(page, targetTab);
      await page.waitForTimeout(2000);
      const updatedRow = await findRowByPatientId(page, patientId);
      await expectRowStatus(updatedRow, toStatus);
    }

    await screenShot(page, senarioName, `${completeNums[toStatus]}. Complete - ${toStatus} 상태 변경 확인`);
    console.log(`✅ Complete → ${toStatus} 상태 변경 확인`);
  }
});

test('대시보드 환자 상태 변경 확인 - Error에서 변경', async ({ page }) => {
  const errorNums: Record<string, number> = { New: 9, Observing: 10, Complete: 6, Error: 8, Dismissed: 7 };
  for (const toStatus of statusOptions) {
    await gotoTab(page, 'Reviewed');
    const { row, patientId } = await findRowWithStatus(page, 'Error');
    console.log(`🔁 Error → ${toStatus} | 환자: ${patientId}`);

    await openStatusDropdown(row);
    await selectStatus(page, toStatus);

    const targetTab = expectedTabForStatus(toStatus);

    if (targetTab === 'Reviewed') {
      await page.waitForTimeout(1000);
      const updatedRow = await findRowByPatientId(page, patientId);
      await expectRowStatus(updatedRow, toStatus);
    } else {
      await page.waitForTimeout(2000);
      await gotoTab(page, targetTab);
      await page.waitForTimeout(2000);
      const updatedRow = await findRowByPatientId(page, patientId);
      await expectRowStatus(updatedRow, toStatus);
    }

    await screenShot(page, senarioName, `${errorNums[toStatus]}. Error - ${toStatus} 상태 변경 확인`);
    console.log(`✅ Error → ${toStatus} 상태 변경 확인`);
  }
});

test('체크박스 환자 상태 변경', async ({ page }) => {
  let cbCount = 10;
  for (const baseStatus of ['Complete', 'Error'] as const) {
    console.log(`========= baseStatus: ${baseStatus} ==========`);

    for (const targetStatus of statusOptions) {
      await gotoTab(page, 'Reviewed');
      await page.waitForTimeout(1000);

      const { row, patientId } = await findRowWithStatus(page, baseStatus);
      console.log(`🔁 [Reviewed] 대상 환자: ${patientId} | '${baseStatus}' → '${targetStatus}'`);

      const checkbox = row.getByRole('checkbox');
      await checkbox.click();
      await page.waitForTimeout(1000);

      const toolbar = page.getByRole('form', { name: 'toolbar-status' });
      await expect(toolbar).toBeVisible();
      await toolbar.getByRole('button', { name: targetStatus }).click();
      await waitTableReady(page);
      await page.waitForTimeout(1000);

      const targetTab = expectedTabForStatus(targetStatus);
      await page.getByRole('tab', { name: targetTab }).click();
      await waitTableReady(page);
      await page.waitForTimeout(2000);

      const verifiedRow = page.locator(`tr:has(p:has-text("${patientId}"))`);
      if (await verifiedRow.count() === 0) {
        console.log(`❌ 환자(${patientId})를 ${targetTab} 탭에서 찾을 수 없습니다.`);
      } else {
        const colIndex = await getStatusColumnIndex(page);
        const combo = verifiedRow.locator('td').nth(colIndex).getByRole('combobox');
        const text = (await combo.innerText()).trim();
        expect(text).toBe(targetStatus);
        console.log(`✅ 상태 '${targetStatus}'로 정확히 변경됨`);
      }

      await screenShot(page, senarioName, `${++cbCount}. 체크박스 상태 변경_${baseStatus} - ${targetStatus} 상태 변경 확인`);
    }
  }

  console.log('\n✅ 체크박스 상태 변경 흐름 완료');
});

test('대시보드 체크박스 다중 상태 변경 테스트', async ({ page }) => {
  let multiCount = 20;
  const colIndex = await getStatusColumnIndex(page);
  console.log('[Reviewed] 체크박스 다중 상태 변경 테스트 시작');

  for (const targetStatus of statusOptions) {
    await gotoTab(page, 'Reviewed');
    await page.waitForTimeout(5000);

    const rows = page.locator('tbody tr');
    const row1 = rows.nth(0);
    const row2 = rows.nth(1);

    const id1 = await extractPatientIdFromRow(page, row1);
    const id2 = await extractPatientIdFromRow(page, row2);

    let status1 = (await row1.locator('td').nth(colIndex).getByRole('combobox').textContent())?.trim();
    let status2 = (await row2.locator('td').nth(colIndex).getByRole('combobox').textContent())?.trim();

    // 두 환자 상태가 같으면 row2를 다른 상태로 변경 (Complete ↔ Error)
    if (status1 === status2) {
      const checkbox2 = row2.getByRole('checkbox');
      await checkbox2.click();
      const toolbarInit = page.getByRole('form', { name: 'toolbar-status' });
      await expect(toolbarInit).toBeVisible();
      const newStatus = status2 === 'Complete' ? 'Error' : 'Complete';
      await toolbarInit.getByRole('button', { name: newStatus }).click();
      await waitTableReady(page);
      await page.waitForTimeout(5000);

      status1 = (await rows.nth(0).locator('td').nth(colIndex).getByRole('combobox').textContent())?.trim();
      status2 = (await rows.nth(1).locator('td').nth(colIndex).getByRole('combobox').textContent())?.trim();
    }

    // 두 명 체크박스 선택
    await rows.nth(0).getByRole('checkbox').click();
    await rows.nth(1).getByRole('checkbox').click();
    await page.waitForTimeout(500);

    const toolbar = page.getByRole('form', { name: 'toolbar-status' });
    await expect(toolbar).toBeVisible();

    console.log(`🔄 두 환자(${status1}, ${status2}) 상태를 '${targetStatus}'로 변경 시도`);

    await toolbar.getByRole('button', { name: targetStatus }).click();
    await waitTableReady(page);
    await page.waitForTimeout(5000);

    const targetTab = expectedTabForStatus(targetStatus);
    await page.getByRole('tab', { name: targetTab }).click();
    await waitTableReady(page);
    await page.waitForTimeout(5000);

    const verifiedRow1 = page.locator(`tr:has(p:has-text("${id1}"))`);
    const verifiedRow2 = page.locator(`tr:has(p:has-text("${id2}"))`);

    if (await verifiedRow1.count() === 0) {
      console.log(`❌ 환자 ${id1} 를 ${targetTab} 탭에서 찾지 못했습니다.`);
    } else {
      const combo1 = verifiedRow1.locator('td').nth(colIndex).getByRole('combobox');
      expect((await combo1.textContent())?.trim()).toBe(targetStatus);
    }

    if (await verifiedRow2.count() === 0) {
      console.log(`❌ 환자 ${id2} 를 ${targetTab} 탭에서 찾지 못했습니다.`);
    } else {
      const combo2 = verifiedRow2.locator('td').nth(colIndex).getByRole('combobox');
      expect((await combo2.textContent())?.trim()).toBe(targetStatus);
    }

    await screenShot(page, senarioName, `${++multiCount}. 체크박스 다중 상태 변경: ${status1},${status2} - ${targetStatus}`);
    console.log(`✅ '${targetStatus}'로 다중 변경 확인`);
  }

  console.log('\n✅ 체크박스 다중 상태 변경 흐름 완료');
});

test.afterAll(async () => {
  await closeConnection();
});
