import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { isModalOpen, isModalClosed } from '../../playwright/fixture/util.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[Reviewed - 대시보드 노트]'

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

test('대시보드 노트 없는 경우 아이콘 확인', async ({ page }) => {
  const tableLocator = page.locator('table');
  const headers = await tableLocator.locator('thead tr th').allTextContents();
  const noteIndex = headers.indexOf('Note') + 1;

  let row = page.locator('tbody tr').first();
  let noteCell = row.locator(`td:nth-child(${noteIndex})`);
  let noteButton = noteCell.locator('button');
  let btnText = await noteButton.innerText();

  if (btnText.trim() === '') {
    await expect(noteButton).toBeVisible();
    await screenShot(page, senarioName, '저장된 노트 없는 경우');
    console.log(`✅ 노트 없는 경우 아이콘 확인`);

    await noteButton.click();
    await page.getByRole('textbox').fill('노트 테스트1');
    await page.getByTestId('note-creation-submit-button').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'icon-close' }).click();

    noteCell = row.locator(`td:nth-child(${noteIndex})`);
    noteButton = noteCell.locator('button');
    btnText = await noteButton.innerText();
    await expect(btnText).toContain('노트 테스트1');
    await screenShot(page, senarioName, '저장된 노트 있는 경우');
    console.log(`✅ 노트 있는 경우 아이콘 확인`);
  } else {
    await expect(noteButton).toContainText(/.+/);
    await screenShot(page, senarioName, '저장된 노트 있는 경우');
    console.log(`✅ 노트 있는 경우 아이콘 확인`);

    await noteButton.click();
    await page.getByTestId('button-delete').click();
    await page.getByRole('button', { name: '예' }).click();
    await page.getByRole('button', { name: 'icon-close' }).click();

    noteCell = row.locator(`td:nth-child(${noteIndex})`);
    noteButton = noteCell.locator('button');
    btnText = await noteButton.innerText();
    await expect(btnText.trim()).toBe('');
    await screenShot(page, senarioName, '저장된 노트 없는 경우');
    console.log(`✅ 노트 없는 경우 아이콘 확인`);
  }
});

test('대시보드 노트 저장 버튼 확인', async ({ page }) => {
  const tableLocator = page.locator('table');
  const headers = await tableLocator.locator('thead tr th').allTextContents();
  const noteIndex = headers.indexOf('Note') + 1;

  const row = page.locator('tbody tr').first();
  const noteCell = row.locator(`td:nth-child(${noteIndex})`);
  const noteButton = noteCell.locator('button');
  await noteButton.click();
  await page.waitForTimeout(1000);

  const textbox = page.getByRole('textbox');
  const saveButton = page.getByTestId('note-creation-submit-button');

  await textbox.fill('노트 저장 테스트');
  await expect(saveButton).toBeEnabled();
  await page.waitForTimeout(1000);
  await screenShot(page, senarioName, '노트 입력 후 저장 버튼 활성화');
  console.log(`✅ 노트 저장 버튼 활성화`);

  await textbox.fill('');
  await expect(saveButton).toBeDisabled();
  await page.waitForTimeout(1000);
  await screenShot(page, senarioName, '노트 입력 삭제 후 저장 버튼 비활성화');
  console.log(`✅ 노트 저장 버튼 비활성화`);

  const rand = Math.floor(100 + Math.random() * 900);
  const noteText = `노트 저장 테스트 ${rand}`;
  await textbox.fill(noteText);
  await saveButton.click();
  await page.waitForTimeout(1000);

  const latestNote = page.getByRole('listitem').first();
  await expect(latestNote).toContainText(noteText);
  await page.waitForTimeout(1000);
  await screenShot(page, senarioName, '저장 노트 최상단 위치');
  console.log(`✅ 노트 저장 후 최상단 위치 확인`);
});

test('대시보드 노트 삭제 확인', async ({ page }) => {
  const tableLocator = page.locator('table');
  const headers = await tableLocator.locator('thead tr th').allTextContents();
  const noteIndex = headers.indexOf('Note') + 1;

  const row = page.locator('tbody tr').first();
  const noteCell = row.locator(`td:nth-child(${noteIndex})`);
  const noteButton = noteCell.locator('button');
  await noteButton.click();
  await page.waitForTimeout(1000);

  await page.getByRole('textbox').fill('1');
  await page.getByTestId('note-creation-submit-button').click();
  await page.waitForTimeout(2000);

  let noteCount = await page.getByText(/노트 \d+/).textContent();
  let currentCount = parseInt(noteCount.replace(/\D/g, ''), 10);

  const deleteButton = page.getByTestId('button-delete').first();
  await deleteButton.click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '아니오' }).click();
  await page.waitForTimeout(1000);
  noteCount = await page.getByText(/노트 \d+/).textContent();
  let nowCount = parseInt(noteCount.replace(/\D/g, ''), 10);
  expect(currentCount).toBe(nowCount);
  await screenShot(page, senarioName, '노트 삭제 취소');
  console.log(`✅ 노트 삭제 취소`);

  await deleteButton.click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '예' }).click();
  await page.waitForTimeout(1000);
  noteCount = await page.getByText(/노트 \d+/).textContent();
  nowCount = parseInt(noteCount.replace(/\D/g, ''), 10);
  expect(nowCount).toBe(currentCount - 1);
  await screenShot(page, senarioName, '노트 삭제 확인');
  console.log(`✅ 노트 삭제 확인`);
});