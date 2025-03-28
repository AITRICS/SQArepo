import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import globalSetup from '../playwright/playwright.globalSetup.js';
import axios from 'axios';
import { executeQuery, closeConnection } from '../playwright/fixture/setDatabase.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[12. 대시보드 환자 상태 변경]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

test('대시보드 환자 상태 변경', async ({ page }) => {
    const scrollTarget = page.locator('xpath=/html/body/div[1]/div/div/div/div/div/div[2]');
    // 아래로
    await scrollTarget.evaluate((el: HTMLElement, ratio: number) => {
      el.scrollTop = el.scrollHeight * ratio;
    }, 0.3);
    await page.waitForTimeout(3000);
    // 맨 위로
    await scrollTarget.evaluate((el: HTMLElement) => {
      el.scrollTop = 0;
    });
    await page.waitForTimeout(3000);

});