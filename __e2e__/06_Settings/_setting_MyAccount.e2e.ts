import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { createAccount } from '../../playwright/fixture/account.js';
import { approval } from '../../playwright/fixture/approval.js';

dotenv.config();

const senarioName = '[. 내 계정 정보 변경]';

const accounts = [
    {
      role: 'user',
      id: process.env.USERID || 'memnora',
      pw: process.env.USERPW || 'aitrics1!',
      requiresCreation: true, // user 계정은 테스트 전에 생성 필요
    },
    {
      role: 'manager',
      id: process.env.MANAGERID || 'manora',
      pw: process.env.MANAGERPW || 'aitrics1!',
    },
    {
      role: 'admin',
      id: process.env.ADMINID || 'nora01',
      pw: process.env.ADMINPW || 'aitrics1!',
    },
];
  
// 유틸: 랜덤 비밀번호 생성
const newPW = 'aitrics1!!'; 

// 유틸: 비밀번호 변경 함수
async function changePassword(page, oldPW, newPW) {
    await page.getByText('설정').click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: '비밀번호 변경' }).click();
    await page.getByRole('textbox', { name: '현재 비밀번호' }).fill(oldPW);
    await page.getByRole('textbox', { name: /25자 이내/ }).fill(newPW);
    await page.getByRole('textbox', { name: '비밀번호 확인' }).fill(newPW);
    await page.getByRole('button', { name: '저장' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('비밀번호를 변경했습니다.')).toBeVisible();
}


const runTestsFor = (account) => {
    test.describe(`${account.role} 계정 테스트`, () => {
        test.beforeAll(async ({ browser  }) => {
            if (account.requiresCreation) {
                const page = await browser.newPage();
                await page.goto('/ko/login');
                await createAccount(page, account.id, account.pw);
                await login(page, process.env.ADMINID, process.env.ADMINPW);
                await approval(page, process.env.ADMINID, account.id);
                await logout(page, process.env.ADMINID);
                await page.close();
            }
          });
        test(`전화번호 변경`, async ({ page }) => {
            await page.goto('/ko/login');
            await login(page, account.id, account.pw);
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: `${account.id} dropdown-arrow` }).click();
            await page.waitForTimeout(1000);
            await page.getByText('설정').click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: '핸드폰 번호 변경' }).click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: '저장' }).click();
            await page.waitForTimeout(1000);
            await expect(page.getByText('핸드폰 번호를 변경했습니다')).toBeVisible();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: '핸드폰 번호 변경' }).click();
            await page.waitForTimeout(1000);
            const phone = Math.floor(Math.random() * 1e12).toString();
            await page.getByRole('textbox', { name: /자 이내 입력 가능/ }).fill(phone);
            await page.getByRole('button', { name: '저장' }).click();
            await page.waitForTimeout(1000);
            await expect(page.getByText('핸드폰 번호를 변경했습니다')).toBeVisible();
            await page.waitForTimeout(1000);
            await expect(page.getByText(phone)).toBeVisible();
            await logout(page, account.id);
        });

        test(`비밀번호 변경 후 복원`, async ({ page }) => {
            await page.goto('/ko/login');
            await login(page, account.id, account.pw);
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: `${account.id} dropdown-arrow` }).click();
            await page.waitForTimeout(1000);
            await changePassword(page, account.pw, newPW);
            await page.waitForTimeout(1000);
            await logout(page, account.id);
            await page.waitForTimeout(1000);

            await login(page, account.id, newPW);
            await page.waitForTimeout(1000);
            await expect(page).toHaveURL(/screening\/screened$/);

            // 비밀번호 되돌리기
            await page.getByRole('button', { name: `${account.id} dropdown-arrow` }).click();
            await page.waitForTimeout(1000);
            await changePassword(page, newPW, account.pw);
            await page.waitForTimeout(1000);
            await logout(page, account.id);
            await page.waitForTimeout(1000);
        });
    });
};

runTestsFor(accounts[0]); // user
runTestsFor(accounts[1]); // manager
runTestsFor(accounts[2]); // admin