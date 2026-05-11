import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = 'TC_002_007 Patient Detail/[03. 환자 상세 - 노트]';

test.beforeEach(async ({ page }) => {
  test.setTimeout(0);
  await page.goto('/ko/login');
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

// ========== 헬퍼 ==========

async function getColIndex(page: Page, colName: string): Promise<number> {
  const headers = await page.locator('table thead tr th').allTextContents();
  const idx = headers.findIndex(h => h.trim().includes(colName));
  if (idx < 0) throw new Error(`Column not found: ${colName}`);
  return idx + 1;
}

async function openPatientDetailTab(page: Page, row: Locator): Promise<Page> {
  const locationIndex = await getColIndex(page, 'Location');
  const [detailPage] = await Promise.all([
    page.context().waitForEvent('page'),
    row.locator(`td:nth-child(${locationIndex})`).click(),
  ]);
  await detailPage.waitForLoadState('domcontentloaded');
  await detailPage.waitForTimeout(1500);
  return detailPage;
}

async function openNotePanel(detailPage: Page) {
  await detailPage.getByTestId('note-Toggle-button').click();
  await detailPage.waitForTimeout(1000);
}

// ========== 테스트 ==========

test('환자 상세 노트 없는/있는 경우 아이콘 확인', async ({ page }) => {
  const firstRow = page.locator('tbody tr').first();
  const detailPage = await openPatientDetailTab(page, firstRow);

  const noteToggle = detailPage.getByTestId('note-Toggle-button');
  await expect(noteToggle).toBeVisible({ timeout: 10000 });

  await openNotePanel(detailPage);
  await screenShot(detailPage, senarioName, '2. 저장된 노트 없는 경우');
  console.log('✅ 노트 없는 경우 아이콘 확인');

  await detailPage.getByRole('textbox').fill('노트 테스트1');
  await detailPage.getByTestId('note-creation-submit-button').click();
  await detailPage.waitForTimeout(1000);

  const latestNote = detailPage.getByRole('listitem').first();
  await expect(latestNote).toContainText('노트 테스트1');
  await screenShot(detailPage, senarioName, '1. 저장된 노트 있는 경우');
  console.log('✅ 노트 있는 경우 아이콘 확인');

  await detailPage.close();
});

test('환자 상세 노트 저장 버튼 확인', async ({ page }) => {
  const firstRow = page.locator('tbody tr').first();
  const detailPage = await openPatientDetailTab(page, firstRow);

  const noteToggle = detailPage.getByTestId('note-Toggle-button');
  await expect(noteToggle).toBeVisible({ timeout: 10000 });
  await openNotePanel(detailPage);

  const textbox = detailPage.getByRole('textbox');
  const saveButton = detailPage.getByTestId('note-creation-submit-button');

  await textbox.fill('노트 저장 테스트');
  await expect(saveButton).toBeEnabled();
  await detailPage.waitForTimeout(500);
  await screenShot(detailPage, senarioName, '3. 저장 버튼 활성화');
  console.log('✅ 노트 저장 버튼 활성화');

  await textbox.fill('');
  await expect(saveButton).toBeDisabled();
  await detailPage.waitForTimeout(500);
  await screenShot(detailPage, senarioName, '4. 저장 버튼 비활성화');
  console.log('✅ 노트 저장 버튼 비활성화');

  const rand = Math.floor(100 + Math.random() * 900);
  const noteText = `노트 저장 테스트 ${rand}`;
  await textbox.fill(noteText);
  await saveButton.click();
  await detailPage.waitForTimeout(1000);

  await expect(detailPage.getByRole('listitem').first()).toContainText(noteText);
  await screenShot(detailPage, senarioName, '5. 저장 노트 최상단 위치');
  console.log('✅ 노트 저장 후 최상단 위치 확인');

  await detailPage.close();
});

test('환자 상세 노트 삭제 확인', async ({ page }) => {
  const firstRow = page.locator('tbody tr').first();
  const detailPage = await openPatientDetailTab(page, firstRow);

  const noteToggle = detailPage.getByTestId('note-Toggle-button');
  await expect(noteToggle).toBeVisible({ timeout: 10000 });
  await openNotePanel(detailPage);

  await detailPage.getByRole('textbox').fill('삭제 테스트 노트');
  await detailPage.getByTestId('note-creation-submit-button').click();
  await detailPage.waitForTimeout(2000);

  const currentCount = await detailPage.getByRole('listitem').count();

  const deleteButton = detailPage.getByTestId('button-delete').first();
  await deleteButton.click();
  await detailPage.waitForTimeout(1000);
  await detailPage.getByRole('button', { name: '아니오' }).click();
  await detailPage.waitForTimeout(1000);
  let nowCount = await detailPage.getByRole('listitem').count();
  expect(nowCount).toBe(currentCount);
  await screenShot(detailPage, senarioName, '6. 노트 삭제 취소');
  console.log('✅ 노트 삭제 취소');

  await deleteButton.click();
  await detailPage.waitForTimeout(1000);
  await detailPage.getByRole('button', { name: '예' }).click();
  await detailPage.waitForTimeout(1000);
  nowCount = await detailPage.getByRole('listitem').count();
  expect(nowCount).toBe(currentCount - 1);
  await screenShot(detailPage, senarioName, '7. 노트 삭제 확인');
  console.log('✅ 노트 삭제 확인');

  await detailPage.close();
});
