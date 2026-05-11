import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
// import { env } from './src/config/env';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Playwright ?˜ê²½ë³€??ë¡œë“œ
//dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: 'P1_UI_test',
  testMatch: '**/*.e2e.{ts,tsx,js,jsx}',  // ëª¨ë“  ?˜ìœ„ ?”ë ‰? ë¦¬??.spec.ts ?Œì¼???ŒìŠ¤?¸ë¡œ ?¸ì‹
  
  fullyParallel: false, //Run tests in files in parallel
  forbidOnly: !!process.env.CI, //Fail the build on CI if you accidentally left test.only in the source code.
  retries: process.env.CI ? 2 : 0, //Retry on CI only
  workers: 1,
  reporter: 'html',
  timeout: 120_000,  // ê°??ŒìŠ¤?¸ì˜ ìµœë? ?¤í–‰ ?œê°„ (120ì´?

  // globalSetup: path.resolve(__dirname,'playwright/fixture/globalSetup.ts'), // Global Setup ?¤í–‰
  
  use: {
    baseURL: process.env.BASE_URL,//'https://192.168.1.211/',
    trace: 'on-first-retry',
    // headless: false, // UI ëª¨ë“œ ?œì„±??
    headless: process.env.CI === 'true',
    viewport: null, //ë·°í¬???¬ê¸°ë¥?ë¸Œë¼?°ì? ì°??¬ê¸°??ë§ì¶¤
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
          args: ['--start-maximized'], // ?„ì²´?”ë©´?¼ë¡œ ?¤í–‰
        },
      },
    },
  ],
  
  globalSetup: path.resolve(__dirname, 'playwright/playwright.globalSetup.ts'),
  globalTeardown: path.resolve(__dirname, 'playwright/playwright.teardown.ts'),
 
});
