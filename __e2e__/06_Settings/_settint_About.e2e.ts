import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';



dotenv.config();

const version = process.env.VERSION || 'v2.1.2-rc';
const vcCode = process.env.VC_CODE || '(01)08809906300007(10)';
const manufactureDate = process.env.MANUFACTURE_DATE || '2025-03-27';

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const versionForStandardCode = 'V' + version.replace(/^v/, '').split('-')[0].replace(/\./g, '');
const standardCode = `${vcCode}${versionForStandardCode}`;


const senarioName = '[. 제품 정보 페이지 확인]';

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

    await page.getByText('제품 정보').click(); // 제품정보 화면 진입
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/settings\/about$/);
});

test('제품 정보 페이지 확인', async ({ page }) => {
    await expect(page.getByText('제품명: AITRICS-VC')).toBeVisible();
    await expect(page.getByText('제허 22-723호')).toBeVisible();
    await expect(page.getByText('생체신호분석 소프트웨어')).toBeVisible();

    await expect(page.getByText(`제품버전: ${version}`)).toBeVisible();
    await expect(page.getByText(`제조연월: ${manufactureDate}`)).toBeVisible();
    await expect(page.getByText('포장단위: 1EA')).toBeVisible();
    await expect(page.getByText(`표준코드: ${standardCode}`)).toBeVisible();
    await expect(page.getByText('본 제품은 의료기기 임')).toBeVisible();

    await expect(page.getByText('(주)에이아이트릭스')).toBeVisible();
    await expect(page.getByText('서울 강남구 테헤란로 218 13층(역삼동, AP TOWER(에이피타워))')).toBeVisible();
    await expect(page.getByText('문의 : cs@aitrics.com, +82) 02-585-5506')).toBeVisible();
    await expect(page.getByText('홈페이지 : www.aitrics.com')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('div').filter({ hasText: /^제품 설명서 다운로드$/ }).click();
    const download = await downloadPromise;
    const fileName = download.suggestedFilename();
    expect(fileName.startsWith('AITRICS-VC_사용자_매뉴얼')).toBe(true);

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: '이용약관' }).click();
    const page1 = await page1Promise;
    await page1.waitForLoadState('domcontentloaded');
    await expect(page1).toHaveTitle('AITRICS-VC 서비스이용약관');

    const page2Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: '개인정보처리방침' }).click();
    const page2 = await page2Promise;
    await page2.waitForLoadState('domcontentloaded');
    await expect(page2).toHaveTitle('AITRICS-VC 개인정보처리방침');
});

test('개인정보처리방침 탭 - 과거 이용약관 확인', async ({ page }) => {
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: '개인정보처리방침' }).click();
    const page2 = await popupPromise;
    await page2.waitForLoadState('domcontentloaded');

    const dropdownButton = page2.getByRole('button', { name: /개인정보처리방침/ });
    await expect(dropdownButton).toBeVisible();
    await dropdownButton.click();
    await page.waitForTimeout(1000);

    const items = page2.locator('div[role="dialog"] >> text=개인정보처리방침');
    const count = await items.count();

    const listDates: string[] = [];
    for (let i = 0; i < count; i++) {
        const text = await items.nth(i).textContent(); // 예: "개인정보처리방침 (2025.04.03)"
        const match = text?.match(/\d{4}\.\d{2}\.\d{2}/);
        if (match) listDates.push(match[0]); // ["2025.04.03", "2024.10.02", ...]
    }

    const sorted = [...listDates].sort((a, b) => b.localeCompare(a));
    expect(listDates).toEqual(sorted)   //제정일자 내림차순 정렬 확인

    const expectedCurrent = listDates[0]; //현재 제정일자 확인
    const currentDateLine = page2.getByText(/^● 제정일자\s*:\s*\d{4}\.\d{1,2}\.\d{1,2}$/);
    await expect(currentDateLine).toBeVisible();
    const currentText = await currentDateLine.textContent();
    const currentMatch = currentText?.match(/● 제정일자\s*:\s*(\d{4})\.(\d{1,2})\.(\d{1,2})/);
    const currentFormatted = `${currentMatch![1]}.${currentMatch![2]}.${currentMatch![3]}`;
    expect(currentFormatted).toBe(expectedCurrent.replace(/\.0/g, '.')); 


    const targetIndex = 1; // 과거 항목 제정일자 확인
    const targetDate = listDates[targetIndex]; 
    const expectedContentDate = targetDate.replace(/\.0/g, '.');

    await items.nth(targetIndex).click();
    await page2.waitForLoadState('domcontentloaded');

    const newDateLine = page2.getByText(/^● 제정일자\s*:\s*\d{4}\.\d{1,2}\.\d{1,2}$/);
    await expect(newDateLine).toBeVisible(); // 추가 보장
    const newText = await newDateLine.textContent();
    const newMatch = newText?.match(/● 제정일자\s*:\s*(\d{4})\.(\d{1,2})\.(\d{1,2})/);
    const newFormatted = `${newMatch![1]}.${newMatch![2]}.${newMatch![3]}`;
    expect(newFormatted).toBe(expectedContentDate);

});