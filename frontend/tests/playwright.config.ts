// Playwright configuration file
import { defineConfig } from '@playwright/test';
import path from 'path';

console.log('Playwright config is being loaded!');
// Deliberate error for testing
// throw new Error('Playwright config: Debugging if the file is loaded.');

export default defineConfig({
  testDir: './e2e', // Test directory for E2E tests

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  timeout: 30000, // Test timeout in milliseconds

  // Correctly resolve paths for global setup and teardown
  // globalSetup: path.resolve(__dirname, 'global-setup.ts'), // Updated path
  // globalTeardown: path.resolve(__dirname, 'global-teardown.ts'), // Updated path
  
  globalSetup: './tests/setup.ts', // Path to setup file
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html']], // Use multiple reporters
 
  use: {
    headless: true,
    baseURL: 'http://localhost:8001/', // base URL for the QUAlibrate app
    trace: 'on-first-retry', // Collect trace when retrying the failed test 
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
