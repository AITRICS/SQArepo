import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[Reviewed - 대시보드 컬럼 정렬]'

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

test('대시보드 info 컬럼 정렬', async ({ page }) => {
  await page.getByRole('cell', { name: 'Patient info sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'Patient info 오름차순 정렬');
  console.log('✅ Patient info 오름차순 정렬 확인');
  await page.getByRole('cell', { name: 'Patient info sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'Patient info 내림차순 정렬');
  console.log('✅ Patient info 내림차순 정렬 확인');

  await page.getByRole('cell', { name: 'Location sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'Location 오름차순 정렬');
  console.log('✅ Location 오름차순 정렬 확인');
  await page.getByRole('cell', { name: 'Location sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'Location 내림차순 정렬');
  console.log('✅ Location 내림차순 정렬 확인');

  await page.getByRole('cell', { name: 'Dept sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'Dept 오름차순 정렬');
  console.log('✅ Dept 오름차순 정렬 확인');
  await page.getByRole('cell', { name: 'Dept sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'Dept 내림차순 정렬');
  console.log('✅ Dept 내림차순 정렬 확인');

  await page.getByRole('cell', { name: 'Physician sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'Physician 오름차순 정렬');
  console.log('✅ Physician 오름차순 정렬 확인');
  await page.getByRole('cell', { name: 'Physician sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'Physician 내림차순 정렬');
  console.log('✅ Physician 내림차순 정렬 확인');

  await page.getByRole('cell', { name: 'Date/Time sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'DateTime 오름차순 정렬');
  console.log('✅ DateTime 오름차순 정렬 확인');
  await page.getByRole('cell', { name: 'Date/Time sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, 'DateTime 내림차순 정렬');
  console.log('✅ DateTime 내림차순 정렬 확인');
});

async function waitforloading(page): Promise<void> {
  await page.waitForTimeout(500);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
}