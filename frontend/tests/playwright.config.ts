// Playwright configuration file
import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './e2e', // Test directory for E2E tests

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  timeout: 30000, // Test timeout in milliseconds

  // Correctly resolve paths for global setup and teardown
  globalSetup: path.resolve(__dirname, 'global-setup.ts'), // Updated path
  globalTeardown: path.resolve(__dirname, 'global-teardown.ts'), // Updated path

  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html']], // Use multiple reporters

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
