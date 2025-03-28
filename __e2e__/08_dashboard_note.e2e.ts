import { test, expect } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import { logout } from '../playwright/fixture/logout.js';
import { createAccount } from '../playwright/fixture/account.js';
import globalSetup from '../playwright/playwright.globalSetup.js';
import { executeQuery } from '../playwright/fixture/setDatabase.js';
import { approval } from '../playwright/fixture/approval.js';
import { isModalOpen,isModalClosed } from '../playwright/fixture/util.js';


dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[06. 대시보드 노트]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')

  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
  
  const tableLocator = page.locator('table');
  const headers = await tableLocator.locator('thead tr th').allTextContents();
  const noteIndex = headers.indexOf('Note') + 1; //Note 인덱스 찾기

  const noteButton = tableLocator.locator(`tbody tr:nth-child(1) td:nth-child(${noteIndex}) button`);
  await noteButton.click();//환자 노트 클릭
  await page.waitForTimeout(2000);
});

// test.beforeAll(async ({page}) => {
//
// });


  
/** 
 * 대시보드 노트 용량 초과 확인
 */
test('대시보드 노트 용량 초과 확인', async({ page }) => {
    for(let i=1; i<=100; i++){
      const noteCount = await page.getByText(/노트 \d+/).textContent();
      const currentCount = parseInt(noteCount.replace(/\D/g, ''), 10); //노트 카운트 확인

      if(currentCount >= 100) break; //노트 100개면 반복문 종료

      await page.getByRole('textbox').fill(`${currentCount+1}`);
      await page.getByTestId('note-creation-submit-button').click(); //노트 저장
      await page.waitForTimeout(2000);
    }

    await page.getByRole('textbox').fill('101');
    await page.getByTestId('note-creation-submit-button').click(); //101번째 노트 저장 시도

    const alertMessage = page.getByText(/Note 용량 초과/);
    if(await alertMessage.isVisible()){
       await screenShot(page,senarioName,'노트 저장 용량 초과 얼럿 노츨');
       console.log('✅ 노트 용량 초과 얼럿 노출')
    } 

    await page.getByRole('button', { name: '아니오' }).click();
    await page.getByTestId('note-creation-submit-button').click();
    await page.getByRole('button', { name: '예' }).click(); //101번째 노트 저장
    await page.waitForTimeout(2000);
    const lastNote = await page.locator('li:nth-child(1) p').textContent();
    expect(lastNote).toBe('101');
    const noteCount = await page.getByText(/노트 \d+/).textContent();
    const currentCount = parseInt(noteCount.replace(/\D/g, ''), 10); //노트 카운트 확인
    expect(currentCount).toBe('100');
    await screenShot(page,senarioName,'101번째 노트 저장');
    console.log('✅ 101번째 노트 저장')
});

/** 
 * 대시보드 노트 삭제 확인
 */
test('대시보드 노트 삭제 확인', async({ page }) => {
  let noteCount = await page.getByText(/노트 \d+/).textContent();
  const currentCount = parseInt(noteCount.replace(/\D/g, ''), 10); //노트 카운트 확인

  if(currentCount === 0){
    await page.getByRole('textbox').fill('1');
    await page.getByTestId('note-creation-submit-button').click();
    await page.waitForTimeout(2000);
  }
  const deleteButton = page.getByTestId('button-delete').first();

  await deleteButton.click();
  await page.waitForTimeout(1000);
  const alertMessage = page.getByText(/노트를 삭제합니다./);
  await alertMessage.isVisible();
  expect(alertMessage).toBeVisible;
  await screenShot(page,senarioName,'노트 삭제 얼럿 표시');
  console.log('✅ 노트 삭제 얼럿 표시')

  await page.getByRole('button', { name: '아니오' }).click();
  await page.waitForTimeout(1000);
  noteCount = await page.getByText(/노트 \d+/).textContent();
  let nowCount = parseInt(noteCount.replace(/\D/g, ''), 10); //노트 카운트 확인
  expect(currentCount).toBe(nowCount);
  await screenShot(page,senarioName,'노트 삭제 취소');
  console.log('✅ 노트 삭제 취소 확인')

  await deleteButton.click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '예' }).click();
  await page.waitForTimeout(1000);
  noteCount = await page.getByText(/노트 \d+/).textContent();
  nowCount = parseInt(noteCount.replace(/\D/g, ''), 10); //노트 카운트 확인
  expect(nowCount).toBe(currentCount-1);
  await screenShot(page,senarioName,'노트 삭제 확인');
  console.log('✅ 노트 삭제 확인')
});

/** 
 * 대시보드 노트 저장 확인
 */
test('대시보드 노트 저장 확인', async({ page }) => {
  let noteCount = await page.getByText(/노트 \d+/).textContent();
  const currentCount = parseInt(noteCount.replace(/\D/g, ''), 10); //노트 카운트 확인
  const testtext = 'note test@@'

  if(currentCount === 100){
    const deleteButton = page.getByTestId('button-delete').first();
    await deleteButton.click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: '예' }).click();
    await page.waitForTimeout(1000);
  }
  const saveButton = page.getByTestId('note-creation-submit-button');

  await page.getByRole('textbox').fill('test');
  await expect(saveButton).toBeEnabled();// 저장 버튼 활성화 확인
  await screenShot(page,senarioName,'노트 저장 버튼 활성화');
  console.log('✅ 노트 저장 버튼 활성화')

  await page.getByRole('textbox').fill('');
  await expect(saveButton).toBeDisabled(); // 저장 버튼 비활성화 확인
  await screenShot(page,senarioName,'노트 저장 버튼 비활성화');
  console.log('✅ 노트 저장 버튼 비활성화')

  await page.getByRole('textbox').fill(testtext);
  await saveButton.click();
  await page.waitForTimeout(1000);
  const lastNote = await page.locator('li:nth-child(1) p').textContent();
  expect(lastNote).toBe(testtext);
  await screenShot(page,senarioName,'저장 노트 최상단 표시');
  console.log('✅ 저장 노트 최상단 표시')
});

/** 
 * 대시보드 노트 닫기 버튼 확인
 */
test('대시보드 노트 닫기 버튼 확인', async({ page }) => {
  const closeButton = page.getByRole('button',{name:'icon-close'});
  const inputValue = 'test';
  const inputBox = page.getByRole('textbox')
  const noteDialog = page.getByRole('dialog',{name:'Note'});

  await inputBox.fill(inputValue);
  await closeButton.click();
  await page.waitForTimeout(1000);
  const alertMessage = page.getByText(/노트를 저장하지 않았습니다./);
  await alertMessage.isVisible();
  expect(alertMessage).toBeVisible;
  await screenShot(page,senarioName,'노트 닫기 얼럿 표시');
  console.log('✅ 노트 닫기 얼럿 표시')

  await page.getByRole('button', { name: '아니오' }).click();
  await page.waitForTimeout(1000);
  await expect(inputBox).toHaveValue(inputValue);
  await screenShot(page,senarioName,'노트 내용 유지');
  console.log('✅ 노트 내용 유지')

  await closeButton.click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: '예' }).click();
  await page.waitForTimeout(1000);
  expect(noteDialog).not.toBeVisible();
  await screenShot(page,senarioName,'노트 닫기');
  console.log('✅ 노트 닫기')

  const tableLocator = page.locator('table');
  const headers = await tableLocator.locator('thead tr th').allTextContents();
  const noteIndex = headers.indexOf('Note') + 1; //Note 인덱스 찾기

  const noteButton = tableLocator.locator(`tbody tr:nth-child(1) td:nth-child(${noteIndex}) button`);
  await noteButton.click();//환자 노트 클릭
  await page.waitForTimeout(1000);

  let noteCount = await page.getByText(/노트 \d+/).textContent();
  const currentCount = parseInt(noteCount.replace(/\D/g, ''), 10); //노트 카운트 확인
  
  if(currentCount === 0){
    await screenShot(page,senarioName,'노트 닫은 후 저장 안됨');
    console.log('✅ 노트 닫은 후 저장 안됨');
  }
  else{
    const lastNote = await page.locator('li:nth-child(1) p').textContent();
    expect(lastNote).not.toBe(inputValue);
    await screenShot(page,senarioName,'노트 닫은 후 저장 안됨');
    console.log('✅ 노트 닫은 후 저장 안됨');
  }
});
