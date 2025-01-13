// Playwright configuration file
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', 
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  timeout: 30000, 
  // globalSetup: './tests/setup.ts', 
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  // reporter: [['list'], ['html']],  
  use: {
    headless: true,
    baseURL: 'http://localhost:8001/', // base URL for the QUAlibrate app
    trace: 'on', // Collect trace when retrying the failed test 
    screenshot: 'only-on-failure', // Take screenshots only on failure
    video: 'retain-on-failure', // Record videos only for failed tests
    browserName: 'chromium', // Restrict to Chromium for now 
  },
  reporter: [['html', { outputFolder: 'playwright-report' }]],

//   projects: [
//     {
//       name: 'Chromium',
//       use: { browserName: 'chromium' },
//     },
//     {
//       name: 'Firefox',
//       use: { browserName: 'firefox' },
//     },
//     {
//       name: 'WebKit',
//       use: { browserName: 'webkit' },
//     },
//   ],
});
