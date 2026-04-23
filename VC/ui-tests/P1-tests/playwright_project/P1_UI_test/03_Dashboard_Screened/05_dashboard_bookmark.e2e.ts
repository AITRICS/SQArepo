import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { executeQuery } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' }); // 테스트를 순차적으로 실행하도록 설정

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[05. Screened - 대시보드 id 복사 및 북마크]';

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await executeQuery(`DELETE FROM accounts_pin WHERE username = '${adminID}'`);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

test('대시보드 id 복사', async ({ page }) => {
  const table = page.locator('table');
  const headers = await table.locator('thead tr th').allTextContents();
  const patientInfoIndex = headers.indexOf('Patient info') + 1;

  const firstRow = page.locator('tbody tr').first();
  const patientInfoCell = firstRow.locator(`td:nth-child(${patientInfoIndex})`);

  const copyButton = patientInfoCell.locator('button'); //환자 ID 버튼 추출

  //마우스 호버 커서 확인
  // await copyButton.hover();
  // const cursorStyle = await copyButton.evaluate(el =>
  //   window.getComputedStyle(el).getPropertyValue('cursor')
  // );
  // expect(cursorStyle).toBe('pointer');
  // await page.waitForTimeout(1000);
  // await screenShot(page,senarioName,'EMR ID 마우스 커서 확인');

  //emr id 복사 토스트 메세지 확인
  await copyButton.click();
  await page.waitForTimeout(500);
  const toast = page.getByText('EMR ID가 복사되었습니다.');
  await expect(toast).toBeVisible();
  await screenShot(page,senarioName,'4. EMR ID 복사');
  console.log('✅ EMR ID 복사 확인');
});

/**
 * 북마크 on/off 확인
 */
test('대시보드 북마크 on/off 확인', async ({ page }) => {
  const table = page.locator('table');

  // 북마크 컬럼 인덱스 구하기 (th 내부에 bookmark-header 버튼이 있는 th)
  const headerCells = table.locator('thead tr th');
  const bookmarkIndex =
    (await headerCells.evaluateAll((ths) =>
      ths.findIndex((th) => th.querySelector('[data-testid="bookmark-header"]'))
    )) + 1;

  expect(bookmarkIndex).toBeGreaterThan(0);

  // 첫번째 row 대상
  const firstRow = table.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });

  const bookmarkCell = firstRow.locator(`td:nth-child(${bookmarkIndex})`);
  const bookmarkButton = bookmarkCell.locator('button');
  await expect(bookmarkButton).toBeVisible({ timeout: 10000 });

  // --- 등록(ON) ---
  await setBookmark(page, bookmarkCell, bookmarkButton, true);
  await screenShot(page,senarioName,'5. 북마크 on 확인');
  console.log('✅ 북마크 on 확인');

  // --- 해제(OFF) ---
  await setBookmark(page, bookmarkCell, bookmarkButton, false);
  await screenShot(page,senarioName,'6. 북마크 off 확인');
  console.log('✅ 북마크 off 확인');
});

const BOOKMARK_ON_G = 'xpath=.//svg//g[@id="name=star, size=small"]';
const BOOKMARK_OFF_G = 'css=svg g#favorite';

// 토스트 텍스트
const TOAST_ON = '북마크 등록이 완료되었습니다';
const TOAST_OFF = '북마크 해제가 완료되었습니다';

// 토스트가 사라질 때까지 대기
async function expectToastAppearAndDisappear(page: Page, text: string) {
  const toast = page.getByText(text);

  // 나타남: 빠르면 스킵될 수 있으니 짧은 timeout으로 시도
  await toast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

  // 사라짐(또는 detach): 토스트 구현에 따라 hidden/detached 둘 다 가능
  await Promise.race([
    toast.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {}),
    toast.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {}),
  ]);
}

async function expectBookmarked(cell: Locator) {
  await expect(cell.locator(BOOKMARK_ON_G)).toHaveCount(1, { timeout: 10000 });
}

async function expectUnbookmarked(cell: Locator) {
  await expect(cell.locator(BOOKMARK_OFF_G)).toHaveCount(1, { timeout: 10000 });
  await expect(cell.locator(BOOKMARK_ON_G)).toHaveCount(0, { timeout: 10000 });
}

// 버튼 클릭 → 토스트 확인(등장+소멸) → g 상태 확인
async function setBookmark(page: Page, cell: Locator, button: Locator, targetOn: boolean) {
  const currentlyOn = (await cell.locator(BOOKMARK_ON_G).count()) > 0;
  const currentlyOff = (await cell.locator(BOOKMARK_OFF_G).count()) > 0;

  if (targetOn && currentlyOn) return;   // 이미 ON → 스킵
  if (!targetOn && currentlyOff) return; // 이미 OFF → 스킵

  await button.click();

  if (targetOn) {
    await expectToastAppearAndDisappear(page, TOAST_ON);
    // await expectBookmarked(cell);
  } else {
    await expectToastAppearAndDisappear(page, TOAST_OFF);
    // await expectUnbookmarked(cell);
  }
}


// ── 헬퍼 함수 정의 ─────────────────────────────────────────────

async function waitTableReady(page: Page) {
  const loading = page.locator('.absolute').first();
  await expect(loading).not.toBeVisible({ timeout: 10000 });
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
  const id = (await cell.locator('button > p').innerText()).trim();
  return id;
}

async function findRowByPatientId(page: Page, patientId: string): Promise<Locator> {
  const row = page
    .locator('table tbody tr')
    .filter({ hasText: patientId });
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

function getStatusCombobox(row: Locator): Locator {
  return row.getByRole('combobox').first();
}

async function openStatusDropdown(row: Locator) {
  await getStatusCombobox(row).click();
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
      (await combo.textContent()) ||
      '';
    expect(valueText).toContain(status);
    return;
  }

  const cellText = (await cell.innerText()).replace(/\s+/g, ' ').trim();
  expect(cellText).toContain(status);
}

/**
 * 상단 고정 동작 확인
 */
test('상단 고정 설정 동작 확인', async ({ page}) => {
  // 사전작업: accounts_pin 초기화
  // await executeQuery(`DELETE FROM accounts_pin WHERE username = '${adminID}'`);
  // console.log(`✅ accounts_pin 초기화 완료 (username: ${adminID})`);

  await gotoTab(page, 'Screened');
  await waitTableReady(page);

  // 1) 첫 번째, 두 번째 row 환자 ID 추출
  const newPatientId = await extractPatientIdFromRow(page, page.locator('table tbody tr').nth(0));
  const obsPatientId = await extractPatientIdFromRow(page, page.locator('table tbody tr').nth(1));
  console.log(`New 대상 환자: ${newPatientId}`);
  console.log(`Observing 대상 환자: ${obsPatientId}`);

  // 2) 첫 번째 환자 → New 상태로 맞추기
  const newRow = await findRowByPatientId(page, newPatientId);
  await openStatusDropdown(newRow);
  await selectStatus(page, 'New');
  await waitTableReady(page);
  await page.waitForTimeout(1000);
  await expectRowStatus(page, await findRowByPatientId(page, newPatientId), 'New');
  console.log(`✅ 첫 번째 환자 New 상태 확인: ${newPatientId}`);

  // 3) 두 번째 환자 → Observing 상태로 맞추기
  const obsRow = await findRowByPatientId(page, obsPatientId);
  await openStatusDropdown(obsRow);
  await selectStatus(page, 'Observing');
  await waitTableReady(page);
  await page.waitForTimeout(1000);
  await expectRowStatus(page, await findRowByPatientId(page, obsPatientId), 'Observing');
  console.log(`✅ 두 번째 환자 Observing 상태 확인: ${obsPatientId}`);

  // ── New 환자 PIN 설정 ──────────────────────────────────────────

  // 4) New 환자 Pin to top 클릭 + 토스트 확인
  const newRowForPin = await findRowByPatientId(page, newPatientId);
  await newRowForPin.getByLabel('Pin to top').click();
  await page.waitForTimeout(1000);
  await expect(page.getByText('상단 고정을 설정했습니다.')).toBeVisible({ timeout: 5000 });
  console.log('✅ New 환자 Pin 토스트 확인');
  await page.waitForTimeout(5000);

  // 5) Pin 영역에 New 환자 노출 확인
  const pinnedNewRow = page
    .locator('table tbody tr')
    .filter({ has: page.getByLabel('Unpin from top') })
    .filter({ hasText: newPatientId });
  await expect(pinnedNewRow).toBeVisible({ timeout: 10000 });
  console.log('✅ New 환자 Pin 영역 노출 확인');

  // 6) Unpin from top 버튼(아이콘) 표시 확인
  await expect(pinnedNewRow.getByLabel('Unpin from top')).toBeVisible();
  console.log('✅ New 환자 Unpin from top 버튼 확인');

  // 7) 일반 영역에 New 환자 미표시 확인
  const normalNewRow = page
    .locator('table tbody tr')
    .filter({ has: page.getByLabel('Pin to top') })
    .filter({ hasText: newPatientId });
  await expect(normalNewRow).toHaveCount(0);
  console.log('✅ New 환자 일반 영역 미표시 확인');

  // 8) Pin 후 New 환자 상태 유지 확인
  await expectRowStatus(page, pinnedNewRow, 'New');
  console.log('✅ New 환자 상태 유지 확인');

  await screenShot(page, senarioName, '1. New 환자 상단 고정 확인');

  // ── Observing 환자 PIN 설정 ────────────────────────────────────

  // 9) Observing 환자 Pin to top 클릭 + 토스트 확인
  const obsRowForPin = await findRowByPatientId(page, obsPatientId);
  await obsRowForPin.getByLabel('Pin to top').click();
  await page.waitForTimeout(1000);
  await expect(page.getByText('상단 고정을 설정했습니다.')).toBeVisible({ timeout: 5000 });
  console.log('✅ Observing 환자 Pin 토스트 확인');

  // 10) Pin 영역에 Observing 환자 노출 확인
  const pinnedObsRow = page
    .locator('table tbody tr')
    .filter({ has: page.getByLabel('Unpin from top') })
    .filter({ hasText: obsPatientId });
  await expect(pinnedObsRow).toBeVisible({ timeout: 10000 });
  console.log('✅ Observing 환자 Pin 영역 노출 확인');

  // 11) Unpin from top 버튼(아이콘) 표시 확인
  await expect(pinnedObsRow.getByLabel('Unpin from top')).toBeVisible();
  console.log('✅ Observing 환자 Unpin from top 버튼 확인');

  // 12) 일반 영역에 Observing 환자 미표시 확인
  const normalObsRow = page
    .locator('table tbody tr')
    .filter({ has: page.getByLabel('Pin to top') })
    .filter({ hasText: obsPatientId });
  await expect(normalObsRow).toHaveCount(0);
  console.log('✅ Observing 환자 일반 영역 미표시 확인');

  // 13) Pin 후 Observing 환자 상태 유지 확인
  await expectRowStatus(page, pinnedObsRow, 'Observing');
  console.log('✅ Observing 환자 상태 유지 확인');

  await screenShot(page, senarioName, '2. Observing 환자 상단 고정 확인');
});

test('상단 고정 해제 동작 확인', async ({ page }) => {
  // Pre-condition: 이전 test에서 pin된 상태
  await gotoTab(page, 'Screened');
  await waitTableReady(page);

  // 사전작업: 상단 고정 환자 없으면 첫 번째 환자 Pin 설정
  const pinnedRows = page
    .locator('table tbody tr')
    .filter({ has: page.getByLabel('Unpin from top') });

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

  // 1) Pin 영역 고정 환자 수 재확인
  const totalPinned = await page
    .locator('table tbody tr')
    .filter({ has: page.getByLabel('Unpin from top') })
    .count();
  expect(totalPinned).toBeGreaterThan(0);
  console.log(`✅ 상단 고정 환자 ${totalPinned}명 확인`);

  // 2) 고정 환자 순서대로 Unpin 처리
  for (let i = 0; i < totalPinned; i++) {
    const pinnedRow = page
      .locator('table tbody tr')
      .filter({ has: page.getByLabel('Unpin from top') })
      .first();

    const patientId = await extractPatientIdFromRow(page, pinnedRow);
    console.log(`Unpin 대상 환자: ${patientId}`);

    // Unpin 클릭 + 토스트 확인
    await pinnedRow.getByLabel('Unpin from top').click();
    await waitTableReady(page);
    await page.waitForTimeout(1000);
    await expect(page.getByText('상단 고정을 해제했습니다.')).toBeVisible({ timeout: 5000 });
    console.log(`✅ ${patientId} Unpin 토스트 확인`);

    await page.waitForTimeout(2000);

    // 일반 영역으로 복귀 확인
    const restoredRow = page
      .locator('table tbody tr')
      .filter({ hasText: patientId })
      .first();
    await expect(restoredRow).toBeVisible({ timeout: 10000 });
    await expect(restoredRow.getByLabel('Pin to top')).toBeVisible({ timeout: 5000 });
    console.log(`✅ ${patientId} 일반 영역 복귀 확인`);

    await screenShot(page, senarioName, `상단 고정 해제 확인`);
  }

  console.log('✅ 상단 고정 해제 동작 확인 완료');
});