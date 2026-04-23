import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { isModalOpen,isModalClosed } from '../../playwright/fixture/util.js';
test.describe.configure({ mode: 'serial' }); // 테스트를 순차적으로 실행하도록 설정

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[06. Screened - 대시보드 다운로드 확인]';

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

test('대시보드 다운로드 사유 모달 확인', async ({ page }) => {
    const dashboardDownload = page.getByRole('button', { name: 'icon-download Download' }) // 대시보드 다운로드 버튼
    await dashboardDownload.click();
    await page.waitForTimeout(1000);

    const modalOpened = await isModalOpen(page);
    expect(modalOpened).toBe(true); // 모달 표시 확인
    const dimmedOverlay = page.locator('div[data-state="open"][aria-hidden="true"]');
    await expect(dimmedOverlay).toBeVisible(); //모달 외 영역 딤드 처리 확인
    await screenShot(page,senarioName,'1. 대시보드 다운로드 모달 오픈 확인');
    console.log('✅ 대시보드 다운로드 모달 오픈 확인');

    await expect(page.getByText('회진용')).toBeVisible();//다운로드 사유 옵션 확인
    await expect(page.getByText('의무기록용')).toBeVisible();
    await expect(page.getByText('제출용')).toBeVisible();
    await expect(page.getByText('직접 입력')).toBeVisible();
    
    const downloadButton = page.getByRole('button', { name: '다운로드' });
    await expect(downloadButton).toBeDisabled(); //다운로드 버튼 비활성화 확인
    await screenShot(page,senarioName,'2. 다운로드 버튼 비활성화 확인');

    await page.getByRole('button', { name: '취소' }).click();
    const modalClosed = await isModalClosed(page);
    expect(modalClosed).toBe(true); // 다운로드 모달 닫힘 확인
    await page.waitForTimeout(500);
    await screenShot(page,senarioName,'3. 다운로드 모달 닫힘 확인');
    console.log('✅ 대시보드 다운로드 옵션 확인');

    await dashboardDownload.click();
    await page.waitForTimeout(1000);

    const reasons = ['회진용', '의무기록용', '제출용'];

    for (let i = 0; i < reasons.length; i++) { // 다운로드 옵션 클릭
        const radio = page.getByRole('radio', { name: reasons[i] });
        await radio.click();
        await page.waitForTimeout(500);
        await expect(radio).toBeChecked();
        await screenShot(page,senarioName,`${i + 4}. ${reasons[i]} on 확인`);
        console.log(`✅ 대시보드 다운로드 옵션 ${reasons[i]} 확인`);
    }

    // '직접 입력' 클릭 → 선택 상태 + 입력 필드 활성화 확인
    const directInputRadio = page.getByRole('radio', { name: '직접 입력' });
    await directInputRadio.click();
    await page.waitForTimeout(500);
    await expect(directInputRadio).toBeChecked();
    await screenShot(page,senarioName,'7. 직접입력 on 확인');
    console.log('✅ 대시보드 다운로드 옵션 직접입력 확인');

    // const alertCheck = page.getByRole('checkbox', { name: '동시 알람이력 다운로드' })
    // await alertCheck.click();
    // await page.waitForTimeout(500);
    // await expect(alertCheck).toBeChecked(); // 동시알람 체크 확인
    // await screenShot(page,senarioName,'동시 알람 이력 체크 확인');
    // console.log('✅ 대시보드 다운로드 옵션 동시 알람 이력 체크 확인');

    // await page.getByRole('button', { name: '다운로드' }).click(); //다운로드 진행
    // await page.waitForTimeout(1000);
    // await screenShot(page,senarioName,'대시보드 다운로드 진행');

});