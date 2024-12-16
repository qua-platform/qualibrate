// Playwright configuration file
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Test directory
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  timeout: 30000, // Test timeout in milliseconds
  globalSetup: './tests/global-setup.ts', // Path to global setup file
  globalTeardown: './tests/global-teardown.ts', // Path to global teardown file
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    headless: true,
    baseURL: 'http://127.0.0.1:8001/', // base URL for the QUAlibrate app
    trace: 'on-first-retry',
    screenshot: 'only-on-failure', // Take screenshots only on failure
    video: 'retain-on-failure', // Record videos only for failed tests
  },  

  projects: [
    {
      name: 'Chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'WebKit',
      use: { browserName: 'webkit' },
    },
  ],
});
