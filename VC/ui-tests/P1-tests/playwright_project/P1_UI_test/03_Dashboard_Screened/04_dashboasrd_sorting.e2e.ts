import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import globalSetup from '../../playwright/playwright.globalSetup.js';
import axios from 'axios';
test.describe.configure({ mode: 'serial' }); // 테스트를 순차적으로 실행하도록 설정

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[11. 대시보드 컬럼 정렬]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

/** 
 * 대시보드 info 컬럼 정렬 확인
 */
test('대시보드 info 컬럼 정렬', async({ page }) => {
    await page.getByRole('cell', { name: 'Patient info sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Patient info 오름차순 정렬')
    console.log('✅ Patient info 오름차순 정렬 확인');
    await page.getByRole('cell', { name: 'Patient info sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Patient info 내림차순 정렬')
    console.log('✅ Patient info 내림차순 정렬 확인');

    await page.getByRole('cell', { name: 'Location sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Location 오름차순 정렬')
    console.log('✅ Location 오름차순 정렬 확인');
    await page.getByRole('cell', { name: 'Location sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Location 내림차순 정렬')
    console.log('✅ Location 내림차순 정렬 확인');

    await page.getByRole('cell', { name: 'Dept sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Dept 오름차순 정렬')
    console.log('✅ Dept 오름차순 정렬 확인');
    await page.getByRole('cell', { name: 'Dept sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Dept 내림차순 정렬')
    console.log('✅ Dept 내림차순 정렬 확인');

    await page.getByRole('cell', { name: 'Physician sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Physician 오름차순 정렬')
    console.log('✅ Physician 오름차순 정렬 확인');
    await page.getByRole('cell', { name: 'Physician sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Physician 내림차순 정렬')
    console.log('✅ Physician 내림차순 정렬 확인');

    await page.getByRole('cell', { name: 'Date/Time sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'DateTime 오름차순 정렬')
    console.log('✅ DateTime 내림차순 정렬 확인');
    await page.getByRole('cell', { name: 'Date/Time sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'DateTime 내림차순 정렬')
    console.log('✅ DateTime 오름차순 정렬 확인');
});


async function waitforloading(page): Promise<void> {
    await page.waitForTimeout(500);
    const loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); 
}
