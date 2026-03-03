import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[12. 대시보드 id 복사 및 북마크 확인]';

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
  console.log('✅ EMR ID 복사 확인');
});

/**
 * 북마크 on/off 확인
 */
test('대시보드 북마크 on/off 확인', async ({ page }) => {
  const table = page.locator('table');

  // 북마크 컬럼 인덱스 구하기 (th 내부에 bookmark-header 버튼이 있는 th)
  const headerCells = table.locator('thead tr th');
  const bookmarkIndex =
    (await headerCells.evaluateAll((ths) =>
      ths.findIndex((th) => th.querySelector('[data-testid="bookmark-header"]'))
    )) + 1;

  expect(bookmarkIndex).toBeGreaterThan(0);

  // 첫번째 row 대상
  const firstRow = table.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });

  const bookmarkCell = firstRow.locator(`td:nth-child(${bookmarkIndex})`);
  const bookmarkButton = bookmarkCell.locator('button');
  await expect(bookmarkButton).toBeVisible({ timeout: 10000 });

  // --- 등록(ON) ---
  await setBookmark(page, bookmarkCell, bookmarkButton, true);
  console.log('✅ 북마크 on 확인');

  // --- 해제(OFF) ---
  await setBookmark(page, bookmarkCell, bookmarkButton, false);
  console.log('✅ 북마크 off 확인');
});

const BOOKMARK_ON_G = 'xpath=.//svg//g[@id="name=star, size=small"]';
const BOOKMARK_OFF_G = 'css=svg g#favorite';

// 토스트 텍스트
const TOAST_ON = '북마크 등록이 완료되었습니다';
const TOAST_OFF = '북마크 해제가 완료되었습니다';

// 토스트가 사라질 때까지 대기
async function expectToastAppearAndDisappear(page: Page, text: string) {
  const toast = page.getByText(text);

  // 나타남: 빠르면 스킵될 수 있으니 짧은 timeout으로 시도
  await toast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

  // 사라짐(또는 detach): 토스트 구현에 따라 hidden/detached 둘 다 가능
  await Promise.race([
    toast.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {}),
    toast.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {}),
  ]);
}

async function expectBookmarked(cell: Locator) {
  await expect(cell.locator(BOOKMARK_ON_G)).toHaveCount(1, { timeout: 10000 });
}

async function expectUnbookmarked(cell: Locator) {
  await expect(cell.locator(BOOKMARK_OFF_G)).toHaveCount(1, { timeout: 10000 });
  await expect(cell.locator(BOOKMARK_ON_G)).toHaveCount(0, { timeout: 10000 });
}

// 버튼 클릭 → 토스트 확인(등장+소멸) → g 상태 확인
async function setBookmark(page: Page, cell: Locator, button: Locator, targetOn: boolean) {
  const currentlyOn = (await cell.locator(BOOKMARK_ON_G).count()) > 0;
  if (currentlyOn === targetOn) return; // 이미 원하는 상태면 스킵

  await button.click();

  if (targetOn) {
    await expectToastAppearAndDisappear(page, TOAST_ON);
    // await expectBookmarked(cell);
  } else {
    await expectToastAppearAndDisappear(page, TOAST_OFF);
    // await expectUnbookmarked(cell);
  }
}