import { Page } from '@playwright/test';

/**
 * 계정 생성 함수 (매개변수로 계정 정보 받음)
 */
export async function createAccount(page: Page, accountId: string, password: string) {
  await page.goto('/ko/login');

  await page.getByRole('button', { name: '계정 생성' }).click();
  await page.getByRole('textbox', { name: '자 이내, 영문, 숫자, @,-,_,. 사용 가능' }).fill(accountId);
  await page.getByRole('textbox', { name: '~25자 이내, 영문, 숫자, 특수문자 사용 가능' }).fill(password);
  await page.getByRole('textbox', { name: '비밀번호 확인' }).fill(password);
  await page.getByRole('textbox', { name: '이름' }).fill(accountId);
  
  await page.getByText('사용자 유형', { exact: true }).evaluate(element => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });//스크롤

  await page.locator('div').filter({ hasText: /^사용자 유형선택의사간호사비의료진$/ }).getByRole('combobox').click();
  await page.getByRole('option', { name: '의사' }).click();
  await page.getByRole('combobox').filter({ hasText: '선택' }).click();
  await page.getByRole('option', { name: '일반병동' }).click();

  await page.getByRole('checkbox', { name: '[필수] 서비스 이용약관에 동의합니다' }).check();
  await page.getByRole('checkbox', { name: '[필수] 개인정보 수집 및 이용에 동의합니다' }).check();

  await page.getByText('계정이 있으신가요? 로그인', { exact: true }).evaluate(element => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });//스크롤

  await page.getByRole('button', { name: '계정 생성' }).click();

}
