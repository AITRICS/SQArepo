import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = 'TC_002_006 Dashboard - All Patients/[05. All Patients - 대시보드 환자 상태 변경]';

const statusOptions = ['New', 'Observing', 'Complete', 'Error', 'Dismissed'] as const;
type Status = typeof statusOptions[number];

// 상태가 다른 두 환자 조합 (랜덤 선택용)
const statusPairs: [Status, Status][] = [
  ['New', 'Observing'],
  ['New', 'Complete'],
  ['New', 'Error'],
  ['New', 'Dismissed'],
  ['Observing', 'Complete'],
  ['Observing', 'Error'],
  ['Observing', 'Dismissed'],
  ['Complete', 'Error'],
  ['Complete', 'Dismissed'],
  ['Error', 'Dismissed'],
];

test.beforeEach(async ({ page }) => {
  test.setTimeout(0);
  await page.goto('/ko/login');
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
  await page.getByRole('tab', { name: 'All Patients' }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

// ========== 헬퍼 ==========

async function waitTableReady(page: Page) {
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
}

async function getStatusColumnIndex(page: Page): Promise<number> {
  const ths = page.locator('thead tr th');
  const count = await ths.count();
  for (let i = 0; i < count; i++) {
    if ((await ths.nth(i).innerText()).trim() === 'Status') return i;
  }
  throw new Error("'Status' 컬럼을 찾을 수 없습니다");
}

async function getPatientInfoColIndex(page: Page): Promise<number> {
  const headers = page.locator('table thead th');
  const count = await headers.count();
  for (let i = 0; i < count; i++) {
    if ((await headers.nth(i).innerText()).trim().includes('Patient info')) return i;
  }
  throw new Error('Patient info column not found');
}

async function extractPatientIdFromRow(page: Page, row: Locator): Promise<string> {
  const colIndex = await getPatientInfoColIndex(page);
  return (await row.locator('td').nth(colIndex).locator('button > p').innerText()).trim();
}

async function findRowByPatientId(page: Page, patientId: string): Promise<Locator> {
  const row = page.locator('table tbody tr').filter({ hasText: patientId });
  if (await row.count() === 0) throw new Error(`Row not found: ${patientId}`);
  return row.first();
}

async function getRowStatus(page: Page, row: Locator): Promise<string> {
  const colIndex = await getStatusColumnIndex(page);
  return ((await row.locator('td').nth(colIndex).getByRole('combobox').first().textContent()) ?? '').trim();
}

async function openStatusDropdown(row: Locator) {
  await row.getByRole('combobox').first().click();
}

async function selectStatus(page: Page, status: Status) {
  await page.getByRole('option', { name: status }).click();
}

async function expectRowStatus(page: Page, patientId: string, expectedStatus: string) {
  const row = await findRowByPatientId(page, patientId);
  const colIndex = await getStatusColumnIndex(page);
  const text = ((await row.locator('td').nth(colIndex).getByRole('combobox').first().textContent()) ?? '').trim();
  expect(text).toBe(expectedStatus);
}

// All Patients는 항상 전체 환자가 보이므로 드롭다운으로 바로 상태 세팅 가능
async function ensureStatus(page: Page, patientId: string, targetStatus: Status) {
  const row = await findRowByPatientId(page, patientId);
  if (await getRowStatus(page, row) === targetStatus) return;
  await openStatusDropdown(row);
  await selectStatus(page, targetStatus);
  await waitTableReady(page);
  await page.waitForTimeout(1000);
}

// ========== 드롭다운 상태 변경 테스트 ==========

test('대시보드 환자 상태 변경 확인 - New에서 변경', async ({ page }) => {
  const patientId = await extractPatientIdFromRow(page, page.locator('table tbody tr').first());
  console.log(`Patient ID: ${patientId}`);

  for (let i = 0; i < statusOptions.length; i++) {
    const targetStatus = statusOptions[i];
    await ensureStatus(page, patientId, 'New');
    const row = await findRowByPatientId(page, patientId);
    await openStatusDropdown(row);
    await selectStatus(page, targetStatus);
    await waitTableReady(page);
    await page.waitForTimeout(1000);
    await expectRowStatus(page, patientId, targetStatus);
    await screenShot(page, senarioName, `${i + 1}. New - ${targetStatus} 상태 변경 확인`);
    console.log(`✅ New → ${targetStatus} 상태 변경 확인`);
  }
});

test('대시보드 환자 상태 변경 확인 - Observing에서 변경', async ({ page }) => {
  const patientId = await extractPatientIdFromRow(page, page.locator('table tbody tr').first());
  console.log(`Patient ID: ${patientId}`);

  for (let i = 0; i < statusOptions.length; i++) {
    const targetStatus = statusOptions[i];
    await ensureStatus(page, patientId, 'Observing');
    const row = await findRowByPatientId(page, patientId);
    await openStatusDropdown(row);
    await selectStatus(page, targetStatus);
    await waitTableReady(page);
    await page.waitForTimeout(1000);
    await expectRowStatus(page, patientId, targetStatus);
    await screenShot(page, senarioName, `${i + 6}. Observing - ${targetStatus} 상태 변경 확인`);
    console.log(`✅ Observing → ${targetStatus} 상태 변경 확인`);
  }
});

test('대시보드 환자 상태 변경 확인 - Complete에서 변경', async ({ page }) => {
  const patientId = await extractPatientIdFromRow(page, page.locator('table tbody tr').first());
  console.log(`Patient ID: ${patientId}`);

  for (let i = 0; i < statusOptions.length; i++) {
    const targetStatus = statusOptions[i];
    await ensureStatus(page, patientId, 'Complete');
    const row = await findRowByPatientId(page, patientId);
    await openStatusDropdown(row);
    await selectStatus(page, targetStatus);
    await waitTableReady(page);
    await page.waitForTimeout(1000);
    await expectRowStatus(page, patientId, targetStatus);
    await screenShot(page, senarioName, `${i + 11}. Complete - ${targetStatus} 상태 변경 확인`);
    console.log(`✅ Complete → ${targetStatus} 상태 변경 확인`);
  }
});

test('대시보드 환자 상태 변경 확인 - Error에서 변경', async ({ page }) => {
  const patientId = await extractPatientIdFromRow(page, page.locator('table tbody tr').first());
  console.log(`Patient ID: ${patientId}`);

  for (let i = 0; i < statusOptions.length; i++) {
    const targetStatus = statusOptions[i];
    await ensureStatus(page, patientId, 'Error');
    const row = await findRowByPatientId(page, patientId);
    await openStatusDropdown(row);
    await selectStatus(page, targetStatus);
    await waitTableReady(page);
    await page.waitForTimeout(1000);
    await expectRowStatus(page, patientId, targetStatus);
    await screenShot(page, senarioName, `${i + 16}. Error - ${targetStatus} 상태 변경 확인`);
    console.log(`✅ Error → ${targetStatus} 상태 변경 확인`);
  }
});

test('대시보드 환자 상태 변경 확인 - Dismissed에서 변경', async ({ page }) => {
  const patientId = await extractPatientIdFromRow(page, page.locator('table tbody tr').first());
  console.log(`Patient ID: ${patientId}`);

  for (let i = 0; i < statusOptions.length; i++) {
    const targetStatus = statusOptions[i];
    await ensureStatus(page, patientId, 'Dismissed');
    const row = await findRowByPatientId(page, patientId);
    await openStatusDropdown(row);
    await selectStatus(page, targetStatus);
    await waitTableReady(page);
    await page.waitForTimeout(1000);
    await expectRowStatus(page, patientId, targetStatus);
    await screenShot(page, senarioName, `${i + 21}. Dismissed - ${targetStatus} 상태 변경 확인`);
    console.log(`✅ Dismissed → ${targetStatus} 상태 변경 확인`);
  }
});

// ========== 체크박스 단일 환자 상태 변경 테스트 ==========

test('체크박스 단일 환자 상태 변경', async ({ page }) => {
  const patientId = await extractPatientIdFromRow(page, page.locator('table tbody tr').first());
  console.log(`Patient ID: ${patientId}`);
  let shotNum = 26;

  for (const baseStatus of statusOptions) {
    console.log(`========= baseStatus: ${baseStatus} ==========`);
    for (const targetStatus of statusOptions) {
      await ensureStatus(page, patientId, baseStatus);

      const row = await findRowByPatientId(page, patientId);
      await row.getByRole('checkbox').click();
      await page.waitForTimeout(500);

      const toolbar = page.getByRole('form', { name: 'toolbar-status' });
      await expect(toolbar).toBeVisible();
      await toolbar.getByRole('button', { name: targetStatus }).click();
      await waitTableReady(page);
      await page.waitForTimeout(1000);

      await expectRowStatus(page, patientId, targetStatus);
      await screenShot(page, senarioName, `${shotNum++}. 체크박스 단일 ${baseStatus} - ${targetStatus} 상태 변경 확인`);
      console.log(`✅ 체크박스 ${baseStatus} → ${targetStatus} 상태 변경 확인`);
    }
  }

  console.log('\n✅ 체크박스 단일 환자 상태 변경 흐름 완료');
});

// ========== 체크박스 두 환자 상태 변경 테스트 (랜덤 조합) ==========

test('체크박스 두 환자 상태 변경', async ({ page }) => {
  const rows = page.locator('table tbody tr');
  const id1 = await extractPatientIdFromRow(page, rows.nth(0));
  const id2 = await extractPatientIdFromRow(page, rows.nth(1));
  console.log(`환자1: ${id1}, 환자2: ${id2}`);
  let shotNum = 51;

  for (const targetStatus of statusOptions) {
    // 매 라운드마다 랜덤으로 시작 상태 쌍 선택
    const [s1, s2] = statusPairs[Math.floor(Math.random() * statusPairs.length)];
    console.log(`🎲 랜덤 쌍 선택: ${s1}, ${s2} → ${targetStatus}`);

    await ensureStatus(page, id1, s1);
    await ensureStatus(page, id2, s2);

    const r1 = await findRowByPatientId(page, id1);
    const r2 = await findRowByPatientId(page, id2);
    await r1.getByRole('checkbox').click();
    await r2.getByRole('checkbox').click();
    await page.waitForTimeout(500);

    const toolbar = page.getByRole('form', { name: 'toolbar-status' });
    await expect(toolbar).toBeVisible();
    console.log(`🔄 두 환자(${s1}, ${s2}) → '${targetStatus}' 변경 시도`);
    await toolbar.getByRole('button', { name: targetStatus }).click();
    await waitTableReady(page);
    await page.waitForTimeout(1000);

    await expectRowStatus(page, id1, targetStatus);
    await expectRowStatus(page, id2, targetStatus);
    await screenShot(page, senarioName, `${shotNum++}. 체크박스 두 환자 ${s1}, ${s2} → ${targetStatus} 상태 변경 확인`);
    console.log(`✅ 체크박스 두 환자(${s1}, ${s2}) → ${targetStatus} 상태 변경 확인`);
  }

  console.log('\n✅ 체크박스 두 환자 상태 변경 흐름 완료');
});
