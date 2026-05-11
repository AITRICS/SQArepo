import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { isModalOpen, isModalClosed } from '../../playwright/fixture/util.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = 'TC_002_005 Dashboard - Dismissed/[02. Dismissed - 대시보드 노트]'

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

// 노트가 없는 첫 번째 환자 행 반환
async function findRowWithNoNote(page: Page, noteIndex: number): Promise<Locator> {
  const rows = page.locator('tbody tr');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const btnText = await row.locator(`td:nth-child(${noteIndex}) button`).innerText();
    if (btnText.trim() === '') return row;
  }
  throw new Error('노트가 없는 환자를 찾지 못했습니다.');
}

test('대시보드 노트 없는 경우 아이콘 확인', async ({ page }) => {
  const headers = await page.locator('table thead tr th').allTextContents();
  const noteIndex = headers.indexOf('Note') + 1;

  const row = await findRowWithNoNote(page, noteIndex);
  const noteCell = row.locator(`td:nth-child(${noteIndex})`);
  const noteButton = noteCell.locator('button');

  await expect(noteButton).toBeVisible();
  await screenShot(page, senarioName, '2. 저장된 노트 없는 경우');
  console.log(`✅ 노트 없는 경우 아이콘 확인`);

  await noteButton.click();
  await page.getByRole('textbox').fill('노트 테스트1');
  await page.getByTestId('note-creation-submit-button').click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'icon-close' }).click();

  const btnText = await noteCell.locator('button').innerText();
  await expect(btnText).toContain('노트 테스트1');
  await screenShot(page, senarioName, '1. 저장된 노트 있는 경우');
  console.log(`✅ 노트 있는 경우 아이콘 확인`);
});

test('대시보드 노트 저장 버튼 확인', async ({ page }) => {
  const headers = await page.locator('table thead tr th').allTextContents();
  const noteIndex = headers.indexOf('Note') + 1;

  const row = await findRowWithNoNote(page, noteIndex);
  const noteButton = row.locator(`td:nth-child(${noteIndex}) button`);
  await noteButton.click();
  await page.waitForTimeout(1000);

  const textbox = page.getByRole('textbox');
  const saveButton = page.getByTestId('note-creation-submit-button');

  await textbox.fill('노트 저장 테스트');
  await expect(saveButton).toBeEnabled();
  await page.waitForTimeout(1000);
  await screenShot(page, senarioName, '3. 저장 버튼 활성화');
  console.log(`✅ 노트 저장 버튼 활성화`);

  await textbox.fill('');
  await expect(saveButton).toBeDisabled();
  await page.waitForTimeout(1000);
  await screenShot(page, senarioName, '4. 저장 버튼 비활성화');
  console.log(`✅ 노트 저장 버튼 비활성화`);

  const rand = Math.floor(100 + Math.random() * 900);
  const noteText = `노트 저장 테스트 ${rand}`;
  await textbox.fill(noteText);
  await saveButton.click();
  await page.waitForTimeout(1000);

  const latestNote = page.getByRole('listitem').first();
  await expect(latestNote).toContainText(noteText);
  await page.waitForTimeout(1000);
  await screenShot(page, senarioName, '5. 저장 노트 최상단 위치');
  console.log(`✅ 노트 저장 후 최상단 위치 확인`);
});

test('대시보드 노트 삭제 확인', async ({ page }) => {
  const headers = await page.locator('table thead tr th').allTextContents();
  const noteIndex = headers.indexOf('Note') + 1;

  const row = await findRowWithNoNote(page, noteIndex);
  const noteButton = row.locator(`td:nth-child(${noteIndex}) button`);
  await noteButton.click();
  await page.waitForTimeout(1000);

  await page.getByRole('textbox').fill('1');
  await page.getByTestId('note-creation-submit-button').click();
  await page.waitForTimeout(2000);

  let currentCount = await page.getByRole('listitem').count();

  const deleteButton = page.getByTestId('button-delete').first();
  await deleteButton.click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '아니오' }).click();
  await page.waitForTimeout(1000);
  let nowCount = await page.getByRole('listitem').count();
  expect(currentCount).toBe(nowCount);
  await screenShot(page, senarioName, '6. 노트 삭제 취소');
  console.log(`✅ 노트 삭제 취소`);

  await deleteButton.click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '예' }).click();
  await page.waitForTimeout(1000);
  nowCount = await page.getByRole('listitem').count();
  expect(nowCount).toBe(currentCount - 1);
  await screenShot(page, senarioName, '7. 노트 삭제 확인');
  console.log(`✅ 노트 삭제 확인`);
});
