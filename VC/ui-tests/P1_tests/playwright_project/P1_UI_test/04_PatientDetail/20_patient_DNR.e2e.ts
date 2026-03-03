import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { isModalOpen,isModalClosed } from '../../playwright/fixture/util.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[20. 환자 상세 DNR 설정 확인]';

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

test('DNR 설정 확인', async ({ page }) => {
    const table = page.locator('table');
    const headers = await table.locator('thead tr th').allTextContents();
    const locationIndex = headers.indexOf('Location') + 1;
    const patientInfoIndex = headers.indexOf('Patient info') + 1;

    const firstRow = page.locator('tbody tr').first();
   
    await firstRow.locator(`td:nth-child(${locationIndex})`).click(); // 환자 row 클릭
    await page.waitForTimeout(1000);
  
    const DNRtoggle = page.getByRole('switch');
    const getDnrState = async () => await DNRtoggle.getAttribute('aria-checked');
  
    const initialState = await getDnrState();
  
    if (initialState === 'true') {
      console.log('✅ 현재 DNR: ON (등록됨)');
        
      // 1) 해제 시도 → 아니오
      await DNRtoggle.click();
      await page.getByRole('button', { name: '아니오' }).click();
      await page.waitForTimeout(500);
  
      // 2) 해제 진행 → 예
      await DNRtoggle.click();
      await page.getByRole('button', { name: '예' }).click();
      await page.waitForTimeout(1000);
  
      // ✅ 상태 검증
      const afterOff = await getDnrState();
      expect(afterOff).toBe('false');
      console.log('🗑️ DNR 해제 완료 (상태 확인)');

      let DNRBedge = await expectDnrBadgeVisible(page, patientInfoIndex);
      if (!DNRBedge){console.log('DNR 뱃지 미표시');}
  
    } else {
      console.log('✅ 현재 DNR: OFF (미등록)');
  
      // 1) 등록 시도 → 취소
      await DNRtoggle.click();
      await page.getByRole('button', { name: '취소' }).click();
      await page.waitForTimeout(500);
  
      // 2) 등록 진행
      await DNRtoggle.click();
      await page.getByRole('checkbox', { name: '별지 제1호서식 확인' }).click();
      await page.getByRole('button', { name: '등록' }).click();
      await page.waitForTimeout(1000);
      await expect(page.getByText('DNR환자로 등록했습니다.')).toBeVisible();
  
      // ✅ 등록 상태 검증
      const afterOn = await getDnrState();
      expect(afterOn).toBe('true');
      console.log('🆕 DNR 등록 완료 (상태 확인)');

      let DNRBedge = await expectDnrBadgeVisible(page, patientInfoIndex);
      if (DNRBedge){console.log('DNR 뱃지 표시');}
    }

    await page.getByRole('button', { name: 'DNR change history' }).click();//변경이력 클릭
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Close' }).click(); //변경이력 모달 닫기

  });


  async function expectDnrBadgeVisible(page: Page, patientInfoIndex: number): Promise<boolean>{
    await page.getByRole('button', { name: 'icon-close' }).click();// 환자 상세 닫기
    await page.waitForTimeout(500);

    const firstRow = page.locator('tbody tr').first();
    const patientInfoText = await firstRow.locator(`td:nth-child(${patientInfoIndex})`).innerText();
    const tokens = patientInfoText.trim().split(/\s+/);
    const hasBadge = tokens[0] === 'D';
    
    return hasBadge;
  }
  