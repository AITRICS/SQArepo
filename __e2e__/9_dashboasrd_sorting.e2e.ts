import { test, expect } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import globalSetup from '../playwright/fixture/globalSetup.js';
import axios from 'axios';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[09. 대시보드 컬럼 정렬]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

/** 
 * 대시보드 score 컬럼 정렬 확인
 */
test('대시보드 score 컬럼 정렬', async({ page }) => {
    await page.getByRole('button', { name: `${adminID} dropdown-arrow` }).click();
    await page.getByText('설정').click();
    await page.getByText('대시보드 설정').click();

    const resetButton = page.locator('button:has-text("초기화")');
    await resetButton.scrollIntoViewIfNeeded();
    await resetButton.click();
    await page.getByRole('button', { name: '예' }).click();

    await page.getByRole('link', { name: 'Screening' }).click();
    await page.waitForTimeout(500);
    const loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000});

    await page.getByRole('cell', { name: 'CAPS sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.locator('th:nth-child(12) > .w-full > div > .hover\\:bg-white\\/50').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'MAES sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.locator('th:nth-child(14) > .w-full > div > .hover\\:bg-white\\/50').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'SEPS sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.locator('th:nth-child(16) > .w-full > div > .hover\\:bg-white\\/50').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'MORS sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.locator('th:nth-child(18) > .w-full > div > .hover\\:bg-white\\/50').click();
    await waitforloading(page);

});

/** 
 * 대시보드 info 컬럼 정렬 확인
 */
test('대시보드 info 컬럼 정렬', async({ page }) => {
    await page.getByRole('cell', { name: 'Patient info sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'Dept sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'Physician sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'Date/Time sort' }).getByRole('img').click();
    await waitforloading(page);
});

/** 
 * 대시보드 vital 컬럼 정렬 확인
 */
test('대시보드 vital 컬럼 정렬', async({ page }) => {
    await page.getByRole('cell', { name: 'NEWS sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'MEWS sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'SBP sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'DBP sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'PR sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'RR sort' }).getByRole('img').click();
    await waitforloading(page);
    await page.getByRole('cell', { name: 'BT sort' }).getByRole('img').click();
    await waitforloading(page);
});

async function waitforloading(page): Promise<void> {
    await page.waitForTimeout(500);
    const loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); 
}

test.afterAll(async ({page}) => {
    await page.close();
  });