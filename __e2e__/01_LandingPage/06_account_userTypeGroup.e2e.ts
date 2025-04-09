import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { createAccount } from '../../playwright/fixture/account.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
import { approval } from '../../playwright/fixture/approval.js';
import { isModalOpen,isModalClosed } from '../../playwright/fixture/util.js';


dotenv.config();

const userID = process.env.USERID || 'defaultUser';
const userPW = process.env.USERPW || 'defaultPass!';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[06.사용자 유형, 소속 선택]'

test.beforeEach(async ({page}) => {
  await page.goto('/ko/login')
});

test.beforeAll(async ({page}) => {
  const query = `SELECT * FROM accounts_user WHERE username = '${userID}'`;
  const rows = await executeQuery(query);

  if (rows.length === 0) {
    console.log(`${userID} 계정 생성`);
    await createAccount(page, userID, userPW) //nora010 없으면 생성
    await login(page,adminID,adminPW);
    await approval(page,adminID,userID); //nora010 계정 승인
  }else{
    console.log(`${userID} 계정 이미 있음`);
    await executeQuery(`UPDATE accounts_user SET is_active = 1 WHERE username = '${userID}';`); // nora010 계정 승인
  }
});


/**
 * 사용자 유형, 소속 확인
 */
test('사용자 유형/소속 미선택 계정 확인', async({ page }) => {
    await executeQuery(`DELETE FROM accounts_user_info WHERE user_id = (SELECT id FROM accounts_user WHERE username = '${userID}');`) // 사용자 유형/소속 삭제
    await login(page,userID,userPW);
    await page.waitForTimeout(2000);
    let loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000});
    const modalOpened = await isModalOpen(page);
    expect(modalOpened).toBe(true);
    await screenShot(page,senarioName,'사용자 유형,소속 선택 모달 오픈');
    console.log(`✅ 사용자 유형/소속 선택 모달 오픈`);

    await page.locator('div').filter({ hasText: /^사용자 유형선택의사간호사비의료진$/ }).getByRole('combobox').click();
    await screenShot(page,senarioName,'사용자 유형 드롭다운 리스트 확인');
    console.log(`✅ 사용자 유형 리스트 확인`);

    await page.locator('div').filter({ hasText: /^사용자 소속선택일반병동중환자실RRT기타$/ }).getByRole('combobox').click();
    await screenShot(page,senarioName,'사용자 소속 드롭다운 리스트 확인');
    console.log(`✅ 사용자 소속 리스트 확인`);

    await page.locator('div').filter({ hasText: /^사용자 유형선택의사간호사비의료진$/ }).getByRole('combobox').click();
    await page.getByRole('option', { name: '의사' }).click(); 
    await page.getByRole('combobox').filter({ hasText: '선택' }).click();
    await page.getByRole('option', { name: '일반병동' }).click(); 
    await screenShot(page,senarioName,'사용자 유형,소속 선택 확인');
    console.log(`✅ 사용자 소속 선택 확인`);

    await page.getByRole('button', { name: '확인' }).click();
    await page.waitForTimeout(2000);
    let modalClosed = await isModalClosed(page); //모달 미노출 확인
    expect(modalClosed).toBe(true);
    await page.getByRole('button', { name: `${userID} dropdown-arrow` }).click();
    await page.getByText('설정').click();
    await page.waitForTimeout(2000);
    await expect(page.getByText('사용자 유형의사')).toBeVisible();
    await expect(page.getByText('사용자 소속일반병동')).toBeVisible();
    await screenShot(page,senarioName,'사용자 유형,소속 설정 확인');
    console.log(`✅ 사용자 소속 설정 확인`);

    await logout(page,userID);
    await page.waitForTimeout(2000);
    await login(page,userID,userPW);
    await page.waitForTimeout(2000);
    loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000});
    modalClosed = await isModalClosed(page); //모달 미노출 확인
    expect(modalClosed).toBe(true);
    await screenShot(page,senarioName,'사용자 유형,소속 설정 후 로그인 확인');
    console.log(`✅ 사용자 소속 설정 후 로그인 확인`);

});

/**
 * 관리자가 사용자 유형, 소속 선택 후 로그인 확인
 */
test('관리자 사용자 유형/소속 선택 후 로그인 확인', async({ page }) => {
    await executeQuery(`DELETE FROM accounts_user_info WHERE user_id = (SELECT id FROM accounts_user WHERE username = '${userID}');`) // 사용자 유형/소속 삭제
    await login(page,adminID,adminPW);
    await page.waitForTimeout(2000);
    let loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000});
    await page.getByRole('button', { name: `${adminID} dropdown-arrow` }).click();
    await page.getByText('설정').click();
    await page.getByText('멤버 관리').click();
    await page.waitForTimeout(2000);

    let found = false;
    let previousRowCount = 0;
  
    while (true) {
        const rows = await page.locator('table tbody tr').all();
        const currentRowCount = rows.length;
      
        for (const row of rows) {
          const firstCell = row.locator('td:first-of-type');
          const text = await firstCell.textContent();
      
          if (text?.trim() === userID) {
            await row.locator('td:nth-child(3)').click(); // 행 클릭 (다이얼로그 열기)
            found = true;
            break;
          }
        }
      
        if (found) {
          // 다이얼로그 등장 기다리기
          const dialog = page.getByRole('dialog', { name: '멤버 정보' });
          await expect(dialog).toBeVisible();
          await page.waitForTimeout(2000);

          // 사용자 유형 선택 (의사)
          await dialog
            .locator('div')
            .filter({ hasText: /^선택의사간호사비의료진$/ })
            .getByRole('combobox')
            .click();
          await page.getByRole('option', { name: '의사' }).click();
      
          // 병동 선택 (일반병동)
          await page.getByRole('combobox').filter({ hasText: '선택' }).click();
          await page.getByRole('option', { name: '일반병동' }).click();
      
          // 저장 & 닫기
          await page.getByRole('button', { name: '저장' }).click();
          await page.getByRole('button', { name: 'Close' }).click();
      
          break;
        }
      
        const lastRow = page.locator('table tbody tr:last-child');
        if (await lastRow.count() > 0) {
          await lastRow.scrollIntoViewIfNeeded();
        }
      
        previousRowCount = currentRowCount;
      }
    await logout(page,adminID);
    await page.waitForTimeout(2000);
    await login(page,userID,userPW);
    await page.waitForTimeout(2000);
    loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000});
    const modalClosed = await isModalClosed(page); //모달 미노출 확인
    expect(modalClosed).toBe(true);
    await screenShot(page,senarioName,'관리자 사용자 유형,소속 설정 후 로그인 확인');
    console.log(`✅ 관리자 사용자 소속 설정 후 로그인 확인`);

});

test.afterAll(async ({}) => {
    await closeConnection();
  });