import { test, expect } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import { createAccount } from '../playwright/fixture/account.js';
import globalSetup from '../playwright/fixture/globalSetup.js';
import { executeQuery,closeConnection } from '../playwright/fixture/setDatabase.js';


dotenv.config();

const userID = process.env.USERID || 'defaultUser';
const userPW = process.env.USERPW || 'defaultPass!';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const managerID = process.env.MANAGERID || 'defaultManager'
const managerPW = process.env.MANAGERPW || 'defaultManager!'

const senarioName = '[03.권한별 계정 잠금]'

const loginFailMessage = 'ID 또는 비밀번호를 확인해주세요.'
const noActiveMessage = '관리자의 승인 후 로그인이 가능합니다.'
const lockMessage_admin = '5회 이상 로그인 오류로 접속이 제한됩니다. 회사로 계정잠금 해제를 요청하세요.'
const lockMessage = '5회 이상 로그인 오류로 접속이 제한됩니다. 관리자에게 임시비밀번호를 발급 받은 후 다시 시도해 주세요.'

const accounts = [
  {id: userID, pw: userPW, name: 'User', lockMessage: lockMessage},
  {id: managerID, pw: managerPW, name: 'Manager', lockMessage: lockMessage},
  {id: adminID, pw: adminPW, name: 'Admin', lockMessage: lockMessage_admin}
]

const loginAttempts = 5 //로그인 시도 횟수

test.beforeEach(async ({page}) => {
  test.setTimeout(60000);
  await page.goto('/ko/login')
});

test.beforeAll(async ({page}) => {
  const query = `SELECT * FROM accounts_user WHERE username = '${userID}'`;
  const rows = await executeQuery(query);

  if (rows.length === 0) {
    console.log(`${userID} 계정 생성}`);
    await createAccount(page, userID, userPW) //nora010 없으면 생성
  }else{
    console.log(`${userID} 계정 이미 있음}`);
    await executeQuery(`UPDATE accounts_user SET incorrect_password_tries = 0 WHERE username = '${userID}'`); //오류 횟수 초기화
    
  }
});

/**
 * 미등록 계정 로그인 실패 확인
 */
test('(미등록) 로그인 실패 메세지 확인', async({ page }) => {
  for (let attempt =1; attempt <= loginAttempts; attempt++){
    await login(page, 'qwer', 'qwer')  // 미등록 계정 로그인
    await page.waitForTimeout(2000);
    await expect(page.getByText(loginFailMessage)).toBeVisible({ timeout: 5000 });
    await screenShot(page,senarioName,`(미등록)로그인 시도 ${attempt}`);
    console.log(`✅ (미등록)로그인 시도 ${attempt}`);
  }
});

/**
 * 미승인 계정 로그인 실패 확인
 */
test('(미승인) 로그인 실패 메세지 확인', async({ page }) => {
  await executeQuery(`UPDATE accounts_user SET is_active = 0 WHERE username = '${userID}';`); //미승인 변경
  await login(page, userID, userPW)  // 미승인 계정 로그인
  await expect(page.getByText(noActiveMessage)).toBeVisible({ timeout: 5000 });
  await screenShot(page,senarioName,'(미승인)로그인 시도');
  console.log(`✅ (미승인)로그인 실패 토스트 메세지`);
  await executeQuery(`UPDATE accounts_user SET is_active = 1 WHERE username = '${userID}';`); //승인 변경
});

/**
 * 권한별 계정 잠금 확인
 */
test('권한별 계정 잠금 메세지 확인', async({ page }) => {
  await executeQuery(`UPDATE accounts_user SET incorrect_password_tries = 0 WHERE username IN('${userID}','${managerID}','${adminID}');`); //권한별 오류 횟수 초기화
  for (const account of accounts){ 
    for (let attempt = 1; attempt <= loginAttempts; attempt++) {
      await login(page, account.id, 'qwer'); // 로그인 시도
      await page.waitForTimeout(2000);

      if (attempt < loginAttempts) {// 4번째까지 로그인 실패 메시지 확인
        await expect(page.getByText(loginFailMessage)).toBeVisible({ timeout: 5000 });
        await screenShot(page, senarioName, `${account.name} 계정 로그인 시도 ${attempt}`);
        console.log(`✅ ${account.name} 계정 로그인 시도 ${attempt}: 로그인 실패 확인`);
      } 
      else{ // 5번째 시도에서는 계정 잠김 메시지 확인 (Admin 계정은 다른 메시지)
        await expect(page.getByText(account.lockMessage)).toBeVisible({ timeout: 5000 });
        await screenShot(page, senarioName,`${account.name} 계정 잠김 토스트 메세지`);
        console.log(`✅ ${account.name} 계정 잠김 토스트 메세지`);
      }
    }
  }
});

/**
 * 권한별 잠긴 계정 확인
 */
test('권한별 잠긴 계정 로그인 확인', async({ page }) => {
  for (const account of accounts){ 
    await login(page, account.id, account.pw); // 로그인 시도
    await page.waitForTimeout(2000);

    await expect(page.getByText(account.lockMessage)).toBeVisible({ timeout: 5000 });
    await screenShot(page, senarioName,`${account.name} 계정 잠김 확인`);
    console.log(`✅ ${account.name} 계정 잠김 확인`);
  }
});

test.afterAll(async ({page}) => {
    await closeConnection();
    await page.close();
  });