import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import globalSetup from '../../playwright/playwright.globalSetup.js';
import axios from 'axios';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' }); // 테스트를 순차적으로 실행하도록 설정

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[14. 대시보드 환자 상태 변경]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

const statusOptions = ['New', 'Observing', 'Complete', 'Error', 'Dismissed'];

export async function scrollDashboardToBottomAndTop(page: Page) {
  const scrollTarget = page.locator('xpath=/html/body/div[1]/div/div/div/div/div/div[2]');
  // 아래로
  await scrollTarget.evaluate((el: HTMLElement, ratio: number) => {
    el.scrollTop = el.scrollHeight * ratio;
  }, 0.3);
  await page.waitForTimeout(3000);
  // 맨 위로
  await scrollTarget.evaluate((el: HTMLElement) => {
    el.scrollTop = 0;
  });
  await page.waitForTimeout(3000);
}

async function getStatusColumnIndex(page: Page): Promise<number> {
  const ths = page.locator('thead tr th');
  for (let i = 0; i < await ths.count(); i++) {
    const text = await ths.nth(i).innerText();
    if (text.trim() === 'Status') return i;
  }
  throw new Error("❌ 'Status' 컬럼을 찾을 수 없습니다");
}

async function selectStatusByIndex(page: Page, row: Locator, colIndex: number, index: number) {
    const statusCell = row.locator('td').nth(colIndex);
    const combo = statusCell.getByRole('combobox');
    await combo.click();
    const options = page.locator('[role="option"]');
    await expect(options.nth(index)).toBeVisible();
    await options.nth(index).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
}

async function changeStatusAndVerify(
  page: Page,
  row: Locator,
  patientId: string,
  colIndex: number,
  targetIndex: number,
  returnTab: string
) {
  const targetStatus = statusOptions[targetIndex];

  // 상태 변경: 현재 row 기준으로 변경
  await selectStatusByIndex(page, row, colIndex, targetIndex);

  // 변경된 상태에 따라 탭 이동 (필수)
  let expectedTab = ['New', 'Observing'].includes(targetStatus)
    ? 'Screened'
    : ['Complete', 'Error'].includes(targetStatus)
    ? 'Reviewed'
    : 'Dismissed';
  await page.getByRole('tab', { name: expectedTab }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // 변경된 환자 row 다시 해당 탭에서 확인
  const verifiedRow = page.locator(`tr:has(p:has-text("${patientId}"))`);
  const combo = verifiedRow.locator('td').nth(colIndex).getByRole('combobox');
  const text = (await combo.textContent())?.trim();

  expect(text).toBe(targetStatus);

  // 다시 원래 탭으로 돌아가기
  await page.getByRole('tab', { name: returnTab }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

// async function extractPatientIdFromRow(page: Page, row: Locator): Promise<string | null> {
//   const ths = page.locator('thead tr th');
//   const thCount = await ths.count();
//   for (let i = 0; i < thCount; i++) {
//     const text = await ths.nth(i).innerText();
//     if (text.trim().toLowerCase().includes('patient info')) {
//       const cell = row.locator('td').nth(i);
//       return (await cell.locator('p').first().textContent())?.trim() || null;
//     }
//   }
//   return null;
// }



/** 공통 로딩 대기 (프로젝트 상황에 맞게 selector 조정) */
async function waitTableReady(page: Page) {
  const loading = page.locator('.absolute').first();
  await expect(loading).not.toBeVisible({ timeout: 10000 });
}

/** 탭 이동 */
async function gotoTab(page: Page, name: 'Screened' | 'Reviewed' | 'Dismissed') {
  await page.getByRole('tab', { name }).click();
  await waitTableReady(page);
}

/** 첫 row */
function firstRow(page: Page): Locator {
  return page.locator('table tbody tr').first();
}
 /** Patient info 컬럼 인덱스 찾기 */
async function getPatientInfoColIndex(page: Page): Promise<number> {
  const headers = page.locator('table thead th');
  const count = await headers.count();

  for (let i = 0; i < count; i++) {
    const text = (await headers.nth(i).innerText()).trim();
    if (text.includes('Patient info')) {
      return i; // 0-based index
    }
  }
  throw new Error('Patient info column not found');
}

// /** row에서 patientId 추출 (필요시 td 인덱스 수정) */
// async function extractPatientIdFromRow(row: Locator): Promise<string> {
//   // 보통 첫 컬럼이 ID인 경우가 많음. 아니면 td:nth-child(n)으로 수정.
//   const id = await row.locator('td').first().innerText();
//   return id.trim();
// }
/** row에서 patientId 추출: Patient info 컬럼 찾아서 해당 td에서 추출 */
async function extractPatientIdFromRow(
  page: Page,
  row: Locator
): Promise<string> {
  const colIndex = await getPatientInfoColIndex(page); // 0-based
  const cell = row.locator('td').nth(colIndex);

  // 해당 셀 안의 button > p 가 환자 ID
  const id = (await cell.locator('button > p').innerText()).trim();
  return id;
}
/** 현재 탭의 테이블에서 patientId 포함된 row 찾기 */
// async function findRowByPatientId(page: Page, patientId: string): Promise<Locator> {
//   const rows = page.locator('table tbody tr');
//   const n = await rows.count();

//   for (let i = 0; i < n; i++) {
//     const r = rows.nth(i);
//     const txt = (await r.innerText()).replace(/\s+/g, ' ').trim();
//     if (txt.includes(patientId)) return r;
//   }
//   throw new Error(`Row not found for patientId=${patientId}`);
// }
async function findRowByPatientId(page: Page, patientId: string): Promise<Locator> {
  const row = page
    .locator('table tbody tr')
    .filter({ hasText: patientId });

  // 안전하게 1개 이상 있는지 체크하고 싶다면 (선택)
  const count = await row.count();
  if (count === 0) {
    throw new Error(`Row not found for patientId=${patientId}`);
  }

  return row.first();
}

/** Status combobox: row 내 combobox 1개 가정 */
function getStatusCombobox(row: Locator): Locator {
  return row.getByRole('combobox').first();
}

/** 드롭다운 옵션 열기 */
async function openStatusDropdown(row: Locator) {
  await getStatusCombobox(row).click();
}

/** 옵션 선택 */
async function selectStatus(page: Page, status: 'New' | 'Observing' | 'Complete' | 'Error' | 'Dismissed') {
  await page.getByRole('option', { name: status }).click();
}

/** Status 옵션 목록 + 현재값(New) 체크 */
async function expectStatusOptionsAndCurrentNew(page: Page, row: Locator) {
  // 현재값이 New인지 확인
  await expect(getStatusCombobox(row)).toContainText('New');
  await openStatusDropdown(row);


  // 옵션 목록 확인
  for (const opt of ['New', 'Observing', 'Complete', 'Error', 'Dismissed'] as const) {
    await expect(page.getByRole('option', { name: opt })).toBeVisible();
  }

  // 드롭다운 닫기: ESC
  await page.keyboard.press('Escape');
}
async function getColumnIndexByHeader(table: Locator, headerName: string): Promise<number> {
  const headers = await table.locator('thead tr th').allTextContents();
  const idx = headers.findIndex(h => h.trim() === headerName);
  if (idx === -1) throw new Error(`Header "${headerName}" not found: ${JSON.stringify(headers)}`);
  return idx + 1;
}

async function expectRowStatus(page: Page, row: Locator, status: string) {
  const table = page.locator('table');
  const statusIndex = await getColumnIndexByHeader(table, 'Status');

  const cell = row.locator(`td:nth-child(${statusIndex})`);

  // ✅ 1) aria 계열/콤보박스 값 우선 확인 시도
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

  // ✅ 2) combobox 없으면 셀 텍스트로 확인 (Reviewed/Dismissed 대응)
  const cellText = (await cell.innerText()).replace(/\s+/g, ' ').trim();
  expect(cellText).toContain(status);
}

/** Screened에서 환자를 New로 맞춤 (프리컨디션) */
async function ensureNewOnScreened(page: Page, patientId: string) {
  await gotoTab(page, 'Screened');
  const row = await findRowByPatientId(page, patientId);

  // New로 맞추기
  await openStatusDropdown(row);
  await selectStatus(page, 'New');
  await waitTableReady(page);
  await page.waitForTimeout(1000);

  // 상태가 New인지 확인
  const rowAfter = await findRowByPatientId(page, patientId);
  await expectRowStatus(page,rowAfter, 'New');
  console.log('✅ New 상태 변경 확인');
}

/** Screened에서 환자를 Observing으로 맞춤 (프리컨디션) */
async function ensureObservingOnScreened(page: Page, patientId: string) {
  // Screened에서 먼저 탐색
  await gotoTab(page, 'Screened');
  let count = await page.locator('table tbody tr').filter({ hasText: patientId }).count();

  // Screened에 없으면 Reviewed에서 찾아 New로 변경 (Screened로 복귀)
  if (count === 0) {
    console.log(`ℹ️ Screened에 ${patientId} 없음 → Reviewed 탐색`);
    await gotoTab(page, 'Reviewed');
    count = await page.locator('table tbody tr').filter({ hasText: patientId }).count();
    if (count > 0) {
      const reviewedRow = await findRowByPatientId(page, patientId);
      await openStatusDropdown(reviewedRow);
      await selectStatus(page, 'New');
      await waitTableReady(page);
      await page.waitForTimeout(1000);
      console.log(`✅ Reviewed → New 변경 (Screened 복귀)`);
    }
    await gotoTab(page, 'Screened');
  }

  const row = await findRowByPatientId(page, patientId);
  await openStatusDropdown(row);
  await selectStatus(page, 'Observing');
  await waitTableReady(page);
  await page.waitForTimeout(1000);

  const rowAfter = await findRowByPatientId(page, patientId);
  await expectRowStatus(page, rowAfter, 'Observing');
  console.log('✅ Observing 상태 변경 확인');
}

async function verifyStatusWithSearch(page: Page,currentPatientId: string,targetStatus: string) 
{
  console.log(`ℹ️ 테이블에 환자 미노출, 검색 모달로 상태 확인 진행: ${currentPatientId}`);
 
  await page.getByRole('button', { name: '환자 검색' }).click(); // 환자 검색 버튼 클릭
  const searchDialog = page.getByRole('dialog', { name: '환자 검색' });// 검색 모달 대기
  await expect(searchDialog).toBeVisible();
  
  await searchDialog.getByRole('radio', { name: 'EMR ID' }).click();// EMR ID 라디오 선택
  await searchDialog.getByRole('textbox', { name: '이름을 입력하세요' }).fill(currentPatientId);// 검색어 입력
  await searchDialog.getByRole('img', { name: 'icon-search' }).click();// 검색 버튼 클릭
  await page.waitForTimeout(5000);
  // 검색 결과에서 Status 컬럼의 targetStatus 확인
  // 테이블 구조에 따라 조정 필요
  const resultRow = searchDialog.locator(`tr:has(td[role="cell"]:has-text("${targetStatus}"))`);
  await expect(resultRow).toBeVisible({ timeout: 5000 });

  const statusCell = resultRow.getByRole('cell', { name: targetStatus });
  await expect(statusCell).toBeVisible();

  const statusText = (await statusCell.innerText()).trim();
  console.log(`🔍 검색 결과 Status='${statusText}'`);
  expect(statusText).toBe(targetStatus);

  console.log(`✅ 검색 모달에서 상태 '${targetStatus}'로 정상 변경 확인`);

  await searchDialog.getByRole('button', { name: 'Close' }).click();
  await expect(searchDialog).not.toBeVisible();
}


test('대시보드 환자 상태 변경 확인 - New 에서 변경', async ({ page }) => {
  // 0) Screened 탭에서 1번째 row 환자 선택
  await gotoTab(page, 'Screened');

  const row0 = firstRow(page);
  const patientId = await extractPatientIdFromRow(page,row0); // 첫번째 행 환자 ID 추출
  console.log(`Patient ID: ${patientId}`);

  // 1) Status 클릭 시 드롭다운 옵션들 + New 체크 상태 확인
  const rowNew = await findRowByPatientId(page, patientId); // patientId로 다시 행 찾기

  // 2) "New" -> "New" (실질 변화 없지만 동작 확인)
  await openStatusDropdown(rowNew); // 드롭다운 열기
  await selectStatus(page, 'New'); // New 선택
  await page.waitForTimeout(1000);
  await expectRowStatus(page,await findRowByPatientId(page, patientId), 'New'); // 상태 New 확인
  await screenShot(page,senarioName,'New - New 상태 변경 확인');
  console.log('✅ 대시보드 환자 New -> New 상태 변경 확인');



  // 3) "New" -> "Observing" : Screened 유지
  await ensureNewOnScreened(page, patientId); // 다시 New로 맞춤
  const rowForObs = await findRowByPatientId(page, patientId); // patientId로 다시 행 찾기
  await openStatusDropdown(rowForObs); // 드롭다운 열기
  await selectStatus(page, 'Observing'); // Observing 선택
  await page.waitForTimeout(1000);
  
  const rowObs = await findRowByPatientId(page, patientId); // patientId로 다시 행 찾기
  await expectRowStatus(page,rowObs, 'Observing'); // 상태 Observing 확인
  await screenShot(page,senarioName,'New - Observing 상태 변경 확인');
  console.log('✅ 대시보드 환자 New -> Observing 상태 변경 확인');



  // 4) "New" -> "Complete" : Reviewed 이동
  const patientId_Comp = await extractPatientIdFromRow(page, row0); // 첫번째 행 환자 ID 추출
  await ensureNewOnScreened(page, patientId_Comp);// 다시 New로 맞춤
  const rowForComp = await findRowByPatientId(page, patientId_Comp); // patientId로 다시 행 찾기
  await openStatusDropdown(rowForComp); //  드롭다운 열기
  await selectStatus(page, 'Complete'); // Complete 선택
  console.log('✅ 대시보드 환자 New -> Complete 선택');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Reviewed'); // Reviewed 탭 이동
   await waitTableReady(page);// 테이블 로딩 대기
   await page.waitForTimeout(5000);
  const rowComp = await findRowByPatientId(page, patientId_Comp); // patientId로 다시 행 찾기
  await expectRowStatus(page, rowComp, 'Complete'); // 상태 Complete 확인
  await screenShot(page,senarioName,'New - Complete 상태 변경 확인');
  await gotoTab(page, 'Screened'); // Screened 탭 이동
  await waitTableReady(page); // 테이블 로딩 대기
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 New -> Complete 상태 변경 확인');
  


  // 5) "New" -> "Error" : Reviewed 이동
  const patientId_Err = await extractPatientIdFromRow(page, row0); // 첫번째 행 환자 ID 추출
  await ensureNewOnScreened(page, patientId_Err);// 다시 New로 맞춤
  const rowForErr = await findRowByPatientId(page, patientId_Err); // patientId로 다시 행 찾기
  await openStatusDropdown(rowForErr); //  드롭다운 열기
  await selectStatus(page, 'Error'); // Error 선택
  console.log('✅ 대시보드 환자 New -> Error 선택');
  await page.waitForTimeout(5000); // 잠시 대기


  await gotoTab(page, 'Reviewed'); // Reviewed 탭 이동
  await waitTableReady(page); // 테이블 로딩 대기
  await page.waitForTimeout(5000);
  const rowErr = await findRowByPatientId(page, patientId_Err); // patientId로 다시 행 찾기
  await expectRowStatus(page, rowErr, 'Error'); // 상태 Error 확인
  await screenShot(page,senarioName,'New - Error 상태 변경 확인');
  await gotoTab(page, 'Screened'); // Screened 탭 이동
  await waitTableReady(page); // 테이블 로딩 대기
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 New -> Error 상태 변경 확인');



  // 6) "New" -> "Dismissed" : Dismissed 이동
  const patientId_Dis = await extractPatientIdFromRow(page, row0); // 첫번째 행 환자 ID 추출
  await ensureNewOnScreened(page, patientId_Dis);// 다시 New로 맞춤
  const rowForDis = await findRowByPatientId(page, patientId_Dis); // patientId로 다시 행 찾기
  await openStatusDropdown(rowForDis); //  드롭다운 열기
  await selectStatus(page, 'Dismissed'); // Dismissed 선택
  console.log('✅ 대시보드 환자 New -> Dismissed 선택');
  await page.waitForTimeout(5000); // 잠시 대기

  await gotoTab(page, 'Dismissed'); // Dismissed 탭 이동
  await waitTableReady(page); // 테이블 로딩 대기
  await page.waitForTimeout(5000);
  const rowDis = await findRowByPatientId(page, patientId_Dis); // patientId로 다시 행 찾기
  await expectRowStatus(page, rowDis, 'Dismissed'); // 상태 Dismissed 확인
  await screenShot(page,senarioName,'New - Dismissed 상태 변경 확인');
  await gotoTab(page, 'Screened'); // Screened 탭 이동
  await waitTableReady(page); // 테이블 로딩 대기
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 New -> Dismissed 상태 변경 확인');
});


test('대시보드 환자 상태 변경 확인 - Observing에서 변경', async ({ page }) => {
  await gotoTab(page, 'Screened');

  const row0 = firstRow(page);
  const patientId = await extractPatientIdFromRow(page, row0);
  console.log(`Patient ID: ${patientId}`);

  // 1) Observing -> New : Screened 유지
  await ensureObservingOnScreened(page, patientId);
  const rowForNew = await findRowByPatientId(page, patientId);
  await openStatusDropdown(rowForNew);
  await selectStatus(page, 'New');
  await page.waitForTimeout(1000);

  const rowNew = await findRowByPatientId(page, patientId);
  await expectRowStatus(page, rowNew, 'New');
  await screenShot(page, senarioName, 'Observing - New 상태 변경 확인');
  console.log('✅ 대시보드 환자 Observing -> New 상태 변경 확인');



  // 2) Observing -> Observing : Screened 유지
  await ensureObservingOnScreened(page, patientId);
  const rowForObs = await findRowByPatientId(page, patientId);
  await openStatusDropdown(rowForObs);
  await selectStatus(page, 'Observing');
  await page.waitForTimeout(1000);

  const rowObs = await findRowByPatientId(page, patientId);
  await expectRowStatus(page, rowObs, 'Observing');
  await screenShot(page, senarioName, 'Observing - Observing 상태 변경 확인');
  console.log('✅ 대시보드 환자 Observing -> Observing 상태 변경 확인');



  // 3) Observing -> Complete : Reviewed 이동
  await ensureObservingOnScreened(page, patientId);
  const rowForComp = await findRowByPatientId(page, patientId);
  await openStatusDropdown(rowForComp);
  await selectStatus(page, 'Complete');
  console.log('✅ 대시보드 환자 Observing -> Complete 선택');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  const rowComp = await findRowByPatientId(page, patientId);
  await expectRowStatus(page, rowComp, 'Complete');
  await screenShot(page, senarioName, 'Observing - Complete 상태 변경 확인');
  await gotoTab(page, 'Screened');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 Observing -> Complete 상태 변경 확인');



  // 4) Observing -> Error : Reviewed 이동 (Screened 첫 번째 환자 새로 선택)
  await gotoTab(page, 'Screened');
  await waitTableReady(page);
  const patientId_Err = await extractPatientIdFromRow(page, firstRow(page));
  console.log(`Patient ID (Error): ${patientId_Err}`);
  await ensureObservingOnScreened(page, patientId_Err);
  const rowForErr = await findRowByPatientId(page, patientId_Err);
  await openStatusDropdown(rowForErr);
  await selectStatus(page, 'Error');
  console.log('✅ 대시보드 환자 Observing -> Error 선택');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Reviewed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  const rowErr = await findRowByPatientId(page, patientId_Err);
  await expectRowStatus(page, rowErr, 'Error');
  await screenShot(page, senarioName, 'Observing - Error 상태 변경 확인');
  await gotoTab(page, 'Screened');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 Observing -> Error 상태 변경 확인');



  // 5) Observing -> Dismissed : Dismissed 이동 (Screened 첫 번째 환자 새로 선택)
  await gotoTab(page, 'Screened');
  await waitTableReady(page);
  const patientId_Dis = await extractPatientIdFromRow(page, firstRow(page));
  console.log(`Patient ID (Dismissed): ${patientId_Dis}`);
  await ensureObservingOnScreened(page, patientId_Dis);
  const rowForDis = await findRowByPatientId(page, patientId_Dis);
  await openStatusDropdown(rowForDis);
  await selectStatus(page, 'Dismissed');
  console.log('✅ 대시보드 환자 Observing -> Dismissed 선택');
  await page.waitForTimeout(5000);

  await gotoTab(page, 'Dismissed');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  const rowDis = await findRowByPatientId(page, patientId_Dis);
  await expectRowStatus(page, rowDis, 'Dismissed');
  await screenShot(page, senarioName, 'Observing - Dismissed 상태 변경 확인');
  await gotoTab(page, 'Screened');
  await waitTableReady(page);
  await page.waitForTimeout(5000);
  console.log('✅ 대시보드 환자 Observing -> Dismissed 상태 변경 확인');
});


test('체크박스 환자 상태 변경', async ({ page }) => {
  for (const baseStatus of ['New', 'Observing'] as string[]) { // 초기 환자 상태
    const baseTab = ['Complete', 'Error'].includes(baseStatus)
      ? 'Reviewed'
      : baseStatus === 'Dismissed'
      ? 'Dismissed'
      : 'Screened';
    console.log(`========= baseStatus: ${baseStatus} ==========`)
    await page.getByRole('tab', { name: baseTab }).click(); //screened, reviewed, dismissed 대시보드 클릭
    await waitTableReady(page);
    await page.waitForTimeout(1000);
    console.log(`탭 '${baseTab}' 에서 상태 '${baseStatus}' 환자 대상으로 체크박스 상태 변경 테스트 시작`);
    
    for (const targetStatus of statusOptions) {
      let row = page.locator('tbody tr').first(); //첫번째 행 추출
      let checkbox = row.getByRole('checkbox'); //첫번째 행의 체크박스 추출
      let currentPatientId = await extractPatientIdFromRow(page, row); //첫번쨰 행 환자 id

      let colIndex = await getStatusColumnIndex(page);
      let statusCombo = row.locator('td').nth(colIndex).getByRole('combobox'); //환자 상태 추출
      let currentStatus = (await statusCombo.textContent())?.trim();
      await page.waitForTimeout(1000);

      // 상태 초기화: 현재 상태가 baseStatus와 다를 경우 먼저 변경
      if (currentStatus !== baseStatus) { //현재 첫번째 행 환자 상태와 초기 환자 상태 비교

        await checkbox.click(); //체크박스 선택
        await page.waitForTimeout(1000);

        const toolbarInit = page.getByRole('form', { name: 'toolbar-status' });
        await expect(toolbarInit).toBeVisible(); // 툴바 노출 대기

        const initButton = toolbarInit.getByRole('button', { name: baseStatus }); //환자 초기 상태로 변경
        await initButton.click();
        await waitTableReady(page);// 대시보드 대기
        await page.waitForTimeout(5000);

        const patientRow = page.locator(`tr:has(p:has-text("${currentPatientId}"))`);
        await expect(patientRow).toBeVisible(); // 환자 보이는지 확인
        const statusCell = patientRow.locator('td').nth(colIndex).getByRole('combobox');
        const initStatus = (await statusCell.textContent())?.trim();
        currentStatus = initStatus;
      }
      
      console.log(`🔁 [${baseTab}] 탭 → 대상 환자: ${currentPatientId} | 현재 상태: '${currentStatus}' | 변경할 상태: '${targetStatus}'`);

      // await scrollDashboardToBottomAndTop(page);

      // 상태 변경 전 체크박스 선택하여 툴바 열기
      await checkbox.click(); //체크박스 선택
      await page.waitForTimeout(1000);
      
      // 툴바 폼이 나타날 때까지 대기
      const toolbar = page.getByRole('form', { name: 'toolbar-status' });
      await expect(toolbar).toBeVisible();

      // 툴바 환자 상태 선택
      const targetButton = toolbar.getByRole('button', { name: targetStatus });
      await targetButton.click();
      await waitTableReady(page);
      await page.waitForTimeout(1000);

      // 탭 이동 후 환자 확인
      const expectedTab = ['New', 'Observing'].includes(targetStatus)
        ? 'Screened'
        : ['Complete', 'Error'].includes(targetStatus)
        ? 'Reviewed'
        : 'Dismissed';
      await page.getByRole('tab', { name: expectedTab }).click();
      await waitTableReady(page);
      await page.waitForTimeout(5000); // 탭 이동

      colIndex = await getStatusColumnIndex(page); // status 컬럼 인덱스 재확인 (탭마다 달라질 수 있어서)
      const verifiedRow = page.locator(`tr:has(p:has-text("${currentPatientId}"))`);

      if (await verifiedRow.count() === 0&& expectedTab === 'Screened') {
        // ▶ 여기서 검색 플로우로 fallback
        await verifyStatusWithSearch(page, currentPatientId, targetStatus);
      } else {
        // ▶ 기존 테이블에서 바로 상태 확인
        const statusCell = verifiedRow.locator('td').nth(colIndex);
        await expect(statusCell).toBeVisible({ timeout: 5000 });

        const combo = statusCell.getByRole('combobox');
        await expect(combo).toBeVisible({ timeout: 5000 });
        const text = (await combo.innerText()).trim();
        console.log(`🔍 [${expectedTab}] 탭에서 상태 텍스트='${text}'`);
        expect(text).toBe(targetStatus);
      }
      await screenShot(page,senarioName,`체크박스 상태 변경:  ${currentStatus} - ${targetStatus} 상태 변경 확인`);

      if (!currentPatientId) {
        console.log(`❌ 상태 '${targetStatus}' 로 변경 후 환자(${currentPatientId})를 ${expectedTab} 탭에서 찾을 수 없습니다.`);
      } else {
        console.log(`✅ 상태 '${targetStatus}' 로 정확히 변경됨`);
      }

      // 다시 원래 탭으로 복귀
      await page.getByRole('tab', { name: baseTab }).click();
      await waitTableReady(page);
      await page.waitForTimeout(1000);
    }
  }

  console.log('\n✅ 체크박스 상태 변경 흐름 완료');
});


test('대시보드 체크박스 다중 상태 변경 테스트', async ({ page }) => {
  for (const tab of ['Screened', 'Reviewed', 'Dismissed']) {
    await page.getByRole('tab', { name: tab }).click();
    await waitTableReady(page);
    await page.waitForTimeout(5000);

    const colIndex = await getStatusColumnIndex(page);

    console.log(`[${tab}]`);

    for (const targetStatus of statusOptions) {
      const rows = page.locator('tbody tr');
      const row1 = rows.nth(0);
      const row2 = rows.nth(1);

      const checkbox1 = row1.getByRole('checkbox');
      const checkbox2 = row2.getByRole('checkbox');

      const id1 = await extractPatientIdFromRow(page, row1);
      const id2 = await extractPatientIdFromRow(page, row2);

      let status1 = (await row1.locator('td').nth(colIndex).getByRole('combobox').textContent())?.trim();
      let status2 = (await row2.locator('td').nth(colIndex).getByRole('combobox').textContent())?.trim();

      // ✅ Dismissed 탭은 상태 같아도 무조건 유지
      if (tab !== 'Dismissed' && status1 === status2) {
        // row2 상태를 다른 것으로 먼저 변경
        await checkbox2.click();
        const toolbarInit = page.getByRole('form', { name: 'toolbar-status' });
        await expect(toolbarInit).toBeVisible();
        const newStatus = tab === 'Screened'
          ? status2 === 'New' ? 'Observing' : 'New'
          : status2 === 'Complete' ? 'Error' : 'Complete';
        await toolbarInit.getByRole('button', { name: newStatus }).click();
        await waitTableReady(page);
        await page.waitForTimeout(5000);

        status1 = (await row1.locator('td').nth(colIndex).getByRole('combobox').textContent())?.trim();
        status2 = (await row2.locator('td').nth(colIndex).getByRole('combobox').textContent())?.trim();
      }

      // ✅ 상태 변경 전 두 명 체크박스 선택
      const refreshedRows = page.locator('tbody tr');
      const refreshedRow1 = refreshedRows.nth(0);
      const refreshedRow2 = refreshedRows.nth(1);

      const refreshedCheckbox1 = refreshedRow1.getByRole('checkbox');
      const refreshedCheckbox2 = refreshedRow2.getByRole('checkbox');

      await refreshedCheckbox1.click();
      await refreshedCheckbox2.click();
      await page.waitForTimeout(500);

      const toolbar = page.getByRole('form', { name: 'toolbar-status' });
      await expect(toolbar).toBeVisible();

      console.log(`🔄 [두 환자(${status1},${status2}) 상태를 '${targetStatus}' 로 변경 시도`);

      const button = toolbar.getByRole('button', { name: targetStatus });
      await button.click();
      await waitTableReady(page);
      await page.waitForTimeout(5000);

      const expectedTab = ['New', 'Observing'].includes(targetStatus)
        ? 'Screened'
        : ['Complete', 'Error'].includes(targetStatus)
        ? 'Reviewed'
        : 'Dismissed';

      await page.getByRole('tab', { name: expectedTab }).click();
      await waitTableReady(page);
      await page.waitForTimeout(5000);

      const verifiedRow1 = page.locator(`tr:has(p:has-text("${id1}"))`);
      const verifiedRow2 = page.locator(`tr:has(p:has-text("${id2}"))`);

      // ✅ 1번 환자: 테이블에서 찾거나, Screened 탭이면 검색 모달로 확인
      if (await verifiedRow1.count() === 0 && expectedTab === 'Screened') {
        await verifyStatusWithSearch(page, id1, targetStatus);
      } else if (await verifiedRow1.count() === 0) {
        throw new Error(`환자 ${id1} 를 ${expectedTab} 탭에서 찾지 못했습니다.`);
      } else {
        const combo1 = verifiedRow1.locator('td').nth(colIndex).getByRole('combobox');
        const text1 = (await combo1.textContent())?.trim();
        expect(text1).toBe(targetStatus);
      }

      // ✅ 2번 환자: 동일 로직
      if (await verifiedRow2.count() === 0 && expectedTab === 'Screened') {
        await verifyStatusWithSearch(page, id2, targetStatus);
      } else if (await verifiedRow2.count() === 0) {
        throw new Error(`환자 ${id2} 를 ${expectedTab} 탭에서 찾지 못했습니다.`);
      } else {
        const combo2 = verifiedRow2.locator('td').nth(colIndex).getByRole('combobox');
        const text2 = (await combo2.textContent())?.trim();
        expect(text2).toBe(targetStatus);
      }
      await screenShot(page,senarioName,`체크박스 다중 상태 변경: ${status1},${status2} - ${targetStatus}`);

      await page.getByRole('tab', { name: tab }).click();
      await waitTableReady(page);
      await page.waitForTimeout(1000);
    }
  }

  console.log('\n✅ 체크박스 다중 상태 변경 흐름 완료');
});
