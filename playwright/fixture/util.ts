import type { Page } from '@playwright/test';

export function escapeRegExp(string: string) {
  // $&는 매칭된 전체 문자열을 의미
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getRegExForClassList(classList: string[]) {
  // 정규표현식 생성
  const pattern = classList.map((cls) => `(?=.*(^|\\s)${escapeRegExp(cls)}($|\\s))`).join('');

  return new RegExp(`^${pattern}.*$`);
}

export async function saveStorageState(page: Page, fileName: string, use: (page: Page) => Promise<void>) {
  await page.context().storageState({ path: fileName });
  await use(page);
  await page.context().close();
}

export async function isModalOpen(page: Page): Promise<boolean> {
  const modal = page.locator('div[role="dialog"], .modal, .popup, [id*="modal"], [class*="modal"]');
  return await modal.isVisible(); // 모달이 보이면 true, 아니면 false 반환
}

export async function isModalClosed(page: Page): Promise<boolean> {
  const modal = page.locator('div[role="dialog"], .modal, .popup, [id*="modal"], [class*="modal"]');
  return await modal.isHidden(); // 모달이 안 보이면 true 반환
}

