// Playwright configuration file
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Test directory and execution settings
  testDir: './e2e',
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]], // Reporting settings
  forbidOnly: !!process.env.CI, // Prevent `.only` in CI
  timeout: 60000, // Global test timeout (increased from 30s to 60s for calibration runs)
  retries: process.env.CI ? 2 : 1, // Retry once locally, twice in CI for flaky tests
  workers: 1, // Number of parallel workers
  outputDir: 'test-results', // Directory for test artifacts (screenshots, videos, traces)

  // Not necessary to use this
  // globalSetup: './tests/setup.ts',

  // Test execution and debugging settings
  use: {
    headless: true,
    baseURL: 'http://localhost:8001/', // Base URL for the QUAlibrate app
    trace: 'on', // Collect trace for retries
    screenshot: 'only-on-failure', // Screenshots on failure
    video: 'retain-on-failure', // Retain video only for failed tests
    browserName: 'chromium', // Use Chromium browser
    actionTimeout: 10000, // Timeout for individual actions (click, fill, etc.)
    navigationTimeout: 30000, // Timeout for page navigations
  },
});
