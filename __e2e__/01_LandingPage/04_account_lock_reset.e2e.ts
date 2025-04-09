import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { createAccount } from '../../playwright/fixture/account.js';
import { executeQuery,closeConnection } from '../../playwright/fixture/setDatabase.js';
import { approval } from '../../playwright/fixture/approval.js';


dotenv.config();

const userID = process.env.USERID || 'defaultUser';
const userPW = process.env.USERPW || 'defaultPass!';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const managerID = process.env.MANAGERID || 'defaultManager'
const managerPW = process.env.MANAGERPW || 'defaultManager!'

const senarioName = '[04. 권한별 계정 오류 횟수 초기화]'

const loginFailMessage = 'ID 또는 비밀번호를 확인해주세요.'

const accounts = [
  {id: userID, pw: userPW, name: 'User'},
  {id: managerID, pw: managerPW, name: 'Manager', },
  {id: adminID, pw: adminPW, name: 'Admin'}
]

const loginAttempts = 4 //로그인 시도 횟수

test.beforeEach(async ({page}) => {
  test.setTimeout(60000);
  await page.goto('/ko/login')
});

test.beforeAll(async ({page}) => {
  const query = `SELECT * FROM accounts_user WHERE username = '${userID}'`;
  const rows = await executeQuery(query);

  if (rows.length === 0) {
    console.log(`${userID} 계정 생성`);
    await createAccount(page, userID, userPW) //nora010 없으면 생성
    await approval(page,adminID,userID); //nora010 계정 승인
  }else{
    console.log(`${userID} 계정 이미 있음`);
    await executeQuery(`UPDATE accounts_user SET is_active = 1 WHERE username = '${userID}';`); // nora010 계정 승인
    await executeQuery(`UPDATE accounts_user SET incorrect_password_tries = 0 WHERE username IN('${userID}','${managerID}','${adminID}');`); //권한별 오류 횟수 초기화
    
  }
});

/** 
 * 권한별 계정 오류 횟수 초기화
 */
test('권한별 계정 오류 횟수 초기화', async({ page }) => {
  for (const account of accounts){ 
    for (let attempt = 1; attempt <= loginAttempts; attempt++) {
      await login(page, account.id, 'qwer'); // 로그인 오류 횟수 4회
      await page.waitForTimeout(2000);
      await expect(page.getByText(loginFailMessage)).toBeVisible({ timeout: 5000 });
    }
    await login(page, account.id, account.pw); // 정상 로그인 (오류 횟수 초기화)
    await page.waitForTimeout(2000);
    await logout(page,account.id);
    await login(page,account.id, 'qwer'); //로그인 시도
    await page.waitForTimeout(2000);
    await expect(page.getByText(loginFailMessage)).toBeVisible({ timeout: 5000 });
    await screenShot(page, senarioName,`${account.name} 계정 오류 횟수 초기화 확인`);
    console.log(`✅ ${account.name} 계정 로그인 오류 횟수 초기화 확인`);
  }
});

test.afterAll(async ({}) => {
    await closeConnection();
  });