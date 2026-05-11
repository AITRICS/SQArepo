import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { createAccount } from '../../playwright/fixture/account.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
import { approval } from '../../playwright/fixture/approval.js';
import { isModalOpen,isModalClosed } from '../../playwright/fixture/util.js';
import { createUser} from '../../playwright/fixture/apiHelper.js';


test.describe.configure({ mode: 'serial' });

dotenv.config();

const userID = process.env.USERID || 'defaultUser';
const userPW = process.env.USERPW || 'defaultPass!';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const managerID = process.env.MANAGERID || 'defaultManager'
const managerPW = process.env.MANAGERPW || 'defaultManager!'

const senarioName = 'TC_002_001 Landing Page/[05. 이용약관, 개인정보 동의서 확인]'

const loginFailMessage = 'ID 또는 비밀번호를 확인해주세요.'

const accounts = [
  {id: userID, pw: userPW, name: 'Member'},
  {id: managerID, pw: managerPW, name: 'Manager', },
  {id: adminID, pw: adminPW, name: 'Admin'}
]


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
  } else {
    console.log(`${userID} 계정 이미 있음`);
  }
  await executeQuery(`UPDATE accounts_user SET is_active = 1 WHERE username = '${userID}';`); //승인
});

/** 
 * 미동의 계정 모달 확인
 */
test('미동의 계정 모달 확인', async({ page }) => {
    for (const account of accounts){ 
      await executeQuery(`DELETE FROM accounts_policy_agreement WHERE username = '${account.id}'`) // 권한별 동의 내역 초기화
    }
    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        await login(page,account.id,account.pw); //로그인
        await expect(page).toHaveURL(/\/screening\/screened/);
        const modalOpened = await isModalOpen(page); //모달 오픈 확인
        expect(modalOpened).toBe(true);
        await screenShot(page,senarioName,`${i+1}. ${account.name} 미동의 계정 로그인 동의서 모달 노출`);
        console.log(`✅ ${account.name} 약관 동의서 모달 오픈`);

        await page.getByText('확인', { exact: true }).evaluate(element => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        await page.waitForTimeout(800);
        const agree_button = page.getByRole('button',{name:'확인'}); 
        await expect(agree_button).toBeDisabled(); // 확인 버튼 비활성화 확인
        await screenShot(page,senarioName,`${i+4}. ${account.name} 동의서 미체크 상태 확인 버튼 비활성화`);
        console.log(`✅ ${account.name} 확인 버튼 비활성화`);
        
        await page.getByRole('checkbox', { name: '[필수] 서비스 이용약관에 동의합니다' }).click(); //서비스 이용약관 선택
        await expect(agree_button).toBeDisabled();
        await screenShot(page,senarioName,`${i*2+8}. ${account.name} 동의서 하나만 체크 상태 확인 버튼 비활성화 서비스 이용약관 동의 체크 선택`);
        console.log(`✅ ${account.name} 확인 버튼 비활성화_이용약관 선택`);

        await page.getByRole('checkbox', { name: '[필수] 서비스 이용약관에 동의합니다' }).click(); //서비스 이용약관 해제
        await page.getByRole('checkbox', { name: '[필수] 개인정보 수집 및 이용에 동의합니다' }).click(); //개인정보 선택
        await expect(agree_button).toBeDisabled();
        await screenShot(page,senarioName,`${i*2+7}. ${account.name} 동의서 하나만 체크 상태 확인 버튼 비활성화 개인정보 동의 체크 선택`);
        console.log(`✅ ${account.name} 확인 버튼 비활성화_개인정보 선택`);

        await page.getByRole('checkbox', { name: '[필수] 개인정보 수집 및 이용에 동의합니다' }).click(); //개인정보 해제
        await expect(agree_button).toBeDisabled();
        await screenShot(page,senarioName,`${i+13}. ${account.name} 동의서 모두 해제 상태 확인 버튼 비활성화`);
        console.log(`✅ ${account.name} 확인 버튼 비활성화_모두 해제`);

        await page.getByRole('checkbox', { name: '[필수] 개인정보 수집 및 이용에 동의합니다' }).click(); //개인정보 선택
        await page.getByRole('checkbox', { name: '[필수] 서비스 이용약관에 동의합니다.' }).click(); //서비스 이용약관 선택
        await expect(agree_button).toBeEnabled(); //확인 버튼 활성화 확인
        await screenShot(page,senarioName,`${i+16}. ${account.name} 동의서 모두 체크 상태 확인 버튼 활성화`);
        console.log(`✅ ${account.name} 확인 버튼 활성화_약관 모두 선택`);

        await agree_button.click(); //약관 동의 클릭
        await page.getByRole('button', { name: 'close' }).click(); // 개정 모달 닫기
        await page.waitForTimeout(500);
        const modalClosed = await isModalClosed(page); //모달 미노출 확인
        expect(modalClosed).toBe(true);
        await screenShot(page,senarioName,`${i+19}. ${account.name} 동의서 모두 체크 후 확인 버튼 클릭`);
        console.log(`✅ ${account.name} 약관 동의서 모달 닫힘`);

        await page.getByRole('tab', { name: 'Reviewed' }).click(); //Reviewed 탭 이동
        await page.getByRole('tab', { name: 'Dismissed' }).click(); //Dismissed 탭 이동
        await screenShot(page,senarioName,`${i+22}. ${account.name} 동의서 모두 후 대시보드 이동`);
        console.log(`✅ ${account.name} 대시보드 동작 가능`);

        await logout(page,account.id);
    }
});

/** 
 * 동의 계정 모달 확인
 */
test('동의 계정 모달 확인', async({ page }) => {
    let i = 1;
    for (const account of accounts){ 
        await login(page,account.id,account.pw); //로그인
        await expect(page).toHaveURL(/\/screening\/screened/);
        const modalClosed = page.getByRole('dialog',{name:'서비스 이용약관 및 개인정보 수집 및 이용 동의 안내'}); //모달 미노출 확인
        await expect(modalClosed).not.toBeVisible({timeout: 500});
        await screenShot(page,senarioName,`${i+24}. ${account.name} 동의 계정 동의서 모달 미노출`);
        console.log(`✅ ${account.name} 약관 동의서 모달 미노출`);
        i++;

        await logout(page,account.id);
    }
});

test.afterAll(async ({}) => {
    await closeConnection();
  });