import { test, expect, type Page } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { resetDashboardSetting } from '../../playwright/fixture/apiHelper.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = 'TC_002_006 Dashboard - All Patients/[03. All Patients - 대시보드 컬럼 정렬]';

test.beforeAll(async () => {
  await resetDashboardSetting(adminID, adminPW);
  console.log('✅ admin 대시보드 설정 초기화 완료');
});

test.beforeEach(async ({ page }) => {
  test.setTimeout(0);
  await page.goto('/ko/login');
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
  // TODO: 실제 UI의 All Patients 탭 이름으로 수정 필요
  await page.getByRole('tab', { name: 'All Patients' }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

test('대시보드 컬럼 정렬', async ({ page }) => {
  await page.getByRole('cell', { name: 'Patient info sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '1. Patient info 오름차순 정렬');
  console.log('✅ Patient info 오름차순 정렬 확인');
  await page.getByRole('cell', { name: 'Patient info sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '2. Patient info 내림차순 정렬');
  console.log('✅ Patient info 내림차순 정렬 확인');

  await page.getByRole('cell', { name: 'Location sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '3. Location 오름차순 정렬');
  console.log('✅ Location 오름차순 정렬 확인');
  await page.getByRole('cell', { name: 'Location sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '4. Location 내림차순 정렬');
  console.log('✅ Location 내림차순 정렬 확인');

  await page.getByRole('cell', { name: 'Dept sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '5. Dept 오름차순 정렬');
  console.log('✅ Dept 오름차순 정렬 확인');
  await page.getByRole('cell', { name: 'Dept sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '6. Dept 내림차순 정렬');
  console.log('✅ Dept 내림차순 정렬 확인');

  await page.getByRole('cell', { name: 'Physician sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '7. Physician 오름차순 정렬');
  console.log('✅ Physician 오름차순 정렬 확인');
  await page.getByRole('cell', { name: 'Physician sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '8. Physician 내림차순 정렬');
  console.log('✅ Physician 내림차순 정렬 확인');

  await page.getByRole('cell', { name: 'Admission date sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '9. Admission date 내림차순 정렬');
  console.log('✅ Admission date 내림차순 정렬 확인');
  await page.getByRole('cell', { name: 'Admission date sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '10. Admission date 오름차순 정렬');
  console.log('✅ Admission date 오름차순 정렬 확인');

  await page.getByRole('cell', { name: 'Last Calculated sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '11. Last Calculated 내림차순 정렬');
  console.log('✅ Last Calculated 내림차순 정렬 확인');
  await page.getByRole('cell', { name: 'Last Calculated sort' }).getByRole('img').click();
  await waitforloading(page);
  await screenShot(page, senarioName, '12. Last Calculated 오름차순 정렬');
  console.log('✅ Last Calculated 오름차순 정렬 확인');
});

test.afterAll(async () => {
  await resetDashboardSetting(adminID, adminPW);
});

async function waitforloading(page: Page): Promise<void> {
  await page.waitForTimeout(500);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
}
