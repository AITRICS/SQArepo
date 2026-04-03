import { test, expect } from '@playwright/test';
import { screenShot } from '../../playwright/fixture/screenshot.js';
import * as dotenv from 'dotenv';
import { login } from '../../playwright/fixture/login.js';
import { executeQuery, closeConnection } from '../../playwright/fixture/setDatabase.js';
test.describe.configure({ mode: 'serial' });

dotenv.config();

const adminID = process.env.ADMINID || 'defaultAdmin'
const adminPW = process.env.ADMINPW || 'defaultAdmin!'

const tooltipTemplates = {
  CARED: (val: number) => `24시간 이내에 일반병동에서의 심정지 발생 위험도 예측 스코어 (CARED ≥ ${val})`,
  MAES: (val: number) => `6시간 이내에 일반병동에서의 급성 중증이벤트(심정지, 예기치않은 ICU Transfer, 사망) 발생 위험도 예측 스코어 (MAES ≥ ${val})`,
  SEPS: (val: number) => `4시간 이내에 일반병동에서의 패혈증 발생 위험도 예측 스코어 (SEPS ≥ ${val})`,
  MORS: (val: number) => `6시간 이내에 중환자실에서의 급성 상태악화(사망) 위험도 예측 스코어 (MORS ≥ ${val})`,
};

const senarioName = '[Reviewed - 대시보드 툴팁 확인]'

test.beforeEach(async ({page}) => {
  test.setTimeout(0);
  await page.goto('/ko/login')
  await login(page, adminID, adminPW);
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
  await page.getByRole('tab', { name: 'Reviewed' }).click();
  await page.waitForTimeout(2000);
  await expect(page.locator('.absolute').first()).not.toBeVisible({ timeout: 10000 });
});

test('대시보드 컬럼 툴팁 확인', async ({ page }) => {
  await getText(page, 'CARED');
  await getText(page, 'MAES');
  await getText(page, 'SEPS');
  await getText(page, 'MORS');
});

async function getText(page, scoreName: string): Promise<void> {
  await page.mouse.click(0, 0);
  await page.waitForTimeout(1000);

  const scoreCoV = await getValue(scoreName);
  const expectedText = tooltipTemplates[scoreName](scoreCoV);

  const column = page.getByRole('button', { name: scoreName });
  await column.hover();
  await page.waitForTimeout(500);

  const tooltip = page.getByText(new RegExp(`${scoreName}\\s*≥\\s*${scoreCoV}`));
  const actualText = (await tooltip.textContent())?.replace(/\n/g, '').trim() ?? '';
  expect(actualText).toBe(expectedText);

  await screenShot(page, senarioName, `${scoreName} 툴팁 확인`);
  console.log(`✅ ${scoreName} 툴팁 확인`);
}

async function getValue(subcategory: string): Promise<number> {
  const row = await executeQuery(
    `SELECT CAST(REGEXP_SUBSTR(policy_desc, '[0-9]+') AS UNSIGNED) AS number_value
     FROM vitalcare.api_screening_policy
     WHERE subcategory = '${subcategory}';`
  );
  return row[0]?.number_value ?? 0;
}

test.afterAll(async () => {
  await closeConnection();
});