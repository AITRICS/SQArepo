import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import globalSetup from '../playwright/playwright.globalSetup.js';
import axios from 'axios';
import { executeQuery, closeConnection } from '../playwright/fixture/setDatabase.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[12. 대시보드 환자 상태 변경]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

const statusOptions = ['신규', '관찰중', '완료', '오류', 'Dismissed'];

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
  let expectedTab = ['신규', '관찰중'].includes(targetStatus)
    ? 'Screened'
    : ['완료', '오류'].includes(targetStatus)
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

async function extractPatientIdFromRow(page: Page, row: Locator): Promise<string | null> {
  const ths = page.locator('thead tr th');
  const thCount = await ths.count();
  for (let i = 0; i < thCount; i++) {
    const text = await ths.nth(i).innerText();
    if (text.trim().toLowerCase().includes('patient info')) {
      const cell = row.locator('td').nth(i);
      return (await cell.locator('p').first().textContent())?.trim() || null;
    }
  }
  return null;
}

test('대시보드 환자 상태 변경', async ({ page }) => {
  const colIndex = await getStatusColumnIndex(page);

  for (const baseStatus of statusOptions) {
    // 해당 상태 탭으로 이동
    const baseTab = ['완료', '오류'].includes(baseStatus)
      ? 'Reviewed'
      : baseStatus === 'Dismissed'
      ? 'Dismissed'
      : 'Screened';

    await page.getByRole('tab', { name: baseTab }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    let row = page.locator('tbody tr').first();
    let currentPatientId = await extractPatientIdFromRow(page, row);
    if (!currentPatientId) continue;


    for (let i = 0; i < statusOptions.length; i++) {
      currentPatientId = await extractPatientIdFromRow(page, row);
      const statusCombo = row.locator('td').nth(colIndex).getByRole('combobox');
      let currentStatus = (await statusCombo.textContent())?.trim();

      // 상태 초기화
      if (currentStatus !== baseStatus) {
        const resetIndex = statusOptions.indexOf(baseStatus);
        await changeStatusAndVerify(page, row, currentPatientId, colIndex, resetIndex, baseTab);

        await page.getByRole('tab', { name: baseTab }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        row = page.locator('tbody tr').first();
        currentPatientId = await extractPatientIdFromRow(page, row);
        currentStatus = (await row.locator('td').nth(colIndex).getByRole('combobox').textContent())?.trim();
      }
      currentPatientId = await extractPatientIdFromRow(page, row);
      const targetStatus = statusOptions[i];

      console.log(`🔁 [${baseTab}] 탭 → 대상 환자: ${currentPatientId} | 현재 상태: '${currentStatus}' | 변경할 상태: '${targetStatus}'`);
      await changeStatusAndVerify(page, row, currentPatientId, colIndex, i, baseTab);
      console.log(`✅ 상태 '${targetStatus}' 로 변경됨 확인`);
      
      // 다시 탭 복귀 및 row 재지정
      await page.getByRole('tab', { name: baseTab }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      row = page.locator('tbody tr').first();
      currentPatientId = await extractPatientIdFromRow(page, row);
    }
  }

  console.log('✅ 모든 상태 변경 테스트 완료');
});


test('체크박스 환자 상태 변경', async ({ page }) => {
  for (const baseStatus of statusOptions) { // 초기 환자 상태
    const baseTab = ['완료', '오류'].includes(baseStatus)
      ? 'Reviewed'
      : baseStatus === 'Dismissed'
      ? 'Dismissed'
      : 'Screened';
    console.log(`========= baseStatus: ${baseStatus} ==========`)
    await page.getByRole('tab', { name: baseTab }).click(); //screened, reviewed, dismissed 대시보드 클릭
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
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
        console.log(`< current Status: ${currentStatus}, base Status: ${baseStatus} >`)

        await checkbox.click(); //체크박스 선택
        await page.waitForTimeout(1000);

        const toolbarInit = page.getByRole('form', { name: 'toolbar-status' });
        await expect(toolbarInit).toBeVisible(); // 툴바 노출 대기

        const initButton = toolbarInit.getByRole('button', { name: baseStatus }); //환자 초기 상태로 변경
        await initButton.click();
        await page.waitForLoadState('networkidle'); // 대시보드 대기
        await page.waitForTimeout(5000);

        const patientRow = page.locator(`tr:has(p:has-text("${currentPatientId}"))`);
        await expect(patientRow).toBeVisible(); // 환자 보이는지 확인
        const statusCell = patientRow.locator('td').nth(colIndex).getByRole('combobox');
        const initStatus = (await statusCell.textContent())?.trim();
        console.log(`📌 ${currentPatientId} 환자 상태를 '${initStatus}' 로 만들었음`);
        currentStatus = initStatus;
      }
      
      console.log(`🔁 [${baseTab}] 탭 → 대상 환자: ${currentPatientId} | 현재 상태: '${currentStatus}' | 변경할 상태: '${targetStatus}'`);

      await scrollDashboardToBottomAndTop(page);

      // 상태 변경 전 체크박스 선택하여 툴바 열기
      await checkbox.click(); //체크박스 선택
      await page.waitForTimeout(1000);
      
      // 툴바 폼이 나타날 때까지 대기
      const toolbar = page.getByRole('form', { name: 'toolbar-status' });
      await expect(toolbar).toBeVisible();

      // 툴바 환자 상태 선택
      const targetButton = toolbar.getByRole('button', { name: targetStatus });
      await targetButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // 탭 이동 후 환자 확인
      const expectedTab = ['신규', '관찰중'].includes(targetStatus)
        ? 'Screened'
        : ['완료', '오류'].includes(targetStatus)
        ? 'Reviewed'
        : 'Dismissed';
      await page.getByRole('tab', { name: expectedTab }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // 탭 이동

      colIndex = await getStatusColumnIndex(page);
      const verifiedRow = page.locator(`tr:has(p:has-text("${currentPatientId}"))`);
      const combo = verifiedRow.locator('td').nth(colIndex).getByRole('combobox');
      const text = (await combo.textContent())?.trim();
    
      expect(text).toBe(targetStatus);

      if (!currentPatientId) {
        console.log(`❌ 상태 '${targetStatus}' 로 변경 후 환자(${currentPatientId})를 ${expectedTab} 탭에서 찾을 수 없습니다.`);
      } else {
        console.log(`✅ 상태 '${targetStatus}' 로 정확히 변경됨`);
      }

      // 다시 원래 탭으로 복귀
      await page.getByRole('tab', { name: baseTab }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
  }

  console.log('\n✅ 체크박스 상태 변경 흐름 완료');
});


test('대시보드 체크박스 다중 상태 변경 테스트', async ({ page }) => {
  for (const tab of ['Screened', 'Reviewed', 'Dismissed']) {
    await page.getByRole('tab', { name: tab }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const colIndex = await getStatusColumnIndex(page);

    console.log(`[${tab}]`)

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
          ? status2 === '신규' ? '관찰중' : '신규'
          : status2 === '완료' ? '오류' : '완료';
        await toolbarInit.getByRole('button', { name: newStatus }).click();
        await page.waitForLoadState('networkidle');
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
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);

      const expectedTab = ['신규', '관찰중'].includes(targetStatus)
        ? 'Screened'
        : ['완료', '오류'].includes(targetStatus)
        ? 'Reviewed'
        : 'Dismissed';

      await page.getByRole('tab', { name: expectedTab }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const verifiedRow1 = page.locator(`tr:has(p:has-text("${id1}"))`);
      const verifiedRow2 = page.locator(`tr:has(p:has-text("${id2}"))`);
      const combo1 = verifiedRow1.locator('td').nth(colIndex).getByRole('combobox');
      const combo2 = verifiedRow2.locator('td').nth(colIndex).getByRole('combobox');
      const text1 = (await combo1.textContent())?.trim();
      const text2 = (await combo2.textContent())?.trim();

      if (text1 === targetStatus && text2 === targetStatus) {
        console.log(`✅ 두 환자 모두 '${targetStatus}' 로 변경 완료됨`);
      } else {
        console.log(`❌ 변경 실패: 상태1='${text1}' 상태2='${text2}'`);
      }

      await page.getByRole('tab', { name: tab }).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
  }

  console.log('\n✅ 체크박스 다중 상태 변경 흐름 완료');
});
