// import type { Page } from '@playwright/test';
import { expect, Page, Locator } from '@playwright/test';

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

export async function isModalClosed(page: Page, timeout = 5000): Promise<boolean> {
  const modal = page.locator('div[role="dialog"], .modal, .popup, [id*="modal"], [class*="modal"]');
  // return await modal.isHidden(); // 모달이 안 보이면 true 반환
  try {
    await modal.waitFor({ state: 'hidden', timeout });
    return true; // 모달 닫힘
  } catch {
    return false; // 모달 안 닫힘
  }
}


export async function waitModalClosed(page: Page, timeout = 5000): Promise<void> {
  // 마지막 dialog(가장 최근에 열린 모달)을 잡는다
  const dialog = page.locator('div[role="dialog"], .modal, .popup, [id*="modal"], [class*="modal"]').last();
  await expect(dialog).toBeHidden({ timeout });
}

export async function findUserInMemberTable(
  page: Page,
  userId: string
): Promise<Locator> {

  // ✅ Selenium에서 rows로 쓰던 div 리스트
  const rows = page.locator(
    'xpath=/html/body/div[2]/div/div[2]/div/div[3]/div/div[2]/div'
  );

  const maxLoops = 150;

  for (let loop = 0; loop < maxLoops; loop++) {

    const rowCount = await rows.count();
    if (rowCount === 0) {
      await page.waitForTimeout(300);
      continue;
    }

    // 🔹 Selenium의 div[15] → nth(14)
    const scrollTarget =
      rowCount > 14 ? rows.nth(14) : rows.nth(rowCount - 1);

    await scrollTarget.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // 🔹 현재 렌더된 row들 검사
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const firstCell = row.locator('xpath=./div[1]');
      const text = (await firstCell.textContent())?.trim();

      if (text === userId) {
        await row.scrollIntoViewIfNeeded();
        return row;   // 🔥 여기까지 와야 성공
      }
    }
  }

  throw new Error(`❌ 멤버 테이블에서 ${userId} 를 찾지 못함`);
}