import type { Page } from '@playwright/test';
import { test as baseTest } from '@playwright/test';
// import { addCoverageReport } from 'monocart-reporter';

import authPage from './authPage.js';
import { getRegExForClassList } from './util.js';

export * from '@playwright/test';

export type TestFixtures = {
  authPage: Page;
  getRegExForClassList: typeof getRegExForClassList;
  autoTestFixture: string;
};

export const authTest = baseTest.extend<TestFixtures>({
  // eslint-disable-next-line no-empty-pattern
  getRegExForClassList: async ({}, use) => {
    await use(getRegExForClassList);
  },
  authPage,
  autoTestFixture: [
    async ({ authPage: page }, use) => {
      const isChromium =
        authTest.info().project.name === 'Desktop Chrome' || authTest.info().project.name === 'chromium';

      // console.log('autoTestFixture setup...', authTest.info().project.name);
      // coverage API is chromium only
      if (isChromium) {
        await Promise.all([
          page.coverage.startJSCoverage({ resetOnNavigation: false }),
          page.coverage.startCSSCoverage({ resetOnNavigation: false }),
        ]);
      }

      await use('autoTestFixture');

      // console.log('autoTestFixture teardown...');
      if (isChromium) {
        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ]);
        const coverageList = [...jsCoverage, ...cssCoverage];

        // await addCoverageReport(coverageList, authTest.info());
      }
    },
    { scope: 'test', auto: true },
  ],
});