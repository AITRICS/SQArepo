import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { useTokenApi } from '../../playwright/fixture/apiHelper.js';


dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[. 대시보드 설정 확인]';


test.beforeEach(async ({page}) => {
    test.setTimeout(0);
    await page.goto('/ko/login')
    await login(page,adminID,adminPW);
    await page.waitForTimeout(2000);
    const loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기

    await page.getByRole('button', { name: `${adminID} dropdown-arrow` }).click();
    await page.waitForTimeout(1000);
    await page.getByText('설정').click();
    await page.waitForTimeout(1000);

    await page.getByText('대시보드 설정').click(); // 제품정보 화면 진입
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/settings\/dashboard-setting$/);
});


const items = [
    'Bookmark', 'Status', 'Patient info', 'Location',
    'Dept', 'Physician', 'Note', 'Screened type', 'Date/Time',
    'CAPS', 'MAES', 'SEPS', 'MORS', 'NEWS', 'MEWS',
    'SBP', 'DBP', 'PR', 'RR', 'BT', 'SpO2'
];
const noToggle = ['Status', 'Patient info', 'Screened type', 'Date/Time'];
const withChangeCheckbox = ['CAPS', 'MAES', 'SEPS', 'MORS'];
const unpurchased = ['SEPS', 'MORS'];

test('대시보드 설정 구성 확인', async ({ page }) => {
    await expect(page.getByText('AITRICS-Score는 한 개 이상 On')).toBeVisible();
    await expect(page.getByText('설정 저장 후, 변경 사항 적용을 위해')).toBeVisible();

    for (const item of items) {

        const row = page.locator('div.relative').filter({ hasText: item });

        await expect(row.getByText(item,{exact: true})).toBeVisible();

        // 드래그 아이콘 존재
        await expect(row.locator('img[alt="drag-icon"]')).toBeVisible();
      
        // ✅ 스위치 있는 항목만 확인
        
        if (!noToggle.includes(item)) {
        await expect(row.getByRole('switch')).toBeVisible();
        }
      
        // ✅ 변동값 표시 체크박스 있는 항목만 확인
        if (withChangeCheckbox.includes(item)) {
            await expect(row.getByRole('checkbox', { name: '변동값 표시' })).toBeVisible();
          }
    }

    const actualOrder = await page.locator('div.my-auto').allTextContents();
    expect(actualOrder.map(t => t.trim())).toEqual(items);

    await expect(page.getByRole('button', { name: '저장' })).toBeDisabled();
    await expect(page.getByRole('button', { name: '초기화' })).toBeVisible();
});

// test('대시보드 설정 컬럼 순서 변경', async ({ page }) => {
//     // 1. 현재 항목 순서 저장
//     const labelLocator = page.locator('div.my-auto');
//     const dragLocator = page.locator('img[alt="drag-icon"]');
//     const originalOrder = await labelLocator.allTextContents();


//     console.log('🔹 원래 순서:', originalOrder);

//     // 2. 항목 역순으로 드래그 (맨 아래에서 맨 위로 하나씩 끌어올림)
//     for (let i = originalOrder.length - 1; i >= 0; i--) {
//         const item = originalOrder[i].trim();
//         console.log(`↪️ [${item}] 항목을 0번째 위치로 이동`);
//         const from = page.locator('img[alt="drag-icon"]').nth(0); // 항상 맨 위
//         const to = page.locator('img[alt="drag-icon"]').nth(items.length - i - 1); // 맨 아래부터 위로
//         await from.dragTo(to); // 맨 위 항목을 맨 아래로 보내기
//         await page.waitForTimeout(1000);
//     }

//     // 3. UI 상 순서가 역순으로 바뀌었는지 확인
//     const reversedOrder = await labelLocator.allTextContents();
//     const expected = [...originalOrder].reverse();
//     expect(reversedOrder.map(t => t.trim())).toEqual(expected);
//     console.log('✅ UI에서 순서 역순 적용됨');

//     // 4. 저장 버튼 클릭
//     const saveButton = page.getByRole('button', { name: '저장' });
//     await expect(saveButton).toBeEnabled();
//     await saveButton.click();
//     await page.waitForTimeout(1000); 

//      // 5. 페이지 리로드
//     await page.reload();
//     await page.waitForLoadState('domcontentloaded');
    
//     // 6. 리로드 후 순서 다시 확인
//     const reloadedOrder = await labelLocator.allTextContents();
//     expect(reloadedOrder.map(t => t.trim())).toEqual(expected);
//     console.log('✅ 리로드 후에도 순서 유지 확인 완료');

// });



test('대시보드 on/off 확인', async ({ page }) => {
    const adminScoreURL = `${process.env.API_BASE}${process.env.ADMIN_SCORE}`;
    const scorebody = {
        CAPS: true,
        MAES: true,
        SEPS: false,
        MORS: false,
    };
    await useTokenApi(adminScoreURL,scorebody)
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    //구매 스코어 CAPS, MAES 확인 및 토글 ON 상태 확인
    for (const item of items) {
        if (noToggle.includes(item) || unpurchased.includes(item)) {
            continue;
          }
        const row = page.locator('div.relative').filter({ hasText: item });
        await expect(row.getByText(item, { exact: true })).toBeVisible();

        const toggle = row.getByRole('switch');
        await expect(toggle).toBeVisible();
        await expect(toggle).toBeChecked(); // ON 상태 확인

        // ON → OFF → 다시 ON 동작 확인
        await toggle.click();
        await page.waitForTimeout(1000);
        await expect(toggle).not.toBeChecked();

        await toggle.click();
        await page.waitForTimeout(1000);
        await expect(toggle).toBeChecked();
    }

    //미구매 스코어 SEPS, MORS는 표시되지 않아야 함
    for (const score of unpurchased) {
        const row = page.locator('div.relative').filter({ hasText: score });
        await expect(row).toHaveCount(0); // 완전 미노출
    }
});

test.afterEach(async () => {
    const adminScoreURL = `${process.env.API_BASE}${process.env.ADMIN_SCORE}`;
    const scoreBody = {
      CAPS: true,
      MAES: true,
      SEPS: true,  // 다시 구매 상태로 되돌림
      MORS: true,  // 다시 구매 상태로 되돌림
    };
  
    await useTokenApi(adminScoreURL, scoreBody);

    const dashboardResetURL = `${process.env.API_BASE}${process.env.DASHBOARD_RESET}`;
    await useTokenApi(dashboardResetURL, {});

  });
