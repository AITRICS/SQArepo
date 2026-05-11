import { Page, expect } from '@playwright/test';

export async function approval(page: Page, loginuser: string, username: string) {
  // 멤버 관리 진입
  await page.getByRole('button', { name: `${loginuser} dropdown-arrow` }).click();
  await page.getByText('설정', { exact: true }).click();
  await page.getByText('멤버 관리', { exact: true }).click();

  await page.waitForTimeout(1000);

  // username 텍스트가 있는 셀 (div.truncate) → 스크롤하여 표시
  const userCell = page.locator('div.truncate').filter({ hasText: new RegExp(`^${username}$`) }).first();
  await expect(userCell).toBeAttached({ timeout: 5000 });
  await userCell.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  // 같은 행(h-[46px] ancestor)의 승인 버튼 클릭
  const row = userCell.locator('xpath=ancestor::div[contains(@class,"h-[46px]")]').first();
  const approveBtn = row.getByRole('button', { name: '승인' });
  await expect(approveBtn).toBeVisible({ timeout: 3000 });
  await approveBtn.click();
}
