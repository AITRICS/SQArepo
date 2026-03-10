import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login} from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { isModalOpen,isModalClosed } from '../../playwright/fixture/util.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const managerID = process.env.MANAGERID || 'defaultManager'
const managerPW = process.env.MANAGERPW || 'defaultManager!'

const memberID = process.env.MEMBERID || 'defaultUser'
const memberPW = process.env.MEMBERPW || 'defaultUser!'

const senarioName = '[08. 계정별 대시보드 설정 확인]';

// ========== 상수 ==========

const TOGGLE_ITEMS = [
  'MAES', 'SEPS', 'MORS', 'CARED',
  'Location', 'Dept', 'Physician', 'Note',
  'NEWS', 'MEWS', 'SBP', 'DBP', 'PR', 'RR', 'BT', 'SpO2'
];

const ALWAYS_VISIBLE_ITEMS = ['Status', 'Patient info sort', 'Screened type', 'Date/Time sort'];

// ========== 헬퍼 함수 ==========

async function loginAndWaitDashboard(page: Page, id: string, pw: string) {
  await page.goto('/ko/login');
  await login(page, id, pw);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
}

async function goToSettingSection(page: Page, id: string) {
  await page.getByRole('button', { name: `${id} dropdown-arrow` }).click();
  await page.getByText('설정', { exact: true }).click();
  await page.waitForTimeout(2000);
  const section = page.getByText('대시보드 순서/표시 설정');
  await section.waitFor({ state: 'visible' });
  await section.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  await page.waitForTimeout(2000);
}

async function resetDashboardSettings(page: Page) {
  const resetButton = page.getByRole('button', { name: 'reset-button' });
  await resetButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await resetButton.click();
  await page.getByRole('button', { name: 'confirm-button' }).click();
  await page.waitForTimeout(1000);
}

async function applyToggleSettings(page: Page, activeItems: string[]) {
  for (const item of TOGGLE_ITEMS) {
    const toggle = page.locator(`#${item}-switch`);
    const isOff = (await toggle.getAttribute('aria-checked')) === 'false';

    if (activeItems.includes(item)) {
      if (isOff) await toggle.click();
    } else {
      if (isOff) continue;
      await toggle.click();
    }
  }
}

async function saveSettings(page: Page) {
  const saveButton = page.getByRole('button', { name: '저장' }).nth(2);
  await saveButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveButton.click();
}

async function goToDashboard(page: Page) {
  await page.getByRole('link', { name: 'Screening' }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
}

function getTableHeader(page: Page) {
  return page.locator('table thead').first();
}

async function expectItemsVisible(page: Page, thead: any, items: string[]) {
  for (const item of items) {
    await expect(thead.getByRole('cell', { name: item })).toBeVisible();
  }
}

async function expectItemsHidden(page: Page, thead: any, items: string[]) {
  for (const item of items) {
    await expect(thead.getByRole('cell', { name: item })).not.toBeVisible();
  }
}

// ========== 공통 설정/저장/확인 흐름 ==========

async function configureAndVerify(
  page: Page,
  id: string,
  pw: string,
  activeItems: string[],
  visibleItems: string[],
  hiddenItems: string[],
  screenshotLabel: string
) {
  await loginAndWaitDashboard(page, id, pw);
  await goToSettingSection(page, id);
  await resetDashboardSettings(page);
  await applyToggleSettings(page, activeItems);
  await saveSettings(page);
  await goToDashboard(page);

  const thead = getTableHeader(page);
  await expectItemsVisible(page, thead, visibleItems);
  await expectItemsVisible(page, thead, ALWAYS_VISIBLE_ITEMS);
  await expectItemsHidden(page, thead, hiddenItems);

  // await screenShot(page, `${senarioName} - ${screenshotLabel}`);
  await logout(page, id);
}

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  
});

/**
 * role 별 대시보드 컬럼 표시 설정값 및 변경 확인
 */

test('계정별 대시보드 컬럼 표시 설정 확인', async ({ page }) => {

  // 1차: admin - SEPS + SEPS 변동값
  await loginAndWaitDashboard(page, adminID, adminPW);
  await goToSettingSection(page, adminID);
  await resetDashboardSettings(page);
  await applyToggleSettings(page, ['SEPS']);
  await expect(page.locator('#SEPS-checkbox')).toBeChecked(); // 변동값 자동 ON 검증
  await saveSettings(page);
  await goToDashboard(page);

  const adminThead = getTableHeader(page);
  const sepsCell = adminThead.getByRole('cell', { name: 'SEPS sort' });
  await expect(sepsCell).toBeVisible();
  await expect(sepsCell.locator('xpath=following-sibling::*[1]')).toBeVisible(); // SEPS 변동값
  await expectItemsVisible(page, adminThead, ALWAYS_VISIBLE_ITEMS);
  await expectItemsHidden(page, adminThead, [
    'MAES sort', 'MORS sort', 'CARED sort',
    'Location sort', 'Dept sort', 'Physician sort', 'Note',
    'NEWS sort', 'MEWS sort', 'SBP sort', 'DBP sort',
    'PR sort', 'RR sort', 'BT sort', 'SpO2 sort'
  ]);
  // await screenShot(page, `${senarioName} - [admin] SEPS 설정 적용 확인`);
  await logout(page, adminID);

  // 2차: manager - MAES + 환자 기본 정보
  await configureAndVerify(
    page, managerID, managerPW,
    ['MAES', 'Location', 'Dept', 'Physician', 'Note'],
    ['MAES sort', 'Location sort', 'Dept sort', 'Physician sort', 'Note'],
    ['SEPS sort', 'MORS sort', 'CARED sort', 'NEWS sort', 'MEWS sort', 'SBP sort', 'DBP sort', 'PR sort', 'RR sort', 'BT sort', 'SpO2 sort'],
    '[manager] MAES + 환자 기본 정보 설정 적용 확인'
  );

  // 3차: member - MAES, CARED, SEPS, MORS
  await configureAndVerify(
    page, memberID, memberPW,
    ['MAES', 'SEPS', 'MORS', 'CARED'],
    ['MAES sort', 'SEPS sort', 'MORS sort', 'CARED sort'],
    ['Location sort', 'Dept sort', 'Physician sort', 'Note', 'NEWS sort', 'MEWS sort', 'SBP sort', 'DBP sort', 'PR sort', 'RR sort', 'BT sort', 'SpO2 sort'],
    '[member] MAES/CARED/SEPS/MORS 설정 적용 확인'
  );

});

/**
 * 대시보드 컬럼 표시 변경 기능 확인
 * **/
test('대시보드 컬럼 표시 변경 기능 확인', async ({ page }) => {

  await configureAndVerify(
    page, adminID, adminPW,
    ['MAES', 'SEPS', 'MORS', 'CARED'],
    ['MAES sort', 'SEPS sort', 'MORS sort', 'CARED sort'],
    ['Location sort', 'Dept sort', 'Physician sort', 'Note', 'NEWS sort', 'MEWS sort', 'SBP sort', 'DBP sort', 'PR sort', 'RR sort', 'BT sort', 'SpO2 sort'],
    '[admin] MAES/SEPS/MORS/CARED 설정 적용 확인'
  );

});