import { FullConfig } from '@playwright/test';
import { exec } from 'child_process';

async function globalSetup(config: FullConfig) {
  console.log('Starting QUAlibrate server...');
  
  // Start the server as a child process
  const server = exec('qualibrate start', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting server: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Server stderr: ${stderr}`);
    }
    console.log(`Server stdout: ${stdout}`);
  });

  // Store server reference for teardown, if needed
  (global as any).__SERVER__ = server;
}

export default globalSetup;