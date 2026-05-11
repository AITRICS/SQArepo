import { test, expect, Page, Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin';
const adminPW = process.env.ADMINPW || 'defaultAdmin!';

const senarioName = '[12. 대시보드 스코어 데이터 확인]';

const SCORE_TYPES = ['CARED', 'MAES', 'SEPS', 'MORS', 'NEWS', 'MEWS'];

test.beforeEach(async ({ page }) => {
  test.setTimeout(0);
  await page.goto('/ko/login');
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

// ========== 헬퍼 ==========

async function getColIndex(page: Page, colName: string): Promise<number> {
  const headers = await page.locator('table thead tr th').allTextContents();
  const idx = headers.findIndex(h => h.trim().toLowerCase().includes(colName.toLowerCase()));
  if (idx < 0) throw new Error(`Column not found: ${colName}`);
  return idx + 1;
}

// 대시보드 UI에서 해당 환자 row의 스코어 type:value 추출
async function getScoresFromUI(page: Page, row: Locator): Promise<Record<string, string>> {
  const ths = page.locator('thead tr th');
  const thCount = await ths.count();
  const scores: Record<string, string> = {};

  for (const type of SCORE_TYPES) {
    for (let i = 0; i < thCount; i++) {
      const text = (await ths.nth(i).innerText()).trim().toLowerCase();
      if (text.includes(type.toLowerCase())) {
        const value = ((await row.locator('td').nth(i).textContent()) ?? '').trim();
        if (value) scores[type] = value;
        break;
      }
    }
  }
  return scores;
}

// DB emr_score에서 해당 환자의 type별 최신 value 추출
async function getScoresFromDB(patientId: string): Promise<Record<string, string>> {
  const rows = await executeQuery(`
    SELECT es.type, es.value
    FROM vitalcare.emr_score es
    WHERE CAST(AES_DECRYPT(FROM_BASE64(es.encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
      AND es.deleted = 0
      AND es.type IN ('CARED', 'MAES', 'SEPS', 'MORS', 'NEWS', 'MEWS')
      AND es.base_dt <= UTC_TIMESTAMP()
      AND es.base_dt = (
        SELECT MAX(es2.base_dt)
        FROM vitalcare.emr_score es2
        WHERE CAST(AES_DECRYPT(FROM_BASE64(es2.encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
          AND es2.deleted = 0
          AND es2.type = es.type
          AND es2.base_dt <= UTC_TIMESTAMP()
      )
  `);

  const scores: Record<string, string> = {};
  for (const row of (rows ?? [])) {
    scores[row.type] = String(row.value);
  }
  return scores;
}

// ========== 테스트 ==========

test('대시보드 스코어 확인', async ({ page }) => {
  const patientInfoIndex = await getColIndex(page, 'Patient info');
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();

  let targetPatientId: string | null = null;
  let targetRow: Locator | null = null;
  let dbScores: Record<string, string> = {};

  // Step 1: 대시보드 row 순서대로 스코어 데이터 있는 환자 탐색
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const patientId = ((await row.locator(`td:nth-child(${patientInfoIndex}) button > p`).innerText()) ?? '').trim();
    if (!patientId) continue;

    const scores = await getScoresFromDB(patientId);
    if (Object.keys(scores).length > 0) {
      targetPatientId = patientId;
      targetRow = row;
      dbScores = scores;
      console.log(`[대상 환자] ${patientId} / DB 스코어 타입: ${Object.keys(scores).join(', ')}`);
      break;
    }
    console.log(`ℹ️ [row ${i + 1}] ${patientId} 스코어 없음 → 다음 row`);
  }

  if (!targetPatientId || !targetRow) {
    throw new Error('스코어 데이터가 있는 환자를 찾을 수 없습니다.');
  }

  // Step 2: 대시보드 UI에서 스코어 추출
  const uiScores = await getScoresFromUI(page, targetRow);
  console.log(`[UI 스코어] ${JSON.stringify(uiScores)}`);
  console.log(`[DB 스코어] ${JSON.stringify(dbScores)}`);

  // Step 3: UI 값과 DB 값 비교
  for (const type of SCORE_TYPES) {
    if (!(type in dbScores)) {
      console.log(`ℹ️ '${type}' DB 스코어 없음 - 건너뜀`);
      continue;
    }

    const dbValue = dbScores[type];
    const uiValue = uiScores[type] ?? '';

    expect(uiValue).toBe(dbValue);
    console.log(`✅ '${type}': UI=${uiValue} / DB=${dbValue} 일치`);
  }

  await screenShot(page, senarioName, '1. 대시보드 스코어 확인');
});

test.afterAll(async () => {
  await closeConnection();
});
