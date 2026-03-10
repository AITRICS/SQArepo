import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { isModalOpen,isModalClosed } from '../../playwright/fixture/util.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const managerID = process.env.MANAGERID || 'defaultManager'
const managerPW = process.env.MANAGERPW || 'defaultManager!'

const userID = process.env.USERID || 'defaultUser'
const userPW = process.env.USERPW || 'defaultUser!'

const senarioName = '[08. 계정별 대시보드 설정 확인]';

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

test('계정별 대시보드 설정 확인', async ({ page }) => {
    
});