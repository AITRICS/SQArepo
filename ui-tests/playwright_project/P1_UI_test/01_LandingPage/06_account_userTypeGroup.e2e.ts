import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { logout } from '../../playwright/fixture/logout.js';
import { createAccount } from '../../playwright/fixture/account.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
import { approval } from '../../playwright/fixture/approval.js';
import { isModalOpen,isModalClosed, findUserInMemberTable } from '../../playwright/fixture/util.js';
import { createUser} from '../../playwright/fixture/apiHelper.js';

test.describe.configure({ mode: 'serial' }); // 테스트를 순차적으로 실행하도록 설정


dotenv.config();

const userID = process.env.USERID || 'defaultUser';
const userPW = process.env.USERPW || 'defaultPass!';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[06.사용자 유형, 소속 선택]'

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
      name: 'memnora',      
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
 * 사용자 유형, 소속 선택 안내 모달 오픈 확인
 */
test('사용자 유형/소속 미선택 계정 확인', async ({ page }) => {
  await executeQuery(`
    DELETE FROM accounts_user_info 
    WHERE user_id = (SELECT id FROM accounts_user WHERE username = '${userID}');
  `);

  await login(page, userID, userPW);
  await page.waitForTimeout(2000);

  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({ timeout: 10000 });

  const modalOpened = await isModalOpen(page);
  expect(modalOpened).toBe(true);

  const modalTextLocator = page.locator('xpath=/html/body/div[6]/div/p');
  await expect(modalTextLocator).toHaveText(
    'AITRICS-VitalCare 서비스 내 사용중이신 계정의 추가 정보 설정을 위하여 사용자 유형 및 소속을 선택해주세요.'
  );

  await screenShot(page, senarioName, '사용자 유형,소속 선택 모달 오픈');
  console.log('✅ 사용자 유형/소속 선택 모달 오픈 및 안내 문구 일치');

  
});

/**
 * 사용자 유형, 소속 선택 확인
 */
test('사용자 유형/소속 선택 확인', async ({ page }) => {
    await executeQuery(`
      DELETE FROM accounts_user_info 
      WHERE user_id = (SELECT id FROM accounts_user WHERE username = '${userID}');
    `);

    await login(page, userID, userPW);
    await page.waitForTimeout(2000);

    const loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({ timeout: 10000 });

    const modalOpened = await isModalOpen(page);
    expect(modalOpened).toBe(true);

    await page.locator('div').filter({ hasText: /^사용자 유형선택의사간호사비의료진$/ }).getByRole('combobox').click();
    const listbox_type = page.getByRole('listbox');
    await expect(listbox_type.getByRole('option', { name: '의사' })).toBeVisible();
    await expect(listbox_type.getByRole('option', { name: '간호사' })).toBeVisible();
    await expect(listbox_type.getByRole('option', { name: '비의료진' })).toBeVisible();

    await screenShot(page,senarioName,'사용자 유형 드롭다운 리스트 확인');
    console.log(`✅ 사용자 유형 리스트 확인`);

    await page.locator('div').filter({ hasText: /^사용자 소속선택일반병동중환자실RRT기타$/ }).getByRole('combobox').click();
    const listbox_group = page.getByRole('listbox');
    await expect(listbox_group.getByRole('option', { name: '일반병동' })).toBeVisible();
    await expect(listbox_group.getByRole('option', { name: '중환자실' })).toBeVisible();
    await expect(listbox_group.getByRole('option', { name: 'RRT' })).toBeVisible();
    await expect(listbox_group.getByRole('option', { name: '기타' })).toBeVisible();
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
    // asloadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000});
    modalClosed = await isModalClosed(page); //모달 미노출 확인
    expect(modalClosed).toBe(true);
    await screenShot(page,senarioName,'사용자 유형,소속 설정 후 로그인 확인');
    console.log(`✅ 사용자 소속 설정 후 로그인 확인`);

});

/**
 * 관리자가 사용자 유형, 소속 선택 후 로그인 확인
 */

test('관리자 사용자 유형/소속 선택 후 로그인 확인', async ({ page }) => {
  // 최신 토큰 1건 비활성화
  await executeQuery(`
    UPDATE accounts_token
    SET is_active = 0
    WHERE id = (
      SELECT max_id
      FROM (
        SELECT MAX(t.id) AS max_id
        FROM accounts_token t
        JOIN accounts_user u ON u.id = t.user_id
        WHERE u.username = '${userID}'
      ) x
    );
  `);

  // 사용자 유형/소속 삭제
  await executeQuery(`
    DELETE FROM accounts_user_info
    WHERE user_id = (SELECT id FROM accounts_user WHERE username = '${userID}');
  `);

  // 관리자 로그인
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);

  let loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({ timeout: 10000 });

  // 설정 > 멤버 관리 진입
  await page.getByRole('button', { name: `${adminID} dropdown-arrow` }).click();
  await page.getByText('설정', { exact: true }).click();
  await page.getByText('멤버 관리', { exact: true }).click();
  await page.waitForTimeout(1500);

  // ✅ util.ts의 findUserInMemberTable 사용 (스크롤하면서 userID row 찾기)
  const userRow = await findUserInMemberTable(page, userID);
  await userRow.click();

  // 다이얼로그 등장 기다리기 (name 의존 제거)
  const dialog = page.getByRole('dialog').filter({ hasText: '멤버 정보' });
  await expect(dialog).toBeVisible({ timeout: 5000 });

  // 사용자 유형 선택 (dialog 스코프 강제)
  await dialog.getByRole('combobox').nth(0).click();
  await page.getByRole('option', { name: '의사' }).click();

  // 소속/병동 선택 (dialog 스코프 강제)
  await dialog.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: '일반병동' }).click();

  // 저장 & 닫기 (dialog 스코프 강제)
  await dialog.getByRole('button', { name: '저장' }).click();
  await dialog.getByRole('button', { name: 'Close' }).click();

  // 관리자 로그아웃
  await logout(page, adminID);
  await page.waitForTimeout(1500);

  // 사용자 로그인
  await login(page, userID, userPW);
  await page.waitForTimeout(2000);

  loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({ timeout: 10000 });

  // 모달 미노출 확인
  const modalClosed = await isModalClosed(page);
  expect(modalClosed).toBe(true);

  await screenShot(page, senarioName, '관리자 사용자 유형,소속 설정 후 로그인 확인');
  console.log('✅ 관리자 사용자 소속 설정 후 로그인 확인');
  
  
});



test.afterAll(async ({}) => {
    await closeConnection();
    
  });

