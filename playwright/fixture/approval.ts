import { Page,expect } from '@playwright/test';

export async function approval(page: Page, loginuser: string, username: string) {
  await page.getByRole('button', { name: `${loginuser} dropdown-arrow` }).click();
  await page.getByText('설정').click();
  await page.getByText('멤버 관리').click();
  let found = false;
  let previousRowCount = 0;

  while (true) {
    const rows = await page.locator('table tbody tr').all();
    const currentRowCount = rows.length;

    for (const row of rows){
      const firstCell = row.locator('td:first-of-type');
      const text = await firstCell.textContent();

      if (text?.trim() === username){
        await row.locator('td:nth-child(4) button').click();
        found = true;
        break;
      }
    }
    if (found) break; 
    
    const lastRow = page.locator('table tbody tr:last-child');
    if (await lastRow.count() > 0) {
      await lastRow.scrollIntoViewIfNeeded();
    }

    previousRowCount = currentRowCount;
  }

  if (!found) {
    console.log(`❌ ${username} 계정을 찾을 수 없습니다.`);
  }

  expect(found).toBeTruthy();
}
