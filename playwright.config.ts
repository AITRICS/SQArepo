import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Playwright 환경변수 로드
dotenv.config();

export default defineConfig({
  testDir: './__e2e__',
  testMatch: '**/*.e2e.@(ts|tsx|js|jsx)',  // 모든 하위 디렉토리의 .spec.ts 파일을 테스트로 인식
  
  fullyParallel: true, //Run tests in files in parallel
  forbidOnly: !!process.env.CI, //Fail the build on CI if you accidentally left test.only in the source code.
  retries: process.env.CI ? 2 : 0, //Retry on CI only
  workers: process.env.CI ? 1 : undefined, //Opt out of parallel tests on CI.
  reporter: 'html',

  // globalSetup: path.resolve(__dirname,'playwright/fixture/globalSetup.ts'), // Global Setup 실행
  
  use: {
    baseURL: process.env.BASE_URL,//'http://192.168.132.211:3000',
    trace: 'on-first-retry',
    // headless: false, // UI 모드 활성화
    headless: process.env.CI === 'true',
    viewport: null, //뷰포트 크기를 브라우저 창 크기에 맞춤
    contextOptions: {
      permissions: ['clipboard-read'],
    },
  },
  
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        launchOptions: {
          args: ['--start-maximized'], // 전체화면으로 실행
        },
      },
    },
  ],
  globalSetup: path.resolve(__dirname, 'playwright/playwright.globalSetup.ts'),
  globalTeardown: path.resolve(__dirname, 'playwright/playwright.teardown.ts'),
 
});
