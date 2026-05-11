import { test, expect, type Page } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { getDismissedCount } from '../../playwright/fixture/patientCount.js';
import { closeConnection } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = 'TC_002_005 Dashboard - Dismissed/[03. Dismissed - 대시보드 환자 카운트]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
  await page.getByRole('tab', { name: 'Dismissed' }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

test('Dismissed 환자 카운트 확인', async ({ page }) => {
  const uiCount = await checkDismissedCount(page);
  await screenShot(page, senarioName, '1. Dismissed 환자 카운트 확인');

  const dbData = await getDismissedCount();
  const dbCount = dbData.length > 0 ? dbData[0].row_count : 0;

  expect(uiCount).toBe(dbCount);
  console.log('✅ Dismissed 카운트 확인');
});

async function checkDismissedCount(page: Page): Promise<number> {
  const textContent = (await page.getByText(/전체\d*/).textContent()) ?? '';
  const match = textContent.match(/전체(\d+)?/);
  return match?.[1] ? parseInt(match[1], 10) : 0;
}

test.afterAll(async () => {
  await closeConnection();
});