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

  // await page.waitForURL((url) => url.pathname.includes('/screening/screened'));
  // await expect(page).toHaveURL(/\/screening\/screened/);
}
