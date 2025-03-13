import { test, expect } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import { logout } from '../playwright/fixture/logout.js';
import { approval } from '../playwright/fixture/approval.js';
import { isModalOpen,isModalClosed } from '../playwright/fixture/util.js';
import globalSetup from '../playwright/fixture/globalSetup.js';


dotenv.config();

const userID = process.env.USERID || 'defaultUser';
const userPW = process.env.USERPW || 'defaultPass!';
const userName = process.env.USERNAME || 'defaultName';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[01.계정 생성]'

test.beforeEach(async ({page}) => {
  await page.goto('/ko/login')
});

// test.beforeAll(async ({}) => {
//   const fakeConfig = {projects: []} as any;
//    await globalSetup(fakeConfig);
// });

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
  await page.getByRole('textbox', { name: '자 이내, 영문, 숫자, @,-,_,. 사용 가능' }).fill(userID); 
  await page.getByRole('textbox', { name: '~25자 이내, 영문, 숫자, 특수문자 사용 가능' }).fill(userPW); 
  await page.getByRole('textbox', { name: '비밀번호 확인' }).fill(userPW); 
  await page.getByRole('textbox', { name: '이름' }).fill(userName); 
  await page.getByText('사용자 유형', { exact: true }).evaluate(element => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
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

  await create_button.click();
  await page.waitForTimeout(500);
  const modalClosed = await isModalClosed(page);
  expect(modalClosed).toBe(true); // 모달 닫힘 확인
  await screenShot(page,senarioName,'계정 생성 완료 모달 닫힘');
  console.log(`✅ 계정 생성 완료 모달 닫힘`);

  await expect(page.getByText('계정 생성 완료! 관리자의 승인 후 로그인이 가능합니다.')).toBeVisible({ timeout: 5000 });
  await screenShot(page,senarioName,'계정 생성 완료 토스트 메세지');
  console.log(`✅ 계정 생성 완료 토스트 메세지`);
});

/**
 * 생성 계정 로그인
 */
test('생성 계정 로그인', async({ page}) => {
  await login(page, adminID, adminPW)  // admin 로그인
  await approval(page,adminID,userID); // 계정 승인
  await logout(page,adminID); // admin 로그아웃
  await login(page, userID, userPW) //user 로그인
  await screenShot(page,senarioName,'생성 계정 로그인');
  await page.waitForURL((url) => url.pathname.includes('/screening/screened'));
  await expect(page).toHaveURL(/\/screening\/screened/);
  console.log(`✅ 생성 계정 로그인`);
});

test.afterAll(async ({page}) => {
  await page.close();
});