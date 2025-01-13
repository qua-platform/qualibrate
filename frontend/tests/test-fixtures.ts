// import { test as base } from '@playwright/test';
// import { exec } from 'child_process';

// let serverProcess: any = null;

// // Custom fixture to start and stop the server
// const test = base.extend({
//   server: async ({}, use) => {
//     console.log('Starting server...');
//     serverProcess = exec('. ../../../.venv/bin/activate && qualibrate start');

//     // Wait for the server to initialize
//     await new Promise((resolve) => setTimeout(resolve, 5000));

//     // Run the test
//     await use();

//     // Stop the server after test
//     console.log('Stopping server...');
//     if (serverProcess) {
//       serverProcess.kill();
//     }
//   },
// });

// export { test };
// export const expect = test.expect;
