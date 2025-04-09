import { test, expect,Page,Locator } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
import { randomUUID } from 'crypto';

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const senarioName = '[17. 대시보드 환자 정보 확인]';

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page,adminID,adminPW);
  await page.waitForTimeout(2000);
  const loadingLocator = page.locator('.absolute').first();
  await expect(loadingLocator).not.toBeVisible({timeout: 10000}); //대시보드 노출 대기
});


async function getColumnIndex(page, headerName: string): Promise<number> {
    const headers = await page.locator('table thead tr th').allTextContents();
    const index = headers.findIndex(h => h.trim().includes(headerName));
    return index >= 0 ? index + 1 : -1; // nth-child는 1-based
}

function calculateAgeFromBirthDate(birthDateString: string): string {
    const birthDate = new Date(birthDateString);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
  
    const birthdayPassed =
      now.getMonth() > birthDate.getMonth() ||
      (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
  
    if (!birthdayPassed) age--;
  
    return age.toString(); // UI 쪽과 비교 위해 문자열로 반환
}

function formatDbDateToUiDate(dbDate: string | Date): string {
  const date = new Date(dbDate);
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const yy = String(kstDate.getFullYear()).slice(2); // 년도
  const mm = String(kstDate.getMonth() + 1).padStart(2, '0'); // 월
  const dd = String(kstDate.getDate()).padStart(2, '0'); // 일
  return `${yy}.${mm}.${dd}`; // yy.mm.dd
}

function encryptText(value: string) { //암호화 함수
  return `TO_BASE64(AES_ENCRYPT('${value}', @secretkey, @iv))`;
}
  

test('대시보드 환자 정보 확인', async ({ page }) => {
    // UI 환자 정보 추출
    const uiPatient = await extractUiPatientInfo(page);

    console.log('[UI 환자 정보]', uiPatient);

    // DB 환자 정보-patient info 추출
    const dbPatientInfo = await getPatientInfoFromDB(uiPatient.id);
    const dbPatientAge = await calculateAgeFromBirthDate(dbPatientInfo.birth_date);
    
    //DB 환자 정보-ward,room,bed,dept,physician,admission date
    const dbPatientWard = await getPatientWardFromDB(uiPatient.id);

    // UI-DB 환자 정보 비교
    expect(uiPatient.name).toBe(dbPatientInfo.name); // 환자 이름 비교
    expect(uiPatient.id).toBe(dbPatientInfo.id); // 환자 id 비교
    expect(uiPatient.gender).toBe(dbPatientInfo.sex); // 환자 성별 비교
    expect(uiPatient.age).toBe(dbPatientAge); // 환자 나이 비교

    expect(uiPatient.ward).toBe(dbPatientWard.ward); //환자 ward 비교
    expect(uiPatient.room).toBe(dbPatientWard.room); //환자 room 비교
    expect(uiPatient.bed).toBe(dbPatientWard.bed); //환자 bed 비교

    expect(uiPatient.department).toBe(dbPatientWard.department); //환자 department 비교
    expect(uiPatient.physicianName).toBe(dbPatientWard.physician); //환자 physician 비교
    expect(uiPatient.admissionDate).toBe(dbPatientWard.admissionDate);  //환자 admission date 비교

});

test('대시보드 환자 정보 업데이트 확인', async ({ page }) => {
  // UI 환자 정보 추출
  const uiBefore = await extractUiPatientInfo(page);
  const patientId = uiBefore.id;

  await executeQuery(`
    UPDATE vitalcare.emr_patient
    SET
      encrypted_name = TO_BASE64(AES_ENCRYPT('테스트환자', @secretkey, @iv)),
      encrypted_sex = TO_BASE64(AES_ENCRYPT('M', @secretkey, @iv)),
      encrypted_birth_date = TO_BASE64(AES_ENCRYPT('1988-08-08', @secretkey, @iv))
    WHERE CAST(AES_DECRYPT(FROM_BASE64(encrypted_emr_id), @secretkey, @iv) AS CHAR) = '${patientId}';
  `);

  await executeQuery(`
    UPDATE vitalcare.emr_encounter
    SET
      admission_dt = '2025-03-31 14:00:00',
      department_id = 'TEST',
      practitioner_id = 'test'
    WHERE CAST(AES_DECRYPT(FROM_BASE64(encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}';
  `);

  await executeQuery(`
    UPDATE vitalcare.emr_encounter
    SET location_id_ope = (
      SELECT emr_id_ope
      FROM vitalcare.emr_location
      ORDER BY updated_dt DESC
      LIMIT 1
    )
    WHERE id = (
      SELECT id FROM (
        SELECT id FROM vitalcare.emr_encounter
        WHERE CAST(AES_DECRYPT(FROM_BASE64(encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
        ORDER BY updated_dt DESC
        LIMIT 1
      ) AS latest
    );
  `);

  await page.reload();
  await page.waitForTimeout(1500);

  const uiAfter = await extractUiPatientInfo(page);

  const dbPatient = await getPatientInfoFromDB(patientId);// DB 환자 정보-patient info 추출
  const dbPatientWard = await getPatientWardFromDB(patientId);//DB 환자 정보-ward,room,bed,dept,physician,admission date
  const expectedAge = calculateAgeFromBirthDate(dbPatient.birth_date);

  // UI-DB 환자 정보 비교
  expect(uiAfter.name).toBe(dbPatient.name); // 환자 이름 비교
  expect(uiAfter.id).toBe(dbPatient.id); // 환자 id 비교
  expect(uiAfter.gender).toBe(dbPatient.sex); // 환자 성별 비교
  expect(uiAfter.age).toBe(expectedAge); // 환자 나이 비교

  expect(uiAfter.ward).toBe(dbPatientWard.ward); //환자 ward 비교
  expect(uiAfter.room).toBe(dbPatientWard.room); //환자 room 비교
  expect(uiAfter.bed).toBe(dbPatientWard.bed); //환자 bed 비교

  expect(uiAfter.department).toBe(dbPatientWard.department); //환자 department 비교
  expect(uiAfter.physicianName).toBe(dbPatientWard.physician); //환자 physician 비교
  expect(uiAfter.admissionDate).toBe(dbPatientWard.admissionDate);  //환자 admission date 비교

});



test.describe('병동 정보 누락 시 UI 표시 확인', () => {
  test(`필드 "-" 처리 후 표시 확인`, async ({ page }) => {
    const info = await extractUiPatientInfo(page);
    const patientId = info.id;

    console.log(`${patientId}`);

    const originalWard = info.ward;
    const originalRoom = info.room;
    const originalBed = info.bed;
    const testCases = ['ward', 'room', 'bed'];

    
    for (const field of testCases) {
      let updateSQL = '';
      if (field === 'ward') {
        updateSQL = `loc.ward = ''`;
      } else if (field === 'room') {
        updateSQL = `loc.room = TO_BASE64(AES_ENCRYPT('', @secretkey, @iv))`;
      } else if (field === 'bed') {
        updateSQL = `loc.bed = TO_BASE64(AES_ENCRYPT('', @secretkey, @iv))`;
      }

      // 필드 업데이트 쿼리 실행
      await executeQuery(`
        UPDATE vitalcare.emr_location loc
        JOIN (
          SELECT location_id_ope
          FROM vitalcare.emr_encounter
          WHERE CAST(AES_DECRYPT(FROM_BASE64(encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
          ORDER BY updated_dt DESC
          LIMIT 1
        ) AS e ON e.location_id_ope = loc.emr_id_ope
        SET ${updateSQL};
      `);

      // UI 새로고침 후 확인
      await page.reload();
      await page.waitForTimeout(3000);

      const updated = await extractUiPatientInfo(page);

      const expected = [
        field === 'ward' ? '' : originalWard,
        field === 'room' ? ' ' : originalRoom,
        field === 'bed' ? '' : originalBed,
      ].join('-');

      const actual = `${updated.ward}-${updated.room}-${updated.bed}`;

      expect(actual).toBe(expected);

      //원래 데이터로 복원
      await executeQuery(`
        UPDATE vitalcare.emr_location loc
        JOIN (
          SELECT location_id_ope
          FROM vitalcare.emr_encounter
          WHERE CAST(AES_DECRYPT(FROM_BASE64(encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
          ORDER BY updated_dt DESC
          LIMIT 1
        ) AS e ON e.location_id_ope = loc.emr_id_ope
        SET
          loc.ward = '${originalWard}',
          loc.room = TO_BASE64(AES_ENCRYPT('${originalRoom}', @secretkey, @iv)),
          loc.bed = TO_BASE64(AES_ENCRYPT('${originalBed}', @secretkey, @iv));
      `);
    }
  })
});


async function extractUiPatientInfo(page): Promise<{
    name: string;
    gender: string;
    age: string;
    id: string;
    ward: string;
    room: string;
    bed: string;
    admissionDate: string;
    department: string;
    physicianName: string;
  }> {
  
    const patientInfoIndex = await getColumnIndex(page, 'Patient info');
    const locationIndex = await getColumnIndex(page, 'Location');
    const deptIndex = await getColumnIndex(page, 'Dept');
    const physicianIndex = await getColumnIndex(page, 'Physician');
  
    const firstRow = page.locator('tbody tr').first();
  
    // Patient Info 추출
    const patientInfoText = await firstRow.locator(`td:nth-child(${patientInfoIndex})`).innerText();
    const lines = patientInfoText.split('\n').map(line => line.trim()).filter(Boolean);
    const name = lines[0]; //이름
    const genderAge = lines[1].replace(/[()]/g, '').split('/');
    const gender = genderAge[0]; //성별
    const age = genderAge[1]; //나이
    const id = lines[2]; //id
  
    // Location 추출
    const locationText = await firstRow.locator(`td:nth-child(${locationIndex})`).innerText();
    const locationLines = locationText.split('\n').map(line => line.trim()).filter(Boolean);
    const [ward, room, bed] = locationLines[0].split('-'); // ward, room ,bed
    const admissionDate = locationLines[1].split(' ')[0];
  
    // Dept 추출
    const department = await firstRow.locator(`td:nth-child(${deptIndex})`).innerText();
  
    // Physician 추출
    const physicianName = await firstRow.locator(`td:nth-child(${physicianIndex})`).innerText();
  
    return {
      id,
      name,
      gender,
      age,
      ward,
      room,
      bed,
      admissionDate,
      department: department.trim(),
      physicianName: physicianName.trim(),
    };
  }
  

async function getPatientInfoFromDB(patientId: string): Promise<{
    id: string;
    name: string;
    sex: string;
    birth_date: string;
  }> {
  const result = await executeQuery(
      `
      SELECT
        CAST(AES_DECRYPT(FROM_BASE64(ep.encrypted_emr_id), @secretkey, @iv) AS CHAR) AS id,
        CAST(AES_DECRYPT(FROM_BASE64(ep.encrypted_name), @secretkey, @iv) AS CHAR) AS name,
        CAST(AES_DECRYPT(FROM_BASE64(ep.encrypted_sex), @secretkey, @iv) AS CHAR) AS sex,
        CAST(AES_DECRYPT(FROM_BASE64(ep.encrypted_birth_date), @secretkey, @iv) AS CHAR) AS birth_date
      FROM vitalcare.emr_patient ep
      WHERE CAST(AES_DECRYPT(FROM_BASE64(ep.encrypted_emr_id), @secretkey, @iv) AS CHAR) = '${patientId}';
      `
    );
  const row = result?.[0];

  if (!row) {
    throw new Error(`DB에서 환자 정보(${patientId})를 찾을 수 없습니다.`);
  }

  return {
    id: row.id,
    name: row.name,
    sex: row.sex,
    birth_date: row.birth_date,
  };
}

async function getPatientWardFromDB(patientId: string): Promise<{
  ward: string;
  room: string;
  bed: string;
  department: string;
  physician: string;
  admissionDate: string;
  }> {
  const result = await executeQuery(
      `
      SELECT
          loc.ward AS ward,
          CAST(AES_DECRYPT(FROM_BASE64(loc.room), @secretkey, @iv) AS CHAR) AS room,
          CAST(AES_DECRYPT(FROM_BASE64(loc.bed), @secretkey, @iv) AS CHAR) AS bed,
          d.name AS department,
          CAST(AES_DECRYPT(FROM_BASE64(p.encrypted_name), @secretkey, @iv) AS CHAR) AS physician,
          e.admission_dt
      FROM vitalcare.emr_patient ep
      JOIN vitalcare.emr_encounter e
      ON CAST(AES_DECRYPT(FROM_BASE64(ep.encrypted_emr_id), @secretkey, @iv) AS CHAR) = '${patientId}'
      AND CAST(AES_DECRYPT(FROM_BASE64(e.encrypted_patient_id), @secretkey, @iv) AS CHAR) = '${patientId}'
      JOIN vitalcare.emr_location loc ON loc.emr_id_ope = e.location_id_ope
      JOIN vitalcare.emr_department d ON d.code = e.department_id
      JOIN vitalcare.emr_practitioner p ON p.code = e.practitioner_id
      ORDER BY e.updated_dt DESC;
      `
      );
  const row = result?.[0];

  if (!row) {
  throw new Error(`DB에서 환자 병동 정보(${patientId})를 찾을 수 없습니다.`);
  }

  const formattedAdmissionDate = formatDbDateToUiDate(row.admission_dt);

  return {
      ward: row.ward,
      room: row.room,
      bed: row.bed,
      department: row.department,
      physician: row.physician,
      admissionDate: formattedAdmissionDate
  };
}

test.afterAll(async ({}) => {
    await closeConnection();
});