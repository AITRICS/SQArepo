import { test, expect } from '@playwright/test';
import { screenShot } from '../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../playwright/fixture/login.js';
import globalSetup from '../playwright/playwright.globalSetup.js';
import axios from 'axios';
import { executeQuery, closeConnection } from '../playwright/fixture/setDatabase.js';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[12. 대시보드 스코어 데이터 확인]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});

test('대시보드 스코어 확인', async({ page }) => {
  const allTypes = ['CAPS', 'MAES', 'SEPS', 'MORS', 'MEWS', 'NEWS']; //확인할 스코어 type
  const { patientId, scoreType, scoreValue } = await setScore(); // 확인할 환자 id, type, value 추출

  const row = page.locator(`tr:has(p:has-text("${patientId}"))`); // 환자 row 확인

  { //origin type과 value 확인
    const ths = page.locator('thead tr th');
    const thCount = await ths.count();
    let originalColumnIndex: number | null = null; //type 컬럼 인덱스
  
    for (let i = 0; i < thCount; i++) { //type 컬럼 인덱스 확인
      const text = await ths.nth(i).innerText();
      if (text.trim().toLowerCase().includes(scoreType.toLowerCase())) {
        originalColumnIndex = i;
        break;
      }
    }
  
    if (originalColumnIndex === null) {
      throw new Error(`❌ 기존 type '${scoreType}' 컬럼을 찾을 수 없음`);
    }
  
    const scoreCell = row.locator('td').nth(originalColumnIndex);
    await expect(scoreCell).toHaveText(scoreValue.toString()); //해당 type의 value 확인
    console.log(`✅ [초기 확인] '${scoreType}' 타입에 '${scoreValue}' 값 잘 표시됨`);
  }

  let currentType = scoreType;

  const typesToTest = allTypes.filter(t => t !== scoreType); //origin type 제외하고 type 확인

  for (const type of typesToTest) {
    await updateScoreType(patientId, currentType, type); //score type 변경
    await page.reload();//페이지 리로드
    await page.waitForTimeout(2000); //대시보드 대기
    const loadingLocator = page.locator('.absolute').first();
    await expect(loadingLocator).not.toBeVisible({timeout: 10000}); 

    const ths = page.locator('thead tr th');
    const thCount = await ths.count();
    let columnIndex: number | null = null;

    for (let i = 0; i < thCount; i++) { //컬럼 인덱스 확인
      const text = await ths.nth(i).innerText();
      if (text.trim().toLowerCase().includes(type.toLowerCase())) {
        columnIndex = i;
        break;
      }
    }
    
    if (columnIndex === null) throw new Error(`❌ '${type}' 컬럼 못 찾음`);
    console.log(`👉 [${type}] 기대 값: ${scoreValue}`);
    const scoreCell = row.locator('td').nth(columnIndex);

    // await expect(scoreCell).toHaveText(scoreValue.toString()); //value 확인

    await expect(scoreCell).toHaveText(scoreValue.toString(), {
      timeout: 3000
    }).catch(async () => {
      const actual = (await scoreCell.textContent())?.trim();
      console.error(`❌ '${type}' 값 불일치! 기대: ${scoreValue}, 실제: ${actual}`);
      throw new Error(`[${type}] UI 값 검증 실패`);
    });
    console.log(`✅ '${type}' 타입으로 변경 후 UI 값 확인 완료`);

    currentType=type;
    
  }
});

async function setScore(): Promise<any> {
  const row = await executeQuery(
      `
       WITH filtered_patients AS (
          SELECT DISTINCT
            CAST(AES_DECRYPT(FROM_BASE64(as2.encrypted_patient_id), @secretkey, @iv) AS CHAR) AS patient_id
          FROM
            vitalcare.emr_encounter ee
          JOIN
            vitalcare.api_screeningrecord as2 ON ee.encrypted_emr_id = as2.encrypted_encounter_id
          JOIN
            vitalcare.emr_patient ep ON ee.encrypted_patient_id = ep.encrypted_emr_id
          WHERE
            ee.status IN ('screened', 'observing')
            AND CAST(AES_DECRYPT(FROM_BASE64(ep.encrypted_birth_date), @secretkey, @iv) AS DATE) <= NOW() - INTERVAL 19 YEAR
            AND ee.discharge_dt IS NULL
            AND ep.death_dt IS NULL
            AND as2.screened_dt > NOW() - INTERVAL 24 HOUR
        ),
        latest_screening AS (
          SELECT
            CAST(AES_DECRYPT(FROM_BASE64(asr.encrypted_patient_id), @secretkey, @iv) AS CHAR) AS patient_id,
            asr.type,
            asr.value,
            asr.screened_dt,
            ROW_NUMBER() OVER (
              PARTITION BY CAST(AES_DECRYPT(FROM_BASE64(asr.encrypted_patient_id), @secretkey, @iv) AS CHAR)
              ORDER BY asr.screened_dt DESC
            ) AS rn
          FROM
            vitalcare.api_screeningrecord asr
          WHERE
            asr.screened_dt > NOW() - INTERVAL 24 HOUR
            AND asr.screened_dt <= UTC_TIMESTAMP()         
            AND asr.policy_desc IS NOT NULL
            AND asr.policy_desc != ''
        ),
        screening_with_score AS (
          SELECT 
            ls.patient_id,
            ls.type,
            ls.value,
            ls.screened_dt
          FROM 
            latest_screening ls
          JOIN 
            filtered_patients fp ON fp.patient_id = ls.patient_id
          WHERE 
            ls.rn = 1
            AND EXISTS (
              SELECT 1
              FROM vitalcare.emr_score es
              WHERE 
                CAST(AES_DECRYPT(FROM_BASE64(es.encrypted_patient_id), @secretkey, @iv) AS CHAR) = ls.patient_id
              AND es.base_dt <= UTC_TIMESTAMP()
            )
        )
        SELECT patient_id
        FROM screening_with_score
        ORDER BY screened_dt DESC
        LIMIT 1;
      `
    );

  const patientId = row?.[0]?.patient_id;
  console.log('[환자 ID]', patientId);

  if (!patientId) {
    throw new Error('환자 ID를 찾을 수 없습니다.');
  }

  const scoreRow = await executeQuery(
      `
      SELECT es.type, es.value
      FROM vitalcare.emr_score es
      WHERE CAST(AES_DECRYPT(FROM_BASE64(es.encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
      AND es.deleted = 0
      AND es.base_dt <= UTC_TIMESTAMP()
      ORDER BY es.base_dt DESC
      LIMIT 1;
      `
  );

  const score = scoreRow?.[0];    

  if (score) {
    console.log('[Score Type]:', score.type);
    console.log('[Score Value]:', score.value);

  return {
      patientId,
      scoreType: score.type,
      scoreValue: score.value
    };
  } else {
    throw new Error('해당 환자의 emr_score 데이터를 찾을 수 없습니다.');
  }
};

export async function updateScoreType(patientId: string, fromType: string, toType: string) {
  await executeQuery(
    `
    UPDATE vitalcare.emr_score
    SET type = '${toType}'
    WHERE CAST(AES_DECRYPT(FROM_BASE64(encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
      AND type = '${fromType}'
      AND deleted = 0
    ORDER BY base_dt DESC
    LIMIT 1;
    `
  );
}


test.afterAll(async ({}) => {
  await closeConnection();
});