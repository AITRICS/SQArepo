import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { isModalOpen,isModalClosed } from '../../playwright/fixture/util.js';

import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[22. 환자 상세 스코어 테이블 확인]';

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

async function extractUiScoreTable(page: Page): Promise<Record<string, string[]>> {
  const table = page.locator('section').nth(2);
  const rows = table.locator('tbody tr');

  const scoreTypes = ['CAPS', 'MAES', 'SEPS', 'MORS', 'NEWS', 'MEWS'];
  const scores: Record<string, string[]> = {};

  for (const type of scoreTypes) {
    const row = rows.filter({ hasText: type });
    const cells = await row.locator('td').allTextContents();
    scores[type] = cells.map(cell => cell.trim()).filter(v => v !== '-');
  }
  // console.log(`ui score:\n${JSON.stringify(scores, null, 2)}`);
  return scores;
}

async function getLatestScoresFromDB(patientId: string): Promise<Record<string, { id: string; value: number }>> {
  const result = await executeQuery(`
    SELECT CAST(id AS CHAR) AS id,type, value
    FROM vitalcare.emr_score
    WHERE CAST(AES_DECRYPT(FROM_BASE64(encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
    AND deleted = 0
    AND base_dt = (
      SELECT MAX(base_dt)
      FROM vitalcare.emr_score
      WHERE CAST(AES_DECRYPT(FROM_BASE64(encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
    )
    AND updated_dt = (
      SELECT MAX(updated_dt)
      FROM vitalcare.emr_score AS sub
      WHERE sub.type = vitalcare.emr_score.type
      AND CAST(AES_DECRYPT(FROM_BASE64(sub.encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
    )
  `);

  const scoreMap: Record<string, { id: string; value: number }> = {};
  for (const row of result) {
    scoreMap[row.type] = { id: row.id, value: Number(row.value) };
  }
  
  // console.log(`db score: ${JSON.stringify(scoreMap)}`);
  return scoreMap;
}

function convertUtcToKst(utcDateStr: string): string {
  const utc = new Date(utcDateStr + 'Z');
  const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getMonth() + 1}/${String(kst.getDate()).padStart(2, '0')} ${String(kst.getHours()).padStart(2, '0')}:${String(kst.getMinutes()).padStart(2, '0')}`;
}

async function revertScoreType(id: string, originalType: string) {
  await executeQuery(`
    UPDATE vitalcare.emr_score
    SET type = '${originalType}'
    WHERE id = '${id}'
    LIMIT 1;
  `);
}

test('환자 상세 스코어 테이블 확인', async ({ page }) => {
  const table = page.locator('table');
  const headers = await table.locator('thead tr th').allTextContents();
  const locationIndex = headers.indexOf('Location') + 1;
  const patientInfoIndex = headers.indexOf('Patient info') + 1;

  const firstRow = page.locator('tbody tr').first();

  const patientInfoText = await firstRow.locator(`td:nth-child(${patientInfoIndex})`).innerText();
  const lines = patientInfoText.split('\n').map(line => line.trim()).filter(Boolean);
  const patientId = lines[2]; //환자 id 추출

  // console.log(`patient id: ${patientId}`);

  await firstRow.locator(`td:nth-child(${locationIndex})`).click(); // 환자 row 클릭
  await page.waitForTimeout(3000);

  const allTypes = ['CAPS', 'MAES', 'SEPS', 'MORS', 'NEWS', 'MEWS'];
  const uiScores = await extractUiScoreTable(page); //ui 스코어 테이블 추출
  const dbScores = await getLatestScoresFromDB(patientId); //db 스코어 추출

  for (const type of allTypes) {
    const uiValues = uiScores[type] || [];
    const uiLatest = uiValues[uiValues.length - 1]; //가장 최근 값만 추출
    const dbEntry = dbScores[type];

    if (dbEntry?.value !== undefined) { //스코어 있으면 비교 진행
      console.log(`${type} | UI: ${uiLatest} - DB: ${dbEntry.value}`);
      expect(uiLatest).toBe(dbEntry.value.toString());
    }
    else {
      // DB에 없는 경우, 기존 스코어 하나의 type을 임시로 변경
      const existingType = Object.keys(dbScores)[0];
      const { id: targetId, value: targetValue } = dbScores[existingType];

      // type 변경
      await executeQuery(`
        UPDATE vitalcare.emr_score
        SET type = '${type}'
        WHERE id = ${targetId};
      `);

      await page.getByRole('button', { name: 'icon-close' }).click();// 환자 상세 닫기
      await page.waitForTimeout(500);
      await firstRow.locator(`td:nth-child(${locationIndex})`).click(); // 환자 row 클릭
      await page.waitForTimeout(3000);

      const updatedUiScores = await extractUiScoreTable(page);
      const newUiValues = updatedUiScores[type] || [];
      expect(newUiValues.map(v => v.toString())).toContain(targetValue.toString());
      console.log(`${type} | UI: ${newUiValues} - DB: ${targetValue}`);

      await revertScoreType(targetId, existingType);
    }

  }

});

test.afterAll(async ({}) => {
  await closeConnection();
});