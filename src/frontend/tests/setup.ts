import { test } from "@playwright/test";
import { spawn } from "child_process";

let serverProcess: any;

test.beforeEach(async () => {
  // await context.clearCookies();
  // await context.clearPermissions();
  // console.log('Cleared browser state');

  console.log("Starting Qualibrate server...");

  const fs = require("fs");

  const filePath = ".venv/bin/activate";

  if (fs.existsSync(filePath)) {
    console.log("Spawning QUAlibrate from virtual Environment .venv.");
    serverProcess = spawn("bash", ["-c", "source .venv/bin/activate && qualibrate start"]);
  } else {
    console.log("No virtual environment found. Spawning QUAlibrate.");
    serverProcess = spawn("bash", ["-c", "qualibrate start"]);
  }

  // Log server output for debugging
  // @ts-ignore
  serverProcess.stdout.on("data", (data) => console.log(`SERVER: ${data}`));
  // @ts-ignore
  serverProcess.stderr.on("data", (data) => console.error(`SERVER ERR: ${data}`));

  // Poll for server readiness
  let serverReady = false;
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch("http://127.0.0.1:8001"); // Replace with a valid health endpoint
      if (response.ok) {
        serverReady = true;
        break;
      }
    } catch {
      console.log("Waiting for server to be ready...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (!serverReady) {
    throw new Error("Server did not become ready in time.");
  }
});

test.afterEach(async () => {
  console.log("Stopping Qualibrate server...");
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
  }

  // Wait to ensure the process stops cleanly
  await new Promise((resolve) => setTimeout(resolve, 2000));
});
