import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function login(page: Page, username: string, password: string) {
  const inputId = page.getByPlaceholder('ID');
  const inputPw = page.getByPlaceholder(/비밀번호|Password/);
  const buttonLogin = page.getByRole('button', { name: /로그인|Sign in/ });

  await Promise.all([
    expect(inputId).toBeVisible(),
    expect(inputPw).toBeVisible(),
    expect(buttonLogin).toBeVisible(),
  ]);

  await inputId.fill(username);
  await inputPw.fill(password);
  await expect(buttonLogin).toBeEnabled();
  await buttonLogin.click();
  await page.waitForTimeout(1000);
  const dupDialog = page.getByRole('dialog', { name: '중복 로그인 안내' });
  if (await dupDialog.count()) {
    const confirmBtn = dupDialog.getByRole('button', { name: 'confirm-button' });
    await expect(confirmBtn).toBeVisible();
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();
    // dialog가 사라질 때까지 대기(선택)
    await expect(dupDialog).toBeHidden();
  }
  // await page.waitForURL((url) => url.pathname.includes('/screening/screened'));
  // await expect(page).toHaveURL(/\/screening\/screened/);

}
