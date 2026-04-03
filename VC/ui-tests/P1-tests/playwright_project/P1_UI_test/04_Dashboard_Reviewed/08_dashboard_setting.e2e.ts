import { test, expect, Page } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { deleteUser, createUser, resetDashboardSetting } from '../../playwright/fixture/apiHelper.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'
const managerID = process.env.MANAGERID || 'defaultManager'
const managerPW = process.env.MANAGERPW || 'defaultManager!'
const memberID = process.env.MEMBERID || 'defaultUser'
const memberPW = process.env.MEMBERPW || 'defaultUser!'

const senarioName = '[Reviewed - 계정별 대시보드 설정 확인]';

const TOGGLE_ITEMS = [
  'MAES', 'SEPS', 'MORS', 'CARED',
  'Location', 'Dept', 'Physician', 'Note',
  'NEWS', 'MEWS', 'SBP', 'DBP', 'PR', 'RR', 'BT', 'SpO2'
];
const ALWAYS_VISIBLE_ITEMS = ['Status', 'Patient info sort', 'Screened type', 'Date/Time sort'];

async function loginAndWaitDashboard(page: Page, id: string, pw: string) {
  await page.goto('/ko/login');
  await login(page, id, pw);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
  await page.getByRole('tab', { name: 'Reviewed' }).click();
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
  await page.getByRole('tab', { name: 'Reviewed' }).click();
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

async function configureAndVerify(
  page: Page,
  id: string,
  pw: string,
  activeItems: string[],
  visibleItems: string[],
  hiddenItems: string[]
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
  // await logout(page, id);
}

test.beforeAll(async () => {
  await resetDashboardSetting(adminID, adminPW);
  await resetDashboardSetting(managerID, managerPW);
  await resetDashboardSetting(memberID, memberPW);
  console.log('✅ admin / manager / member 대시보드 설정 초기화 완료');
});

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
});

test('계정별 대시보드 컬럼 표시 설정 확인', async ({ page }) => {
  // admin
  await loginAndWaitDashboard(page, adminID, adminPW);
  await goToSettingSection(page, adminID);
  await resetDashboardSettings(page);
  await applyToggleSettings(page, ['SEPS']);
  await expect(page.locator('#SEPS-checkbox')).toBeChecked();
  await saveSettings(page);
  await goToDashboard(page);

  const adminThead = getTableHeader(page);
  const sepsCell = adminThead.getByRole('cell', { name: 'SEPS sort' });
  await expect(sepsCell).toBeVisible();
  await expect(sepsCell.locator('xpath=following-sibling::*[1]')).toBeVisible();
  await expectItemsVisible(page, adminThead, ALWAYS_VISIBLE_ITEMS);
  await expectItemsHidden(page, adminThead, [
    'MAES sort', 'MORS sort', 'CARED sort',
    'Location sort', 'Dept sort', 'Physician sort', 'Note',
    'NEWS sort', 'MEWS sort', 'SBP sort', 'DBP sort',
    'PR sort', 'RR sort', 'BT sort', 'SpO2 sort'
  ]);
  await screenShot(page, senarioName, '[admin] 대시보드 컬럼 표시 설정 확인');
  await logout(page, adminID);

  // manager
  await configureAndVerify(
    page, managerID, managerPW,
    ['MAES', 'Location', 'Dept', 'Physician', 'Note'],
    ['MAES sort', 'Location sort', 'Dept sort', 'Physician sort', 'Note'],
    ['SEPS sort', 'MORS sort', 'CARED sort', 'NEWS sort', 'MEWS sort', 'SBP sort', 'DBP sort', 'PR sort', 'RR sort', 'BT sort', 'SpO2 sort']
  );
  await screenShot(page, senarioName, '[manager] 대시보드 컬럼 표시 설정 확인');
  await logout(page, managerID);

  // 신규 계정 기본 대시보드 설정 확인
  const newUserID = `test_user_${Date.now()}`;
  const newUserPW = 'Test1234!';

  await loginAndWaitDashboard(page, managerID, managerPW);
  await goToSettingSection(page, managerID);
  await resetDashboardSettings(page);
  await applyToggleSettings(page, ['MAES', 'SEPS', 'MORS', 'CARED']);
  await saveSettings(page);
  await logout(page, managerID);

  await createUser({
    username: newUserID, password: newUserPW,
    name: newUserID, phone: '000',
    userType: 'Physician', userGroup: 'RRT',
  });
  await executeQuery(`UPDATE accounts_user SET is_active = 1 WHERE username = '${newUserID}';`);

  await loginAndWaitDashboard(page, newUserID, newUserPW);
  await goToDashboard(page);

  const newUserThead = getTableHeader(page);
  await expectItemsVisible(page, newUserThead, ALWAYS_VISIBLE_ITEMS);

  const itemsWithSort = ['MAES', 'SEPS', 'MORS', 'CARED', 'Location', 'Dept', 'Physician', 'NEWS', 'MEWS', 'SBP', 'DBP', 'PR', 'RR', 'BT', 'SpO2'];
  const itemsWithoutSort = ['Note'];
  for (const item of itemsWithSort) {
    await expect(newUserThead.getByRole('cell', { name: `${item} sort` })).toBeVisible();
  }
  for (const item of itemsWithoutSort) {
    await expect(newUserThead.getByRole('cell', { name: item })).toBeVisible();
  }
  await screenShot(page, senarioName, '[member] 신규 계정 대시보드 기본 컬럼 표시 확인');

  await logout(page, newUserID);
  await deleteUser(newUserID);
});

test('대시보드 컬럼 순서 변경 기능 확인', async ({ page }) => {
  async function scrollToItem() {
    const section = page.getByText('대시보드 순서/표시 설정');
    await section.waitFor({ state: 'visible' });
    await section.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function getItemRow(itemName: string) {
    return page
      .locator('div')
      .filter({ hasText: new RegExp(`^${itemName}$`) })
      .filter({ has: page.getByRole('button', { name: 'drag-icon' }) })
      .first();
  }

  function getDragHandle(itemName: string) {
    return getItemRow(itemName).getByRole('button', { name: 'drag-icon' });
  }

  async function moveToBottom(itemName: string) {
    await scrollToItem();
    const source = getDragHandle(itemName);
    const handles = page.getByRole('button', { name: 'drag-icon' });
    const last = handles.last();
    await source.waitFor({ state: 'visible' });
    await last.waitFor({ state: 'visible' });
    const box = await last.boundingBox();
    if (!box) throw new Error('last target boundingBox not found');
    await source.dragTo(last, { targetPosition: { x: box.width / 2, y: box.height - 2 } });
    await page.waitForTimeout(500);
  }

  async function reorderByIndex(order: string[]) {
    await scrollToItem();
    for (let i = 0; i < order.length; i++) {
      const source = getDragHandle(order[i]);
      const target = page.getByRole('button', { name: 'drag-icon' }).nth(i);
      await source.waitFor({ state: 'visible' });
      await target.waitFor({ state: 'visible' });
      const box = await target.boundingBox();
      if (!box) throw new Error(`target boundingBox not found for index ${i}`);
      await source.dragTo(target, { targetPosition: { x: box.width / 2, y: box.height / 2 } });
      await page.waitForTimeout(500);
    }
  }

  async function verifyColumnOrder(expectedOrder: string[]) {
    const thead = getTableHeader(page);
    const headers = thead.locator('th');
    const bookmarkHeader = headers.nth(1);
    await expect(bookmarkHeader.getByRole('button')).toBeVisible();
    for (let i = 0; i < expectedOrder.length; i++) {
      await expect(headers.nth(i + 2)).toContainText(expectedOrder[i]);
    }
  }

  // admin
  await loginAndWaitDashboard(page, adminID, adminPW);
  await goToSettingSection(page, adminID);
  await resetDashboardSettings(page);
  await moveToBottom('Pin');
  await reorderByIndex(['Bookmark', 'Location', 'Dept', 'Physician', 'Status', 'Patient info']);
  await saveSettings(page);
  await goToDashboard(page);
  await verifyColumnOrder(['Location', 'Dept', 'Physician', 'Status', 'Patient info']);
  await screenShot(page, senarioName, '[admin] 대시보드 컬럼 순서 변경 확인');

  await goToSettingSection(page, adminID);
  await page.locator('#Location-switch').click();
  await saveSettings(page);
  await goToDashboard(page);
  await expect(getTableHeader(page).getByRole('cell', { name: 'Location sort' })).not.toBeVisible();
  await screenShot(page, senarioName, '[admin] 대시보드 컬럼 비활성화 확인');
  await logout(page, adminID);

  // manager
  await loginAndWaitDashboard(page, managerID, managerPW);
  await goToSettingSection(page, managerID);
  await resetDashboardSettings(page);
  await moveToBottom('Pin');
  await reorderByIndex(['Bookmark', 'Location', 'Dept', 'Physician', 'Status', 'Patient info']);
  await saveSettings(page);
  await goToDashboard(page);
  await verifyColumnOrder(['Location', 'Dept', 'Physician', 'Status', 'Patient info']);
  await screenShot(page, senarioName, '[manager] 대시보드 컬럼 순서 변경 확인');

  await goToSettingSection(page, managerID);
  await page.locator('#Physician-switch').click();
  await saveSettings(page);
  await goToDashboard(page);
  await expect(getTableHeader(page).locator('th').nth(5)).not.toContainText('Physician');
  await screenShot(page, senarioName, '[manager] 대시보드 컬럼 비활성화 확인');
  await logout(page, managerID);

  // member
  await loginAndWaitDashboard(page, memberID, memberPW);
  await goToSettingSection(page, memberID);
  await resetDashboardSettings(page);
  await moveToBottom('Pin');
  await reorderByIndex(['Bookmark', 'Location', 'Dept', 'Physician', 'Status', 'Patient info']);
  await saveSettings(page);
  await goToDashboard(page);
  await verifyColumnOrder(['Location', 'Dept', 'Physician', 'Status', 'Patient info']);
  await screenShot(page, senarioName, '[member] 대시보드 컬럼 순서 변경 확인');

  await goToSettingSection(page, memberID);
  await page.locator('#Dept-switch').click();
  await saveSettings(page);
  await goToDashboard(page);
  await expect(getTableHeader(page).locator('th').nth(3)).not.toContainText('Dept');
  await screenShot(page, senarioName, '[member] 대시보드 컬럼 비활성화 확인');
  await logout(page, memberID);
});

test.afterAll(async () => {
  await resetDashboardSetting(adminID, adminPW);
  await resetDashboardSetting(managerID, managerPW);
  await resetDashboardSetting(memberID, memberPW);
  console.log('✅ admin / manager / member 대시보드 설정 초기화 완료');
  await closeConnection();
});