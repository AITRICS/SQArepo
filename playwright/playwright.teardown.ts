import { type FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
// import EC from 'eight-colors';
// import { CDPClient } from 'monocart-coverage-reports';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalTeardown = async (config: FullConfig) => {
//   // [WebServer] the --inspect option was detected, the Next.js router server should be inspected at port 9230.
//   const client = await CDPClient({
//     port: 9229,
//   });

//   if (!client) {
//     EC.logRed('no client');
//     return;
//   }

//   await client.writeCoverage();
//   await client.close();
    execSync('pkill -f playwright || taskkill /F /IM playwright.exe',{stdio: 'ignore'});
};

export default globalTeardown;