import { test, expect } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import axios from 'axios';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[10. VC 홈 메뉴 확인]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

/** 
 * VC 홈 메뉴 확인
 */
test('VC 홈 메뉴 확인', async({ page }) => {
    await expect(page.getByText(new RegExp(`ScreeningReport한국어${adminID}`))).toBeVisible();
    await expect(page.getByText('ScreenedReviewedDismissed')).toBeVisible();
    await screenShot(page,senarioName,'Home 화면 및 상단 GNB 확인')
    console.log(`✅ 홈 GNB 확인`);

    await page.getByRole('link', { name: 'Report' }).click(); //Report 클릭
    await expect(page).toHaveURL(/\/ko\/report\/history$/);
    console.log(`✅ Report 탭 이동 확인`);
    
    await page.getByRole('button', { name: `${adminID} dropdown-arrow` }).click();
    await page.getByText('설정').click(); //설정 클릭
    await expect(page).toHaveURL(/\/ko\/settings\/account$/);
    console.log(`✅ 설정 이동 확인`);

    await page.getByRole('link', { name: 'Screening' }).click(); //Screening 클릭
    await expect(page).toHaveURL(/\/ko\/screening\/screened$/);
    console.log(`✅ Screening 이동 확인`);

    await page.getByRole('button', { name: 'LanguageIcon 한국어 dropdown-' }).click();
    await page.getByText('English').click();
    await expect(page).toHaveURL(/\/en\//);
    console.log(`✅ 언어 설정 확인`);

    await page.getByRole('button', { name: 'LanguageIcon English dropdown-' }).click();
    await page.getByText('한국어').click();
    await expect(page).toHaveURL(/\/ko\//);

});
