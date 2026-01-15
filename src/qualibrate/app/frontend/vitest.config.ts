// Vitest configuration file
import { defineConfig } from 'vitest/config';
// @ts-expect-error - vitest.config.ts uses Node.js resolution, not bundler resolution
import react from '@vitejs/plugin-react';
import * as path from 'path';

// Override stderr BEFORE any tests run to ensure we catch ALL stderr output
const originalStderrWrite = process.stderr.write.bind(process.stderr);
let globalStderrBuffer: string[] = [];

process.stderr.write = ((chunk: string | Uint8Array, ...args: unknown[]) => {
  // Check if tests are running via global flag set in setup.ts
  const testsRunning = (globalThis as unknown as { __vitest_tests_running__?: boolean }).__vitest_tests_running__;

  if (process.env.DEBUG_TESTS !== "false" || !testsRunning) {
    // Pass through in debug mode or before tests start
    return originalStderrWrite(chunk as string, ...(args as [string?, BufferEncoding?, (() => void)?]));
  }
  // Buffer all stderr during test execution (will be shown only for failing tests)
  const text = typeof chunk === "string" ? chunk : chunk.toString();
  globalStderrBuffer.push(text);
  return true;
}) as typeof process.stderr.write;

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/utils/setup.ts'],
    globals: true,
    css: true,
    // Silent output - only show summary unless there are failures
    silent: false,
    // Hide console output during tests
    clearMocks: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/tests/e2e**', // Exclude the tests/e2e directory (Playwright E2E tests)
    ],
  },
});