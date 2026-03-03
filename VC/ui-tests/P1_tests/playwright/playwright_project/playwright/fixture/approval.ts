import { Page,expect } from '@playwright/test';
import { escapeRegExp } from './util.js';

export async function approval(page: Page, loginuser: string, username: string) {
  // 멤버 관리 진입
  await page.getByRole('button', { name: `${loginuser} dropdown-arrow` }).click();
  await page.getByText('설정', { exact: true }).click();
  await page.getByText('멤버 관리', { exact: true }).click();
  
  await page.waitForTimeout(1000);

  // 스크롤 컨테이너 (네가 지정한 XPath)
  const scrollContainer = page.locator('xpath=/html/body/div[2]/div/div[2]');
  await expect(scrollContainer).toBeVisible({ timeout: 10000 });

  // 맨 위로 초기화
  await scrollContainer.evaluate(el => { (el as HTMLElement).scrollTop = 0; });

  // ✅ username 셀 XPath (data-tooltip 기반)
  const userCellXpath = `//div[@data-tooltip="${username}"]`;

  let prevScrollTop = -1;

  while (true) {
    const userCell = page.locator(`xpath=${userCellXpath}`);

    if (await userCell.count()) {
      // row는 height 46px div (행)
      const row = page.locator(
        `xpath=${userCellXpath}/ancestor::div[contains(@class,"h-[46px]")]`
      ).first();

      await row.scrollIntoViewIfNeeded();

      // Approval 컬럼의 "승인" 클릭
      const approveBtn = row.getByRole('button', { name: '승인' });
      await expect(approveBtn).toBeVisible({ timeout: 3000 });
      await approveBtn.click();

      return;
    }

    // 못 찾았으면 아래로 스크롤
    const info = await scrollContainer.evaluate((el) => {
      const e = el as HTMLElement;
      const before = e.scrollTop;
      e.scrollTop = before + Math.floor(e.clientHeight * 0.9);
      return { after: e.scrollTop, before, max: e.scrollHeight - e.clientHeight };
    });

    // 더 이상 스크롤 안되면 종료
    if (info.after === prevScrollTop || info.after >= info.max) break;
    prevScrollTop = info.after;

    await page.waitForTimeout(50);
  }

  throw new Error(`❌ ${username} 계정을 끝까지 스크롤해도 찾지 못함`);
}
