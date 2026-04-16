import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { isModalOpen, isModalClosed } from '../../playwright/fixture/util.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[Reviewed - 대시보드 다운로드 확인]';

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

test('대시보드 다운로드 사유 모달 확인', async ({ page }) => {
  const dashboardDownload = page.getByRole('button', { name: 'icon-download Download' });
  await dashboardDownload.click();
  await page.waitForTimeout(1000);

  const modalOpened = await isModalOpen(page);
  expect(modalOpened).toBe(true);
  const dimmedOverlay = page.locator('div[data-state="open"][aria-hidden="true"]');
  await expect(dimmedOverlay).toBeVisible();
  await screenShot(page, senarioName, '대시보드 다운로드 모달 오픈 확인');
  console.log('✅ 대시보드 다운로드 모달 오픈 확인');

  await expect(page.getByText('회진용')).toBeVisible();
  await expect(page.getByText('의무기록용')).toBeVisible();
  await expect(page.getByText('제출용')).toBeVisible();
  await expect(page.getByText('직접 입력')).toBeVisible();

  const downloadButton = page.getByRole('button', { name: '다운로드' });
  await expect(downloadButton).toBeDisabled();
  await screenShot(page, senarioName, '다운로드 버튼 비활성화 확인');

  await page.getByRole('button', { name: '취소' }).click();
  const modalClosed = await isModalClosed(page);
  expect(modalClosed).toBe(true);
  await page.waitForTimeout(500);
  await screenShot(page, senarioName, '다운로드 모달 닫힘 확인');
  console.log('✅ 대시보드 다운로드 옵션 확인');

  await dashboardDownload.click();
  await page.waitForTimeout(1000);

  const reasons = ['회진용', '의무기록용', '제출용'];
  for (const reason of reasons) {
    const radio = page.getByRole('radio', { name: reason });
    await radio.click();
    await page.waitForTimeout(500);
    await expect(radio).toBeChecked();
    await screenShot(page, senarioName, `${reason} on 확인`);
    console.log(`✅ 대시보드 다운로드 옵션 ${reason} 확인`);
  }

  const directInputRadio = page.getByRole('radio', { name: '직접 입력' });
  await directInputRadio.click();
  await page.waitForTimeout(500);
  await expect(directInputRadio).toBeChecked();
  await screenShot(page, senarioName, '직접입력 on 확인');
  console.log('✅ 대시보드 다운로드 옵션 직접입력 확인');
});