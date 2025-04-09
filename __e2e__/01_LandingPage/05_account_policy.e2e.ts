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

const managerID = process.env.MANAGERID || 'defaultManager'
const managerPW = process.env.MANAGERPW || 'defaultManager!'

const senarioName = '[05. 이용약관, 개인정보 동의서 확인]'

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
    await login(page,adminID,adminPW);
    await approval(page,adminID,userID); //nora010 계정 승인
  }else{
    console.log(`${userID} 계정 이미 있음`);
    await executeQuery(`UPDATE accounts_user SET is_active = 1 WHERE username = '${userID}';`); // nora010 계정 승인
  }
});

/** 
 * 미동의 계정 모달 확인
 */
test('미동의 계정 모달 확인', async({ page }) => {
    for (const account of accounts){ 
      await executeQuery(`DELETE FROM accounts_policy_agreement WHERE username = '${account.id}'`) //동의 내역 초기화
    }
    for (const account of accounts){ 
        await login(page,account.id,account.pw); //로그인
        await expect(page).toHaveURL(/\/screening\/screened/);
        const modalOpened = await isModalOpen(page); //모달 오픈 확인
        expect(modalOpened).toBe(true);
        await screenShot(page,senarioName,`${account.name} 약관 동의서 모달 오픈`);
        console.log(`✅ ${account.name} 약관 동의서 모달 오픈`);

        await page.getByText('확인', { exact: true }).evaluate(element => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        const agree_button = page.getByRole('button',{name:'확인'}); 
        await expect(agree_button).toBeDisabled(); // 확인 버튼 비활성화 확인
        await screenShot(page,senarioName,`'${account.name}' 확인 버튼 비활성화`);
        console.log(`✅ '${account.name}' 확인 버튼 비활성화`);
        
        await page.getByRole('checkbox', { name: '[필수] 서비스 이용약관에 동의합니다' }).click(); //서비스 이용약관 선택
        await expect(agree_button).toBeDisabled();
        await screenShot(page,senarioName,`'${account.name}' 확인 버튼 비활성화_이용약관 선택`);
        console.log(`✅ '${account.name}' 확인 버튼 비활성화_이용약관 선택`);

        await page.getByRole('checkbox', { name: '[필수] 서비스 이용약관에 동의합니다' }).click(); //서비스 이용약관 해제
        await page.getByRole('checkbox', { name: '[필수] 개인정보 수집 및 이용에 동의합니다' }).click(); //개인정보 선택
        await expect(agree_button).toBeDisabled();
        await screenShot(page,senarioName,`'${account.name}' 확인 버튼 비활성화_개인정보 선택`);
        console.log(`✅ '${account.name}' 확인 버튼 비활성화_개인정보 선택`);

        await page.getByRole('checkbox', { name: '[필수] 개인정보 수집 및 이용에 동의합니다' }).click(); //개인정보 해제
        await expect(agree_button).toBeDisabled();
        await screenShot(page,senarioName,`'${account.name}' 확인 버튼 비활성화_모두 해제`);
        console.log(`✅ '${account.name}' 확인 버튼 비활성화_모두 해제`);

        await page.getByRole('checkbox', { name: '[필수] 개인정보 수집 및 이용에 동의합니다' }).click(); //개인정보 선택
        await page.getByRole('checkbox', { name: '[필수] 서비스 이용약관에 동의합니다.' }).click(); //서비스 이용약관 선택
        await expect(agree_button).toBeEnabled(); //확인 버튼 활성화 확인
        await screenShot(page,senarioName,`'${account.name}' 확인 버튼 활성화_약관 모두 선택`);
        console.log(`✅ '${account.name}' 확인 버튼 활성화_약관 모두 선택`);

        await agree_button.click(); //약관 동의 클릭
        await page.getByRole('button', { name: 'close' }).click(); // 개정 모달 닫기
        await page.waitForTimeout(500);
        const modalClosed = await isModalClosed(page); //모달 미노출 확인
        expect(modalClosed).toBe(true);
        await screenShot(page,senarioName,`${account.name} 약관 동의서 모달 닫힘`);
        console.log(`✅ ${account.name} 약관 동의서 모달 닫힘`);

        await page.getByRole('tab', { name: 'Reviewed' }).click(); //Reviewed 탭 이동
        await page.getByRole('tab', { name: 'Dismissed' }).click(); //Dismissed 탭 이동
        await screenShot(page,senarioName,`${account.name} 대시보드 동작 가능`);
        console.log(`✅ ${account.name} 대시보드 동작 가능`);

        await logout(page,account.id);
    }
});

/** 
 * 동의 계정 모달 확인
 */
test('동의 계정 모달 확인', async({ page }) => {
    for (const account of accounts){ 
        await login(page,account.id,account.pw); //로그인
        await expect(page).toHaveURL(/\/screening\/screened/);
        const modalClosed = page.getByRole('dialog',{name:'서비스 이용약관 및 개인정보 수집 및 이용 동의 안내'}); //모달 미노출 확인
        await expect(modalClosed).not.toBeVisible({timeout: 500});
        await screenShot(page,senarioName,`${account.name} 약관 동의서 모달 미노출`);
        console.log(`✅ ${account.name} 약관 동의서 모달 미노출`);

        await logout(page,account.id);
    }
});

test.afterAll(async ({}) => {
    await closeConnection();
  });