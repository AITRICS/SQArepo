import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';

dotenv.config();

const senarioName = '[. 병원 정보 관리 페이지 확인]';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

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

    await page.getByText('병원 정보 관리').click(); // 시간대 설정 화면 진입
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/settings\/hospital-info$/);
});

test('병원 정보 관리 페이지 확인', async ({ page }) => {
    
    const nameInput = page.getByRole('textbox', { name: '병원명을 입력해 주세요' });
    const addressInput = page.getByRole('textbox', { name: '주소를 입력해 주세요' });
    const contactInput = page.getByRole('textbox', { name: '연락처를 입력해 주세요' });

    const randomContact = Math.floor(Math.random() * 10 ** 12).toString().padStart(12, '0');

    await nameInput.fill('');
    await nameInput.fill('에이아이트릭스병원');
  
    await addressInput.fill('');
    await addressInput.fill('서울 강남구 AI로 123');
  
    await contactInput.fill('');
    await contactInput.fill(randomContact);

    const saveButton = page.getByRole('button', { name: '저장' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await page.waitForTimeout(1000);
  
    await expect(page.getByText('저장되었습니다')).toBeVisible();
});