import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[15. 대시보드 id 복사 및 북마크 확인]';

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

test('대시보드 id 복사', async ({ page }) => {
  const table = page.locator('table');
  const headers = await table.locator('thead tr th').allTextContents();
  const patientInfoIndex = headers.indexOf('Patient info') + 1;

  const firstRow = page.locator('tbody tr').first();
  const patientInfoCell = firstRow.locator(`td:nth-child(${patientInfoIndex})`);

  const copyButton = patientInfoCell.locator('button'); //환자 ID 버튼 추출

  //마우스 호버 커서 확인
  await copyButton.hover();
  const cursorStyle = await copyButton.evaluate(el =>
    window.getComputedStyle(el).getPropertyValue('cursor')
  );
  expect(cursorStyle).toBe('pointer');
  await page.waitForTimeout(1000);
  await screenShot(page,senarioName,'EMR ID 마우스 커서 확인');

  //emr id 복사 토스트 메세지 확인
  await copyButton.click();
  await page.waitForTimeout(1000);
  const toast = page.getByText('EMR ID가 복사되었습니다.');
  await expect(toast).toBeVisible();
  await screenShot(page,senarioName,'EMR ID 복사');

});

test('대시보드 북마크', async ({ page }) => {
  const thElements = page.locator('table thead tr th');
  const count = await thElements.count();
  let bookmarkIndex = -1;
  for (let i = 0; i < count; i++) {
    const th = thElements.nth(i);
    const hasStar = await th.locator('path#star').count();
    if (hasStar > 0) {
      bookmarkIndex = i + 1;
      break;
    }
  } // 북마크 컬럼 찾기


  const firstRow = page.locator('tbody tr').first();
  const bookmarkCell = firstRow.locator(`td:nth-child(${bookmarkIndex})`);
  const bookmarkButton = bookmarkCell.locator('button');
  const bookmarkIcon = bookmarkCell.locator('svg path#star');

  //현재 북마크 상태 확인
  let initialFill = await bookmarkIcon.getAttribute('fill');
  const isInitiallyBookmarked = initialFill === '#FFC700';

  //북마크 상태 전환
  await bookmarkButton.click();
  await page.waitForTimeout(3000);

  let toggledFill = await bookmarkIcon.getAttribute('fill');
  expect(toggledFill).toBe(isInitiallyBookmarked ? '#7D8398' : '#FFC700');
  await screenShot(page,senarioName,'북마크 상태 변경');

  //북마크 상태 전환
  await bookmarkButton.click();
  await page.waitForTimeout(3000);

  const revertedFill = await bookmarkIcon.getAttribute('fill');
  expect(revertedFill).toBe(initialFill);
  await screenShot(page,senarioName,'북마크 상태 복원');
});