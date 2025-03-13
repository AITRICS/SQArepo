import { test, expect } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import globalSetup from '../playwright/fixture/globalSetup.js';
import axios from 'axios';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[09. 대시보드 컬럼 정렬]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

/** 
 * 대시보드 info 컬럼 정렬 확인
 */
test('대시보드 info 컬럼 정렬', async({ page }) => {
    // let infoASC //오름차순 데이터
    // let infoDESC //내림차순 데이터

    await page.getByRole('cell', { name: 'Patient info sort' }).getByRole('img').click();
    await waitforloading(page);
    // infoASC = await page.$$eval('selector-to-patient-info-cells', elements => elements.map(el => el.textContent));
    await screenShot(page,senarioName,'Patient info 오름차순 정렬')
    await page.getByRole('cell', { name: 'Patient info sort' }).getByRole('img').click();
    await waitforloading(page);
    // infoDESC = await page.$$eval('selector-to-patient-info-cells', elements => elements.map(el => el.textContent));
    await screenShot(page,senarioName,'Patient info 내림차순 정렬')

    // expect(infoASC).not.toEqual(infoASC);

    await page.getByRole('cell', { name: 'Dept sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Dept 오름차순 정렬')
    await page.getByRole('cell', { name: 'Dept sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Dept 내림차순 정렬')

    await page.getByRole('cell', { name: 'Physician sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Physician 오름차순 정렬')
    await page.getByRole('cell', { name: 'Physician sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'Physician 내림차순 정렬')

    await page.getByRole('cell', { name: 'Date/Time sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'DateTime 오름차순 정렬')
    await page.getByRole('cell', { name: 'Date/Time sort' }).getByRole('img').click();
    await waitforloading(page);
    await screenShot(page,senarioName,'DateTime 내림차순 정렬')
});



async function waitforloading(page): Promise<void> {
    await page.waitForTimeout(500);
    const loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); 
}

test.afterAll(async ({page}) => {
    await page.close();
  });