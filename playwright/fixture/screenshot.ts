// screenshot.ts
import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// .env 파일에서 환경 변수 로드
dotenv.config();


// .env에 지정된 SCREENSHOT_PATH가 있으면 사용하고, 없으면 기본값 사용
const BASE_DIR = process.env.SCREENSHOT_PATH || __dirname;
const BASE_REPORT_PATH = path.join(BASE_DIR, 'TestResult');
const VERSION = process.env.VERSION || 'default_version';
const VERSION_PATH = path.join(BASE_REPORT_PATH, VERSION);

// 기존 결과 폴더 삭제
export function removeResultFolder(): void {
  if (fs.existsSync(BASE_REPORT_PATH)) {
    fs.rmSync(BASE_REPORT_PATH, { recursive: true, force: true });
  }
}

 // 스샷 저장 폴더 생성
 function ensureDirectoryExists(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// 테스트 설정 반환
export function getTestSetup(filePath: string): { savePath: string; pyfileName: string } {
  const pyfileName = path.basename(filePath, path.extname(filePath));
  ensureDirectoryExists(VERSION_PATH); // 버전 폴더 생성
  return { savePath: VERSION_PATH, pyfileName };
}

export async function screenShot(
  page: Page,
  scenarioName: string,
  testName: string
): Promise<void> {
  const scenarioPath = path.join(VERSION_PATH, scenarioName);
  ensureDirectoryExists(scenarioPath); // 시나리오 별 폴더 생성

  const screenshotPath = path.join(scenarioPath, `${testName}.png`);
  const body = await page.$('body');
  if (body) {
    await body.screenshot({ path: screenshotPath });
  } else {
    throw new Error('❌ Unable to locate the body element for screenshot.');
  }
}
