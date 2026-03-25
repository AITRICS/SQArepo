import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import axios from 'axios';
import { executeQuery } from '../../playwright/fixture/setDatabase.js';
import { isModalOpen,isModalClosed, waitModalClosed } from '../../playwright/fixture/util.js';
test.describe.configure({ mode: 'serial' }); // 테스트를 순차적으로 실행하도록 설정

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[07. VC 홈 메뉴 확인]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

/** 
 * VC 홈 메뉴 확인
 */
test('VC 홈 메뉴 확인', async({ page }) => {
  await expect(page.getByText(new RegExp(`ScreeningReport한국어${adminID}`))).toBeVisible();
  await expect(page.getByText('ScreenedReviewedDismissed')).toBeVisible();
  await screenShot(page,senarioName,'Home 화면 및 상단 GNB 확인')

  await page.getByRole('link', { name: 'Report' }).click(); //Report 클릭
  await expect(page).toHaveURL(/\/ko\/report\/history$/);
  await screenShot(page,senarioName,'Report 탭 이동 확인')
  
  await page.getByRole('button', { name: `${adminID} dropdown-arrow` }).click();
  await page.getByText('설정').click(); //설정 클릭
  await expect(page).toHaveURL(/\/ko\/settings\/account$/);
  await screenShot(page,senarioName,'설정 이동 확인')

  await page.getByRole('link', { name: 'Screening' }).click(); //Screening 클릭
  await expect(page).toHaveURL(/\/ko\/screening\/screened$/);
  await screenShot(page,senarioName,'Screening 이동 확인')

  await page.getByRole('button', { name: 'LanguageIcon 한국어 dropdown-' }).click();
  await page.getByText('English').click();
  await expect(page).toHaveURL(/\/en\//);
  await screenShot(page,senarioName,'영문 변경 확인')

  await page.getByRole('button', { name: 'LanguageIcon English dropdown-' }).click();
  await page.getByText('한국어').click();
  await expect(page).toHaveURL(/\/ko\//);
  await screenShot(page,senarioName,'한국어 변경 확인')

});

/* 
 * 알림 아이콘 확인 
 */

test('알림 아이콘 확인', async({ page }) => {
  const rows = await executeQuery(`
    SELECT anh.*
    FROM vitalcare.accounts_notification_history AS anh
    WHERE username = '${adminID}';
  `);
  const iconWithDot = page.locator('svg[data-testid="notification-trigger-with-dot"]');
  const iconNoDot   = page.locator('svg[data-testid="notification-trigger"]');

  // 안읽은 알림이 있으면 dot 있는 아이콘
  const hasUnread = rows.some((r: any) => Number(r.is_read) === 0);

  if (rows.length > 0 && hasUnread) {
    await expect(iconWithDot).toBeVisible({ timeout: 5000 });
  } else {
    // 안읽음이 없거나 row가 없으면 dot 없는 아이콘
    await expect(iconNoDot).toBeVisible({ timeout: 5000 });
  }
  await screenShot(page,senarioName,'미확인 알림 있을 때 확인')
  console.log(`✅ 알림 있을 때 아이콘 확인`);

  // 알림 아이콘 클릭
  await iconWithDot.click();
  await page.getByRole('button', { name: '모두 읽음으로 표시' }).click();
  await expect(iconNoDot).toBeVisible({ timeout: 5000 });
  await screenShot(page,senarioName,'미확인 알림 없을 때 확인')
  console.log(`✅ 알림 읽음 처리 후 아이콘 확인`);

  // DB에서 해당 사용자의 알림 이력 모두 읽음 처리 후 확인
  await executeQuery(`
    DELETE FROM vitalcare.accounts_notification_history
    WHERE username = '${adminID}';
  `);
  await page.reload();
  await page.waitForTimeout(1000);
  await expect(iconNoDot).toBeVisible({ timeout: 5000 });
  await screenShot(page,senarioName,'알림 없을 때 아이콘 확인')
  console.log(`✅ 알림 없을 때 아이콘 확인`);
  

});

/**
 * 알람 모달 확인
 */
test('알림 모달 확인', async({ page }) => {
    await page.getByRole('navigation').getByRole('button').filter({ hasText: /^$/ }).click();
    const modalOpened = await isModalOpen(page);
    expect(modalOpened).toBe(true);
    await screenShot(page,senarioName,'알림 모달 오픈');
    console.log(`✅ 알림 모달 오픈`);
    
});