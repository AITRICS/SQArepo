import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { createAccount } from '../../playwright/fixture/account.js';
import { executeQuery,closeConnection } from '../../playwright/fixture/setDatabase.js';
import { approval } from '../../playwright/fixture/approval.js';
import { createUser} from '../../playwright/fixture/apiHelper.js';

test.describe.configure({ mode: 'serial' });
dotenv.config();

const userID = process.env.USERID || 'defaultUser';
const userPW = process.env.USERPW || 'defaultPass!';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const managerID = process.env.MANAGERID || 'defaultManager'
const managerPW = process.env.MANAGERPW || 'defaultManager!'

const senarioName = 'TC_002_001 Landing Page/[04. 권한별 계정 오류 횟수 초기화]'

const loginFailMessage = 'ID 또는 비밀번호를 확인해 주세요.'

const accounts = [
  {id: userID, pw: userPW, name: 'Member'},
  {id: managerID, pw: managerPW, name: 'Manager', }
]

const loginAttempts = 4 //로그인 시도 횟수

test.beforeEach(async ({page}) => {
  await page.goto('/ko/login')
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
  await executeQuery(`UPDATE accounts_user SET is_active = 1 WHERE username = '${userID}';`); //계정 승인
  await executeQuery(`UPDATE accounts_user SET incorrect_password_tries = 0 WHERE username IN('${userID}','${managerID}','${adminID}');`); //권한별 오류 횟수 초기화
});

/** 
 * 권한별 계정 오류 횟수 초기화
 */
test('권한별 계정 오류 횟수 초기화', async({ page }) => {
  let i = 1;
  for (const account of accounts){ 
    for (let attempt = 1; attempt <= loginAttempts; attempt++) {
      await login(page, account.id, 'qwer'); // 로그인 오류 횟수 4회
      await page.waitForTimeout(1000);
      await expect(page.getByText(loginFailMessage)).toBeVisible({ timeout: 5000 });
    }
    
    await login(page, account.id, account.pw); // 정상 로그인 (오류 횟수 초기화)
    await page.waitForTimeout(2000);
    await logout(page,account.id); // 로그아웃
    await login(page,account.id, 'qwer'); //로그인 시도
    await page.waitForTimeout(1000);

    await expect(page.getByText(loginFailMessage)).toBeVisible({ timeout: 5000 });
    await screenShot(page, senarioName,`${i}. ${account.name} 로그인 성공 시 오류 횟수 초기화 확인`);
    console.log(`✅ ${account.name} 계정 로그인 오류 횟수 초기화 확인`);
    i++;
  }
});

test.afterAll(async ({}) => {
    await closeConnection();
  });