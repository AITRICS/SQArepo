import type { Page } from '@playwright/test';

export async function logout(page: Page, loginuser:string) {
    await page.getByRole('button', { name: `${loginuser} dropdown-arrow` }).click();
    await page.getByText('로그아웃').click();
  }
  