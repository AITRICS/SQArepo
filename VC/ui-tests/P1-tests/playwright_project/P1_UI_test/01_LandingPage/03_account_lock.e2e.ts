import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { createAccount } from '../../playwright/fixture/account.js';
import { createUser} from '../../playwright/fixture/apiHelper.js';
import { logout } from '../../playwright/fixture/logout.js';
import { executeQuery,closeConnection } from '../../playwright/fixture/setDatabase.js';

test.describe.configure({ mode: 'serial' });
dotenv.config();

const userID = process.env.USERID || 'defaultUser';
const userPW = process.env.USERPW || 'defaultPass!';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const managerID = process.env.MANAGERID || 'defaultManager'
const managerPW = process.env.MANAGERPW || 'defaultManager!'

const senarioName = 'TC_002_001 Landing Page/[03.권한별 계정 잠금]'

const loginFailMessage = 'ID 또는 비밀번호를 확인해 주세요.'
const noActiveMessage = '관리자의 승인 후 로그인이 가능합니다.'
const lockMessage_admin = '5회 이상 로그인 오류로 접속이 제한됩니다. 회사로 계정잠금 해제를 요청하세요.'
const lockMessage = '5회 이상 로그인 오류로 접속이 제한됩니다. 관리자에게 임시비밀번호를 발급 받은 후 다시 시도해 주세요.'

const accounts = [
  {id: adminID, pw: adminPW, name: 'admin', lockMessage: loginFailMessage},
  {id: managerID, pw: managerPW, name: 'manager', lockMessage: lockMessage},
  {id: userID, pw: userPW, name: 'member', lockMessage: lockMessage},
]

const loginAttempts = 5 //로그인 시도 횟수

test.beforeEach(async ({page}) => {
  await page.goto('/ko/login')
  await page.waitForTimeout(1000);
});

test.beforeAll(async () => {
  const query = `SELECT * FROM accounts_user WHERE username = '${userID}'`;
  const rows = await executeQuery(query);

  if (rows.length === 0) {
    console.log(`${userID} 계정 없음 -> API로 생성`);
    const res = await createUser({
      username: userID,
      password: userPW,
      name: 'p1nora',      
      phone: '000',
      userType: 'Physician',
      userGroup: 'RRT',
    });
  }else{
    console.log(`${userID} 계정 이미 있음}`);
  }
  await executeQuery(`UPDATE accounts_user SET incorrect_password_tries = 0 WHERE username = '${userID}'`); //오류 횟수 초기화
});

/**
 * 미등록 계정 로그인 실패 확인
 */
test('(미등록) 로그인 실패 메세지 확인', async({ page }) => {
  for (let attempt = 1; attempt <= loginAttempts; attempt++){
    await login(page, 'qwer', 'qwer');
    await expect(page.getByText(loginFailMessage)).toBeVisible({ timeout: 5000 });
    console.log(`✅ 미등록 계정 로그인 시도 ${attempt}: 로그인 실패 확인`);
    
    if (attempt === loginAttempts) {
      await screenShot(page, senarioName, '1. 미등록 계정 로그인 5회 시도');
    }
    
    await page.waitForTimeout(3000);
  }
});


/**
 * 권한별 계정 잠금 확인
 */
test('권한별 계정 잠금 메세지 확인', async({ page }) => {
  await executeQuery(`UPDATE accounts_user SET incorrect_password_tries = 0 WHERE username IN('${userID}','${managerID}','${adminID}');`); //권한별 오류 횟수 초기화
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    for (let attempt = 1; attempt <= loginAttempts; attempt++) {
      await login(page, account.id, 'qwer'); // 로그인 시도
      await page.waitForTimeout(1000);

      if (attempt === loginAttempts-1) {// 4번째까지 로그인 실패 메시지 확인
        await expect(page.getByText(loginFailMessage)).toBeVisible({ timeout: 5000 });
        await screenShot(page, senarioName, `${i + 2}. ${account.name} 계정 로그인 실패 토스트 메세지`);
        console.log(`✅ ${account.name} 계정 로그인 실패 확인`);
      }
      else if (attempt === loginAttempts) {// 5번째 시도에서는 계정 잠김 메시지 확인 (Admin 계정은 다른 메시지)
        await expect(page.getByText(account.lockMessage)).toBeVisible({ timeout: 5000 });
        await screenShot(page, senarioName, `${i + 5}. ${account.name} 계정 로그인 실패 5회 계정 잠김 토스트 메세지`);
        console.log(`✅ ${account.name} 계정 잠김 토스트 메세지`);
      }
    }
  }
});

/**
 * 권한별 잠긴 계정 확인
 */
test('권한별 잠긴 계정 로그인 확인', async({ page }) => {
  await executeQuery(`UPDATE accounts_user SET incorrect_password_tries = 5 WHERE username IN('${userID}','${managerID}','${adminID}');`); //권한별 잠금 설정
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    await login(page, account.id, account.pw); // 로그인 시도
    await page.waitForTimeout(1000);
    if (account.id === adminID) {
      await expect(page).toHaveURL(/\/screening\/screened/);
      await screenShot(page, senarioName, `${i + 8}. ${account.name} 계정 안잠김 확인`);
      console.log(`✅ ${account.name} 계정 안잠김 확인`);
      await logout(page, account.id);
      await page.waitForTimeout(1000);
    } else {
      await expect(page.getByText(account.lockMessage)).toBeVisible({ timeout: 5000 });
      await screenShot(page, senarioName, `${i + 8}. ${account.name} 계정 잠김 확인`);
      console.log(`✅ ${account.name} 계정 잠김 확인`);
    }
  }
});

test.afterAll(async ({}) => {
    await closeConnection();
  });