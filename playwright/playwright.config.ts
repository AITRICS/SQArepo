// /* eslint-disable turbo/no-undeclared-env-vars */
// import { defineConfig, devices, ScreenshotMode, TraceMode, VideoMode } from '@playwright/test';
// import * as dotenv from 'dotenv';
// // import { CoverageReportOptions } from 'monocart-coverage-reports';
// import * as path from 'path';

// // import { sourceFilter, sourcePath } from './coverage.options.js';

import { defineConfig, devices, ScreenshotMode, TraceMode, VideoMode } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';


// // Playwright 환경변수 로드
// const envConfig = dotenv.config({
//   path: path.join(__dirname, '.env.playwright'),
// });

// if (envConfig.error) {
//   throw new Error('Error loading .env.playwright file');
// }

// // 설정에 필요한 경로들
// const PORT = process.env.PORT || 3000;

// // 테스트 경로 설정
// const isDev = process.env.NODE_ENV === 'development';

function getScreenshotMode(): ScreenshotMode {
  const mode = process.env.SCREENSHOT;

  switch (mode) {
    case 'on':
    case 'off':
    case 'only-on-failure':
    case 'on-first-failure':
      return mode;
    default:
      // 개발 환경에서는 테스트 실패 시 스크린샷 저장
      return isDev ? 'only-on-failure' : 'off';
  }
}

// function getVideoMode(): VideoMode {
//   const mode = process.env.VIDEO;

//   switch (mode) {
//     case 'on':
//     case 'off':
//     case 'retain-on-failure':
//     case 'on-first-retry':
//       return mode;
//     default:
//       // 개발 환경에서는 테스트 실패 시 비디오 저장
//       return isDev ? 'retain-on-failure' : 'off';
//   }
// }

// function getTraceMode(): TraceMode {
//   const mode = process.env.TRACE;

//   switch (mode) {
//     case 'on':
//     case 'off':
//     case 'retain-on-failure':
//     case 'on-first-retry':
//     case 'on-all-retries':
//     case 'retain-on-first-failure':
//       return mode;
//     default:
//       // 개발 환경에서는 테스트 실패 시 트레이스 보존
//       return isDev ? 'retain-on-failure' : 'off';
//   }
// }

// const baseURL = `http://127.0.0.1:${PORT}`;

// /**
//  * See https://playwright.dev/docs/test-configuration.
//  */
// export default defineConfig({
//   testDir: '../',
//   testMatch: '**/*.e2e.@(ts|tsx|js|jsx)',
//   outputDir: path.join(__dirname, 'e2e-results'),

//   /* Run tests in files in parallel */
//   fullyParallel: true,

//   /* Fail the build on CI if you accidentally left test.only in the source code. */
//   forbidOnly: !!process.env.CI,

//   /* Retry on CI only */
//   retries: process.env.CI ? 2 : 0,

//   /* Opt out of parallel tests on CI. */
//   workers: process.env.CI ? 1 : undefined,

//   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
// //   reporter: [
// //     ['list'],
// //     [
// //       'monocart-reporter',
// //       {
// //         coverage: {
// //           // logging: 'debug',
// //           name: 'vc-frontend Playwright Coverage Report',
// //           outputDir: path.join(__dirname, 'e2e-results/coverage'),
// //           entryFilter: (entry: any) => {
// //             // both client side and server side
// //             return entry.url.includes('next/static/chunks') || entry.url.includes('next/server/app');
// //           },
// //           sourceFilter,
// //           sourcePath,
// //           reports: [
// //             'console-summary',
// //             'console-details',
// //             // ['v8', { outputFile: 'v8/coverage-report.html' }],
// //             // ['v8-json', { outputFile: 'v8/coverage-report.json' }],
// //             'raw',
// //             // ['html', { subdir: 'html' }],
// //             // 'lcovonly',
// //           ],
// //         } as CoverageReportOptions,
// //       },
// //     ],
// //   ],

//   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
//   use: {
//     /* Base URL to use in actions like `await page.goto('/')`. */
//     baseURL,

//     /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
//     screenshot: getScreenshotMode(),
//     video: getVideoMode(),
//     trace: getTraceMode(),

//     launchOptions: {
//       slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
//     },
//   },

//   /* Configure projects for major browsers */
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     },
//   ],

//   /* Run your local dev server before starting the tests */
//   webServer: {
//     command: `cd e2e-standalone-app && pnpm start`,
//     url: baseURL,
//     stdout: 'pipe',
//     stderr: 'pipe',
//     reuseExistingServer: !process.env.CI,
//   },

//   globalTeardown: './playwright.teardown.ts',
// });
/* eslint-disable turbo/no-undeclared-env-vars */


// 환경 변수 로드
const envConfig = dotenv.config({
  path: path.join(__dirname, '.env.playwright'),
});

if (envConfig.error) {
  throw new Error('Error loading .env.playwright file');
}

// 개발 모드인지 확인
const isDev = process.env.NODE_ENV === 'development';



//동적 옵션 설정 함수
// function getScreenshotMode(): ScreenshotMode {
//   return process.env.SCREENSHOT || (isDev ? 'only-on-failure' : 'off');
// }

// function getVideoMode(): VideoMode {
//   return process.env.VIDEO || (isDev ? 'retain-on-failure' : 'off');
// }

// function getTraceMode(): TraceMode {
//   return process.env.TRACE || (isDev ? 'retain-on-failure' : 'off');
// }

/**
 * 통합 Playwright 설정
 */
export default defineConfig({
  testDir: '__e2e__', // E2E 테스트 폴더 지정
  testMatch: '**/*.e2e.@(ts|tsx|js|jsx)',  // E2E 테스트 파일 패턴

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: path.join(__dirname, 'e2e-results'), // 테스트 결과 저장 폴더
  globalSetup: path.resolve(__dirname,'./fixture/globalSetup.ts'),
  use: {
    baseURL: process.env.BASE_URL || 'http://192.168.132.5:3000', // 웹서버 없음 → 기본값 설정
    screenshot: getScreenshotMode(),
    // video: getVideoMode(),
    // trace: getTraceMode(),
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
