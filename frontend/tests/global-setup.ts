import { FullConfig } from '@playwright/test';
import { exec } from 'child_process';

async function globalSetup(config: FullConfig) {
  console.log('Starting Qualibrate server...');
  exec('source .venv/bin/activate && qualibrate start', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting Qualibrate server: ${error.message}`);
      process.exit(1);
    }
    if (stderr) {
      console.error(`Qualibrate start stderr: ${stderr}`);
    }
    console.log(`Qualibrate start stdout: ${stdout}`);
  });
}

export default globalSetup;
