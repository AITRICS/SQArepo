import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
test.describe.configure({ mode: 'serial' });
const senarioName = 'TC_002_001 Landing Page/[01.로그인 페이지 UI 확인]'

test.beforeEach(async ({page}) => {
  await page.goto('/ko/login')
});

/**
 * 계정 생성 모달 오픈, 버튼 비활성화 확인
 */
test('UI 확인', async({ page }) => {
 
  let isVisible =  page.getByRole('img', { name: 'logo_large' }).isVisible();
  expect(isVisible).toBeTruthy();
  await page.waitForTimeout(1000);
  await screenShot(page,senarioName,'1. 제품 로고');
  console.log(`✅ 제품 로고`);

  isVisible =  page.getByRole('textbox', { name: 'ID' }).isVisible();
  expect(isVisible).toBeTruthy();
  await screenShot(page,senarioName,'2. ID 입력 필드');
  console.log(`✅ ID 입력 필드`);

  isVisible =  page.getByRole('textbox', { name: '비밀번호' }).isVisible();
  expect(isVisible).toBeTruthy();
  await screenShot(page,senarioName,'3. 비밀번호 입력 필드');
  console.log(`✅ 비밀번호 입력 필드`);

  isVisible =  page.getByRole('checkbox', { name: '비밀번호 표시' }).isVisible();
  expect(isVisible).toBeTruthy();
  await screenShot(page,senarioName,'4. 비밀번호 표시 체크박스');
  console.log(`✅ 비밀번호 표시 체크박스`);

  isVisible =  page.getByRole('button', { name: '로그인' }).isVisible();
  expect(isVisible).toBeTruthy();
  await screenShot(page,senarioName,'5. 로그인 버튼');
  console.log(`✅ 로그인 버튼`);

  isVisible =  page.getByRole('button', { name: '계정 생성' }).isVisible();
  expect(isVisible).toBeTruthy();
  await screenShot(page,senarioName,'6. 계정 생성 버튼');
  console.log(`✅ 계정 생성 버튼`);

  await expect(page.getByText('모든 계정은 관리자의 승인 후 로그인이 가능합니다')).toBeVisible();
  await screenShot(page,senarioName,'7. 시스템 사용 알림 메시지');
  console.log(`✅ 시스템 사용 알림 메시지`);

});
