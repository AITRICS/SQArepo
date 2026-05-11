import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = 'TC_002_007 Patient Detail/[05. 환자 상세 - Action]';

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

function getTodayString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ========== 테스트 ==========

test('Action 패널 열기/닫기 확인', async ({ page }) => {
  const detailPage = await openPatientDetailTab(page, page.locator('tbody tr').first());

  // Action 버튼 클릭
  await detailPage.getByRole('button', { name: 'Action' }).click();

  // Action 패널 열림 확인 (Acting time + 오늘 날짜 포함)
  const today = getTodayString();
  const actionPanel = detailPage.getByText(new RegExp(`ActionActing time${today}`));
  await expect(actionPanel).toBeVisible({ timeout: 5000 });
  await screenShot(detailPage, senarioName, '1. Action 패널 열림 확인');
  console.log('✅ Action 패널 열림 확인');

  // Action 패널 닫기 후 Action 버튼 aria-expanded 상태로 확인
  const closeButton = detailPage.locator('.w-full > .p-\\[20px\\] > div > .flex').first();
  await closeButton.click();
  await expect(detailPage.getByRole('button', { name: 'Action' })).toHaveAttribute('aria-expanded', 'false', { timeout: 5000 });
  await screenShot(detailPage, senarioName, '2. Action 패널 닫힘 확인');
  console.log('✅ Action 패널 닫힘 확인');

  await detailPage.close();
});

test('Action 패널 구성 확인', async ({ page }) => {
  const detailPage = await openPatientDetailTab(page, page.locator('tbody tr').first());

  await detailPage.getByRole('button', { name: 'Action' }).click();
  await expect(detailPage.getByText(new RegExp(`ActionActing time${getTodayString()}`))).toBeVisible({ timeout: 5000 });

  // 닫기 버튼 표시
  await expect(detailPage.locator('.w-full > .p-\\[20px\\] > div > .flex').first()).toBeVisible();
  console.log('✅ 닫기 버튼 표시 확인');

  // 액션 타임 입력 필드 (현재 일시 표시 - MM-DD HH:mm 패턴)
  await expect(detailPage.getByRole('button', { name: /\d{2}-\d{2} \d{2}:\d{2}/ })).toBeVisible();
  console.log('✅ 액션 타임 입력 필드 표시 확인');

  // 액션 타입 아이콘
  const actionTypes = ['CPR', 'ICU Transfer', 'Intubation', 'Observation', 'Examination', 'Medication', 'Ventilator', 'Others'];
  for (const name of actionTypes) {
    await expect(detailPage.getByRole('button', { name })).toBeVisible();
  }
  console.log('✅ 액션 타입 아이콘 표시 확인');

  // 코멘트 입력 필드
  await expect(detailPage.getByRole('textbox', { name: /자 이내로 입력/ })).toBeVisible();
  console.log('✅ 코멘트 입력 필드 표시 확인');

  // 저장 버튼
  await expect(detailPage.getByRole('button', { name: '저장' })).toBeVisible();
  console.log('✅ 저장 버튼 표시 확인');

  // 액션 내역 (갯수는 동적)
  await expect(detailPage.getByText(/Action History\d+Acting/)).toBeVisible();
  console.log('✅ 액션 내역 표시 확인');

  await screenShot(detailPage, senarioName, '3. Action 패널 구성 확인');

  await detailPage.close();
});

test('Action 저장 확인', async ({ page }) => {
  const detailPage = await openPatientDetailTab(page, page.locator('tbody tr').first());

  await detailPage.getByRole('button', { name: 'Action' }).click();
  await expect(detailPage.getByText(new RegExp(`ActionActing time${getTodayString()}`))).toBeVisible({ timeout: 5000 });

  // 저장 전 액션 카운트 추출
  const historyTextBefore = (await detailPage.getByText(/Action History\d+Acting/).textContent()) ?? '';
  const countBefore = parseInt(historyTextBefore.match(/Action History(\d+)Acting/)?.[1] ?? '0', 10);

  // 액션 타입 선택 및 코멘트 입력
  await detailPage.getByRole('button', { name: 'CPR' }).click();
  await detailPage.getByRole('textbox', { name: /자 이내로 입력/ }).fill('p1 test');

  // 저장
  await detailPage.getByRole('button', { name: '저장' }).click();
  await detailPage.waitForTimeout(1000);

  // 액션 타입 초기화 확인
  await expect(detailPage.getByRole('button', { name: 'CPR' })).not.toHaveAttribute('aria-pressed', 'true');
  console.log('✅ 액션 타입 초기화 확인');

  // 코멘트 초기화 확인
  await expect(detailPage.getByRole('textbox', { name: /자 이내로 입력/ })).toHaveValue('');
  console.log('✅ 코멘트 초기화 확인');

  // 액션 카운트 +1 확인
  await expect(detailPage.getByText(new RegExp(`Action History${countBefore + 1}Acting`))).toBeVisible({ timeout: 5000 });
  console.log(`✅ 액션 카운트 ${countBefore} → ${countBefore + 1} 확인`);

  // 액션 내역 테이블 확인
  await expect(detailPage.getByRole('table', { name: 'Action History' })).toBeVisible({ timeout: 5000 });
  await expect(detailPage.getByLabel('Action History').getByText('Acting time')).toBeVisible();
  await expect(detailPage.getByLabel('Action History').getByText('Action')).toBeVisible();
  await expect(detailPage.getByRole('columnheader', { name: 'Recorder' })).toBeVisible();

  // 저장된 내용 확인 (최신 항목 기준)
  await expect(detailPage.getByLabel('Action History').getByText('CPR').first()).toBeVisible();
  await expect(detailPage.getByLabel('Action History').getByText('p1 test').first()).toBeVisible();
  console.log('✅ 저장 내역 확인 (CPR, p1 test)');

  await screenShot(detailPage, senarioName, '4. Action 저장 확인');

  await detailPage.close();
});
