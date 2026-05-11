import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { executeQuery } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = 'TC_002_006 Dashboard - All Patients/[06. All Patients - 대시보드 id 복사 및 북마크]';

test.beforeEach(async ({ page }) => {
  test.setTimeout(0);
  await executeQuery(`DELETE FROM accounts_pin WHERE username = '${adminID}'`);
  await page.goto('/ko/login');
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
  // TODO: 실제 UI의 All Patients 탭 이름으로 수정 필요
  await page.getByRole('tab', { name: 'All Patients' }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

test('대시보드 id 복사', async ({ page }) => {
  const table = page.locator('table');
  const headers = await table.locator('thead tr th').allTextContents();
  const patientInfoIndex = headers.indexOf('Patient info') + 1;

  const firstRow = page.locator('tbody tr').first();
  const patientInfoCell = firstRow.locator(`td:nth-child(${patientInfoIndex})`);
  const copyButton = patientInfoCell.locator('button');

  await copyButton.click();
  await page.waitForTimeout(1000);
  const toast = page.getByText('EMR ID가 복사되었습니다.');
  await expect(toast).toBeVisible();
  await screenShot(page, senarioName, '1. EMR ID 복사');
  console.log('✅ EMR ID 복사 확인');
});

test('대시보드 북마크 on/off 확인', async ({ page }) => {
  const table = page.locator('table');

  const headerCells = table.locator('thead tr th');
  const bookmarkIndex =
    (await headerCells.evaluateAll((ths) =>
      ths.findIndex((th) => th.querySelector('[data-testid="bookmark-header"]'))
    )) + 1;

  expect(bookmarkIndex).toBeGreaterThan(0);

  const firstRow = table.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });

  const bookmarkCell = firstRow.locator(`td:nth-child(${bookmarkIndex})`);
  const bookmarkButton = bookmarkCell.locator('button');
  await expect(bookmarkButton).toBeVisible({ timeout: 10000 });

  await setBookmark(page, bookmarkCell, bookmarkButton, true);
  await screenShot(page, senarioName, '2. 북마크 on 확인');
  console.log('✅ 북마크 on 확인');

  await setBookmark(page, bookmarkCell, bookmarkButton, false);
  await screenShot(page, senarioName, '3. 북마크 off 확인');
  console.log('✅ 북마크 off 확인');
});

const BOOKMARK_ON_G = 'xpath=.//svg//g[@id="name=star, size=small"]';
const BOOKMARK_OFF_G = 'css=svg g#favorite';
const TOAST_ON = '북마크 등록이 완료되었습니다';
const TOAST_OFF = '북마크 해제가 완료되었습니다';

async function expectToastAppearAndDisappear(page: Page, text: string) {
  const toast = page.getByText(text);
  await toast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  await Promise.race([
    toast.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {}),
    toast.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {}),
  ]);
}

async function setBookmark(page: Page, cell: Locator, button: Locator, targetOn: boolean) {
  const currentlyOn = (await cell.locator(BOOKMARK_ON_G).count()) > 0;
  const currentlyOff = (await cell.locator(BOOKMARK_OFF_G).count()) > 0;
  console.log(`Currently bookmarked: on=${currentlyOn}, off=${currentlyOff}`);

  if (targetOn && currentlyOn) return;
  if (!targetOn && currentlyOff) return;

  await button.click();

  if (targetOn) {
    await expectToastAppearAndDisappear(page, TOAST_ON);
  } else {
    await expectToastAppearAndDisappear(page, TOAST_OFF);
  }
}

