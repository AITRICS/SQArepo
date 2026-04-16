import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
// import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { approval } from '../../playwright/fixture/approval.js';
import { isModalOpen,isModalClosed, waitModalClosed } from '../../playwright/fixture/util.js';
import { env } from '../../src/config/env.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
import { deleteUser } from '../../playwright/fixture/apiHelper.js';
test.describe.configure({ mode: 'serial' });
// dotenv.config();

const userID = process.env.USERID || 'defaultUser';
// const userPW = process.env.USERPW || 'defaultPass!';
// const userName = process.env.USERNAME || 'defaultName';

// const adminID = process.env.ADMINID || 'defaultAdmin'
// const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[02.계정 생성]'

test.beforeEach(async ({page}) => {
  await page.goto('/ko/login')
});

test.beforeAll(async () => {
  const query = `SELECT * FROM accounts_user WHERE username = '${userID}'`;
  const rows = await executeQuery(query);

  if (rows.length === 0) {
    return;
  }

  console.log(`${userID} 계정 이미 있음 -> API로 삭제`);
  try {
    const res = await deleteUser(userID);
    console.log(`[API] delete user ${userID} result:`, res);
  } catch (e) {
    console.log(`[API] delete user ${userID} failed:`, e);
  }
});

/**
 * 계정 생성 모달 오픈, 버튼 비활성화 확인
 */
test('계정 생성 모달', async({ page }) => {
  await page.getByRole('button', { name: '계정 생성' }).click(); //계정 생성 모달 오픈
  const modalOpened = await isModalOpen(page);
  expect(modalOpened).toBe(true);
  await screenShot(page,senarioName,'계정 생성 모달 오픈');
  console.log(`✅ 계정 생성 모달 오픈`);

  await page.getByText('계정이 있으신가요? 로그인', { exact: true }).evaluate(element => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const create_button = page.getByRole('button',{name:'계정 생성'}); 
  await expect(create_button).toBeDisabled(); // 계정 생성 모달 비활성화 확인
  await screenShot(page,senarioName,'계정 생성 버튼 비활성화');
  console.log(`✅ 계정 생성 버튼 비활성화`);
});

/**
 * 계정 생성 완료 모달 닫힘, 토스트 메세지 확인
 */
test('계정 생성 진행', async ({ page }) => {
  await page.getByRole('button', { name: '계정 생성' }).click(); //계정 생성 모달 오픈
  await page.getByRole('textbox', { name: '자 이내, 영문, 숫자, @,-,_,. 사용 가능' }).fill(env.USER.ID); 
  await page.getByRole('textbox', { name: '8~25자 이내, 영문, 숫자, 특수문자 사용 가능' }).fill(env.USER.PW); 
  await page.getByTestId('confirm-password-element').locator('input').fill(env.USER.PW);
  await page.locator('input[name="name"]').fill(env.USER.NAME);
  await page.locator('div').filter({ hasText: /^사용자 유형선택의사간호사비의료진$/ }).getByRole('combobox').click();
  await page.getByRole('option', { name: '의사' }).click(); 
  await page.getByRole('combobox').filter({ hasText: '선택' }).click();
  await page.getByRole('option', { name: '일반병동' }).click(); 
  await page.getByRole('checkbox', { name: '[필수] 서비스 이용약관에 동의합니다' }).check(); 
  await page.getByRole('checkbox', { name: '[필수] 개인정보 수집 및 이용에 동의합니다' }).check(); 
  await page.getByText('계정이 있으신가요? 로그인', { exact: true }).evaluate(element => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const create_button = page.getByRole('button',{name:'계정 생성'}); 
  await expect(create_button).toBeEnabled(); // 계정 생성 버튼 활성화 확인
  await screenShot(page,senarioName,'계정 생성 버튼 활성화');
  console.log(`✅ 계정 생성 버튼 활성화`);

  await create_button.click(); // 계정 생성 버튼 클릭
  // await page.waitForTimeout(500);
  const modalClosed = await isModalClosed(page);
  expect(modalClosed).toBe(true); // 모달 닫힘 확인
  await screenShot(page,senarioName,'계정 생성 후 로그인 페이지 이동');
  console.log(`✅ 계정 생성 후 로그인 페이지 이동`);

  await expect(page.getByText('계정 생성 완료! 관리자의 승인 후 로그인이 가능합니다.')).toBeVisible({ timeout: 5000 });
  await screenShot(page,senarioName,'계정 생성 완료 토스트 메세지');
  console.log(`✅ 계정 생성 완료 토스트 메세지`);
});

/**
 * 생성 계정 로그인
 */
test('생성 계정 로그인', async({ page}) => {
  await login(page, env.ADMIN.ID, env.ADMIN.PW)  // admin 로그인
  await approval(page,env.ADMIN.ID,env.USER.ID); // 계정 승인
  await logout(page,env.ADMIN.ID); // admin 로그아웃
  await login(page, env.USER.ID, env.USER.PW) //user 로그인
  await screenShot(page,senarioName,'생성된 계정 로그인');
  await page.waitForURL((url) => url.pathname.includes('/screening/screened'));
  await expect(page).toHaveURL(/\/screening\/screened/);
  console.log(`✅ 생성된 계정 로그인`);
});


test.afterAll(async ({}) => {
    await closeConnection();
    
  });

