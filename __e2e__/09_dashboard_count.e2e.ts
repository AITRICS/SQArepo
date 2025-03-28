import { test, expect } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import { getScreenedCount, getReviewedCount, getDismissedCount} from '../playwright/fixture/patientCount.js';
import { closeConnection } from '../playwright/fixture/setDatabase.js'

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[08. 대시보드 환자 카운트]'



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
test('대시보드 환자 카운트 확인', async({ page }) => {
    // ✅ Screened 탭 UI 값 가져오기
    const screenedTab = page.getByRole('tab', { name: 'Screened' });
    await screenedTab.click();
    await page.waitForTimeout(2000);
    let loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
    const uiScreenedCounts = await checkScreenedCounts(page);
    await screenShot(page,senarioName,'Screened 환자 카운트 확인');

    // ✅ Reviewed 탭 UI 값 가져오기
    const reviewedTab = page.getByRole('tab', { name: 'Reviewed' });
    await reviewedTab.click();
    await page.waitForTimeout(2000);
    loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
    const uiReviewedCounts = await checkReviewedCounts(page);
    await screenShot(page,senarioName,'Reviewed 환자 카운트 확인');

    // ✅ Dismissed 탭 UI 값 가져오기
    const dismissedTab = page.getByRole('tab', { name: 'Dismissed' });
    await dismissedTab.click();
    await page.waitForTimeout(2000);
    loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
    const uiDismissedCount = await checkDismissedCounts(page);
    await screenShot(page,senarioName,'Dismissed 환자 카운트 확인');

    // ✅ DB에서 카운트 값 가져오기
    const dbScreenedData = await getScreenedCount();
    const dbScreenedCounts = dbScreenedData.length > 0 ? dbScreenedData[0] : { all_count: 0, screened_count: 0, observing_count: 0 };
    await page.waitForTimeout(2000);
    const dbReviewedData= await getReviewedCount();
    const dbReviewedCounts = dbReviewedData.length > 0 ? dbReviewedData[0] : { all_count: 0, done_count: 0, error_count: 0 };
    await page.waitForTimeout(2000);
    const dbDismissedData = await getDismissedCount();
    const dbDismissedCount = dbDismissedData.length > 0 ? dbDismissedData[0].row_count : 0; 
    await page.waitForTimeout(2000);

    // ✅ UI 값과 DB 값 비교 (Screened)
    expect(uiScreenedCounts.all).toBe(dbScreenedCounts.all_count);
    expect(uiScreenedCounts.new).toBe(dbScreenedCounts.screened_count); // 신규 -> screened
    expect(uiScreenedCounts.observing).toBe(dbScreenedCounts.observing_count);
    console.log('✅ Screened 카운트 검증 완료');

    // ✅ UI 값과 DB 값 비교 (Reviewed)
    expect(uiReviewedCounts.all).toBe(dbReviewedCounts.all_count);
    expect(uiReviewedCounts.complete).toBe(dbReviewedCounts.done_count); // 완료 -> done
    expect(uiReviewedCounts.error).toBe(dbReviewedCounts.error_count);
    console.log('✅ Reviewed 카운트 검증 완료');

    // ✅ UI 값과 DB 값 비교 (Dismissed)
    expect(uiDismissedCount).toBe(dbDismissedCount);
    console.log('✅ Dismissed 카운트 검증 완료');
});

// ✅ Screened 탭 카운트 확인 함수
async function checkScreenedCounts(page): Promise<{ all: number, new: number, observing: number }> {
    const textContent = await page.getByText(/전체\d*신규\d*관찰중\d*/).textContent();
    const match = textContent.match(/전체(\d*)?신규(\d*)?관찰중(\d*)?/);

    return {
        all: match && match[1] !== undefined && match[1] !== '' ? parseInt(match[1], 10) : 0,
        new: match && match[2] !== undefined && match[2] !== '' ? parseInt(match[2], 10) : 0,
        observing: match && match[3] !== undefined && match[3] !== '' ? parseInt(match[3], 10) : 0
    };
}

// ✅ Reviewed 탭 카운트 확인 함수
async function checkReviewedCounts(page): Promise<{ all: number, complete: number, error: number }> {
    const textContent = await page.getByText(/전체\d*완료\d*오류\d*/).textContent();
    const match = textContent.match(/전체(\d*)?완료(\d*)?오류(\d*)?/);

    return {
        all: match && match[1] !== undefined && match[1] !== '' ? parseInt(match[1], 10) : 0,
        complete: match && match[2] !== undefined && match[2] !== '' ? parseInt(match[2], 10) : 0,
        error: match && match[3] !== undefined && match[3] !== '' ? parseInt(match[3], 10) : 0
    };
}
// ✅ Dismissed 탭 카운트 확인 함수
async function checkDismissedCounts(page): Promise<number> {
    const textContent = await page.getByText(/전체\d*/).textContent();
    const match = textContent.match(/전체(\d*)?/);
    return match && match[1] !== undefined && match[1] !== '' ? parseInt(match[1], 10) : 0;
}

test.afterAll(async ({}) => {
    await closeConnection();
  });