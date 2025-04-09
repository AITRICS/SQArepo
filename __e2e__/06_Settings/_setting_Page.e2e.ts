import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { createAccount } from '../../playwright/fixture/account.js';
import { approval } from '../../playwright/fixture/approval.js';

dotenv.config();

const senarioName = '[. 설정 페이지 확인]';

const accounts = [
    {
      role: 'user',
      id: process.env.USERID || 'memnora',
      pw: process.env.USERPW || 'aitrics1!',
      expectedMenus: ['내 계정', '시간대 설정', '대시보드 설정', '제품 정보'],
      requiresCreation: true, // user 계정은 테스트 전에 생성 필요
    },
    {
      role: 'manager',
      id: process.env.MANAGERID || 'manora',
      pw: process.env.MANAGERPW || 'aitrics1!',
      expectedMenus: [
        '내 계정',
        '시간대 설정',
        '병원 정보 관리',
        '멤버 관리',
        '알람기준 설정',
        '대시보드 설정',
        '접속기록 조회',
        '제품 정보',
      ],
    },
    {
      role: 'admin',
      id: process.env.ADMINID || 'nora01',
      pw: process.env.ADMINPW || 'aitrics1!',
      expectedMenus: [
        '내 계정',
        '시간대 설정',
        '병원 정보 관리',
        '멤버 관리',
        '알람기준 설정',
        '대시보드 설정',
        '접속기록 조회',
        '제품 정보',
      ],
    },
];

test.describe('[설정 페이지 진입 및 메뉴 확인]', () => {
    for (const account of accounts) {
        test(`계정: ${account.role} - 설정 메뉴 확인`, async ({ page }) => {
            // user 계정인 경우 생성
            if (account.requiresCreation) { 
                await createAccount(page, account.id, account.pw);
                await login(page, process.env.ADMINID,process.env.ADMINPW);
                await approval(page,process.env.ADMINID,account.id); // 계정 승인
                await logout(page,process.env.ADMINID);
            }

            // 로그인
            await page.goto('/ko/login');
            await login(page, account.id, account.pw);
            await page.waitForTimeout(2000);

            const loadingLocator = page.locator('.absolute').first();
            await expect(loadingLocator).not.toBeVisible({ timeout: 10000 });

            // 드롭다운 클릭 및 메뉴 확인
            await page.getByRole('button', { name: `${account.id} dropdown-arrow` }).click();
            await page.waitForTimeout(1000);

            await expect(page.getByText('설정')).toBeVisible();
            await expect(page.getByText('로그아웃')).toBeVisible();

            const logoutColor = await page.locator('text=로그아웃').evaluate((el) => {
                return window.getComputedStyle(el).color;
            });
            expect(logoutColor).toBe('rgb(255, 65, 51)');

            // 설정 페이지 이동
            await page.getByText('설정').click();
            await page.waitForTimeout(1000);
            await expect(page).toHaveURL(/\/ko\/settings\/account$/);

            // SNB 메뉴 확인
            for (const menu of account.expectedMenus) {
                const locator = page.getByRole('listitem').filter({ hasText: menu });
                await expect(locator).toBeVisible();
            }

            // 로그아웃
            await logout(page, account.id);
            await page.waitForTimeout(2000);
        });
    }
});




















// const adminID = process.env.ADMINID || 'defaultAdmin'
// const adminPW = process.env.ADMINPW || 'defaultAdmin!'

// const senarioName = '[. 설정 페이지 진입]';

// test.beforeEach(async ({page}) => {
//   test.setTimeout(0);
//   await page.goto('/ko/login')
//   await login(page,adminID,adminPW);
//   await page.waitForTimeout(2000);
//   const loadingLocator = page.locator('.absolute').first();
//   await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
// });


// test('사용자 메뉴 확인', async ({ page }) => {
//     await page.getByRole('button', { name: `${adminID} dropdown-arrow` }).click(); //user menu 확인
//     await page.waitForTimeout(1000);

//     await expect(page.getByText('설정')).toBeVisible(); //설정 버튼 확인
//     await expect(page.getByText('로그아웃')).toBeVisible(); // 로그아웃 버튼 확인
//     const logoutColor = await page.locator('text=로그아웃').evaluate((el) => {
//         return window.getComputedStyle(el).color;      
//     });
//     expect(logoutColor).toBe('rgb(255, 65, 51)'); //로그아웃 버튼 색 확인

//     await page.getByText('설정').click(); // 설정 클릭
//     await page.waitForTimeout(1000);
//     await expect(page).toHaveURL(/\/ko\/settings\/account$/);

//     const settingsMenuItems = [
//         '내 계정',
//         '시간대 설정',
//         '병원 정보 관리',
//         '멤버 관리',
//         '알람기준 설정',
//         '대시보드 설정',
//         '접속기록 조회',
//         '제품 정보'
//     ];

//     for (const item of settingsMenuItems) {
//     await expect(page.getByRole('listitem', { name: item })).toBeVisible();
//     }
// });