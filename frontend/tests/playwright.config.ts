// Playwright configuration file
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Test directory and execution settings
  testDir: './e2e',
  fullyParallel: false,
  reporter: [['list'], ['html']], // Reporting settings 
  forbidOnly: !!process.env.CI, // Prevent `.only` in CI
  timeout: 30000, // Global test timeout
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: 1, // Number of parallel workers
  
  // Not nessesary to use this  
  // globalSetup: './tests/setup.ts', 

  // Test execution and debugging settings
  use: {
    headless: true,
    baseURL: 'http://localhost:8001/', // Base URL for the QUAlibrate app
    trace: 'on', // Collect trace for retries
    screenshot: 'only-on-failure', // Screenshots on failure
    video: 'retain-on-failure', // Retain video only for failed tests
    browserName: 'chromium', // Use Chromium browser
  },
});
