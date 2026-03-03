import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { getScreenedCount, getReviewedCount, getDismissedCount} from '../../playwright/fixture/patientCount.js';
import { executeQuery,closeConnection } from '../../playwright/fixture/setDatabase.js'

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[10. 대시보드 환자 카운트]'



test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

/** 
 * 대시보드 환자 카운트 확인
 */
test('Screened 환자 카운트 확인', async({ page }) => {

    // Screened 탭 UI 값 가져오기
    const screenedTab = page.getByRole('tab', { name: 'Screened' });
    await screenedTab.click();
    await page.waitForTimeout(2000);
    let loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
    const uiScreenedCounts = await checkScreenedCounts(page);
    await screenShot(page,senarioName,'Screened 환자 카운트 확인');



    // DB에서 카운트 값 가져오기
    const dbScreenedData = await getScreenedCount();
    const dbScreenedCounts = dbScreenedData.length > 0 ? dbScreenedData[0] : { all_count: 0, screened_count: 0, observing_count: 0 };
    await page.waitForTimeout(2000);
    const dbReviewedData= await getReviewedCount();
    const dbReviewedCounts = dbReviewedData.length > 0 ? dbReviewedData[0] : { all_count: 0, done_count: 0, error_count: 0 };
    await page.waitForTimeout(2000);
    const dbDismissedData = await getDismissedCount();
    const dbDismissedCount = dbDismissedData.length > 0 ? dbDismissedData[0].row_count : 0; 
    await page.waitForTimeout(2000);

    // UI 값과 DB 값 비교 (Screened)
    expect(uiScreenedCounts.all).toBe(dbScreenedCounts.all_count);
    expect(uiScreenedCounts.new).toBe(dbScreenedCounts.screened_count); // 신규 -> screened
    expect(uiScreenedCounts.observing).toBe(dbScreenedCounts.observing_count);
    console.log('✅ Screened 카운트 확인');

});

test('Screened 환자 상태 필터 확인', async({ page }) => {
    await setCheckbox(page, 'checkbox-SCREENED', false);
    await setCheckbox(page, 'checkbox-OBSERVING', true);
    await waitTableReady(page);

    // "New" 항목이 없어야 함
    await expectNoStatusValue(page, 'New');
    console.log('✅ New 상태 필터 확인');

    // -------------------------
    // 2) SCREENED ON, OBSERVING OFF -> Observing 없어야 함
    // -------------------------
    await setCheckbox(page, 'checkbox-SCREENED', true);
    await setCheckbox(page, 'checkbox-OBSERVING', false);
    await waitTableReady(page);

    // "Observing" 항목이 없어야 함
    await expectNoStatusValue(page, 'Observing');
    console.log('✅ Observing 상태 필터 확인');

    // -------------------------
    // 3) SCREENED OFF, OBSERVING OFF -> 환자 목록이 없습니다 노출
    // -------------------------
    await setCheckbox(page, 'checkbox-SCREENED', false);
    await setCheckbox(page, 'checkbox-OBSERVING', false);
    await waitTableReady(page);

    await expect(page.getByText('환자 목록이 없습니다')).toBeVisible({ timeout: 5000 });
    console.log('✅ 환자 목록이 없습니다 노출 확인');
});

// Screened 탭 카운트 확인 함수
async function checkScreenedCounts(page): Promise<{ all: number, new: number, observing: number }> {
    const textContent = await page.getByText(/전체\d*New\d*Observing\d*/).textContent();
    const match = textContent.match(/전체(\d*)?New(\d*)?Observing(\d*)?/);

    return {
        all: match && match[1] !== undefined && match[1] !== '' ? parseInt(match[1], 10) : 0,
        new: match && match[2] !== undefined && match[2] !== '' ? parseInt(match[2], 10) : 0,
        observing: match && match[3] !== undefined && match[3] !== '' ? parseInt(match[3], 10) : 0
    };
}

async function setCheckbox(page, testId: string, checked: boolean) {
  const cb = page.getByTestId(testId);
  if (checked) {
    await cb.check();
  } else {
    await cb.uncheck();
  }
}

async function waitTableReady(page) {
  const loading = page.locator('.absolute').first();
  await expect(loading).not.toBeVisible({ timeout: 10000 });
}

async function expectNoStatusValue(page, forbiddenStatus: 'New' | 'Observing') {
  // "Status" 헤더 위치(인덱스) 구하기
  const headers = page.locator('table thead th');
  const headerCount = await headers.count();

  let statusColIndex = -1; // 1-based로 맞출 예정
  for (let i = 0; i < headerCount; i++) {
    const text = (await headers.nth(i).innerText()).trim();
    if (text === 'Status') {
      statusColIndex = i + 1;
      break;
    }
  }
  expect(statusColIndex).toBeGreaterThan(0);

  const rows = page.locator('table tbody tr');
  const rowCount = await rows.count();

  for (let r = 0; r < rowCount; r++) {
    const cell = rows.nth(r).locator(`td:nth-child(${statusColIndex})`);

    // Status 셀 안의 combobox 값이 forbiddenStatus인지 체크
    // (네 설명대로 combobox가 "New"/"Observing"으로 표시된다는 가정)
    const forbidden = cell.getByRole('combobox', { name: forbiddenStatus });

    await expect(forbidden).toHaveCount(0);
  }
}

test.afterAll(async ({}) => {
    await closeConnection();
});