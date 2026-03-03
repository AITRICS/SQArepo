import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';

dotenv.config();

const senarioName = '[. 시간대 설정 페이지 확인]';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const originalTimezone = '(UTC+09:00) Asia/Seoul'; // 기본 시간대
const targetTimezone =  'UTC+05:00) Asia/Samarkand'; // 설정할 시간대

test.beforeEach(async ({page}) => {
    test.setTimeout(0);
    await page.goto('/ko/login')
    await login(page,adminID,adminPW);
    await page.waitForTimeout(2000);
    const loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기

    await page.getByRole('button', { name: `${adminID} dropdown-arrow` }).click();
    await page.waitForTimeout(1000);
    await page.getByText('설정').click();
    await page.waitForTimeout(1000);

    await page.getByText('시간대 설정').click(); // 시간대 설정 화면 진입
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/settings\/timezone$/);
});

test('시간대 설정 확인', async ({ page }) => {
    const timezoneSelect = page.getByRole('button', { name: originalTimezone });
    await expect(timezoneSelect).toBeVisible();
    await timezoneSelect.click();
    await page.waitForTimeout(500);

    const timezoneDialog = page.locator('[role="dialog"]');
    await expect(timezoneDialog).toBeVisible();
    await expect(timezoneDialog.getByText(targetTimezone)).toBeVisible();

    await timezoneDialog.getByText(targetTimezone).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: targetTimezone })).toBeVisible();

    const saveButton = page.getByRole('button', { name: '저장' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await page.waitForTimeout(1000);
    await expect(page.getByText('저장되었습니다')).toBeVisible();


    await page.getByRole('link', { name: 'Screening' }).click();
    await page.waitForTimeout(2000);
    const loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000});


    const now = new Date();
    now.setHours(now.getHours() - 4);

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 0부터 시작
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');

    const datePart = `${year}-${month}-${day}`;
    const timePart = `${hour}:${minute}`;

    const datetimeBtn = page.getByRole('button', { name: new RegExp(`${datePart} ${timePart}`) });
    await expect(datetimeBtn).toBeVisible();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: `${adminID} dropdown-arrow` }).click();
    await page.waitForTimeout(1000);
    await page.getByText('설정').click();
    await page.waitForTimeout(1000);

    await page.getByText('시간대 설정').click(); // 시간대 설정 화면 진입
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/settings\/timezone$/);


    const newTimezoneBtn = page.getByRole('button', { name: targetTimezone });
    await newTimezoneBtn.click();
    await page.waitForTimeout(500);
    await timezoneDialog.getByText(originalTimezone).click();
    await saveButton.click();
    await page.waitForTimeout(1000);
});