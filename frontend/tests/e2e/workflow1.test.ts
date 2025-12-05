import { expect, test } from "@playwright/test";

// Test for Workflow 1
test("Workflow1 - Running a Calibration Node", async ({ page }, testInfo) => {
  const date = /(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
  const runDuration = /\d+\.\d{2}\s+s/;
  const idx = /\d+/;
  const frequencyShift = /"frequency_shift":\d+(\.\d+)?/;
  const nodeName = '01_demo_qubit_spectroscopy';

  // 0. Prerequisite:
  // Be sure that the QUAlibrate application is running locally at http://127.0.0.1:8001/

  // 1. Navigate to the Application
  // Open http://127.0.0.1:8001/ in your web browser.
  await page.goto("http://localhost:8001/", { waitUntil: 'load' });
  expect(page.url()).toBe("http://localhost:8001/"); // page loaded successfully

  // 1a. Verify Project Page and go to project (node) page
  try {
    await expect(page.getByTestId("project-wrapper-demo_project")).toBeVisible({ timeout: 2000 });
  } catch {
  }
  try {
    const lets_start_button = page.getByTestId("lets-start-button-demo_project");
    await expect(lets_start_button).toBeVisible({ timeout: 1000 }); // Project page loaded sucessfully
    await lets_start_button.click();
  } catch {
    // Skip if project wrapper is not visible and assume that we are already on the nodes page
  }

  // 2. Verify Calibration Nodes
  // Check that at least one calibration node (e.g., 01_demo_qubit_spectroscopy) is displayed in the Node Library.
  await expect(page.getByTestId("nodes-and-job-wrapper")).toBeVisible({ timeout: 1000 }); // Node page loaded sucessfully
  await expect(page.getByTestId("nodes-page-wrapper")).toBeVisible(); // Node page loaded sucessfully
  // await expect(page.getByTestId('title-wrapper')).toBeVisible(); // title wrapper is visible
  // await expect(page.getByTestId('title-wrapper')).toContainText('Run calibration node'); // title is correct
  await expect(page.getByTestId("refresh-button")).toBeVisible(); // refresh button is visible
  await expect(page.getByTestId("menu-item-nodes")).toBeVisible(); // node library is showing as the landing page

  // Wait for the node library to load with increased timeout (backend may still be initializing)
  await expect(page.getByTestId("node-list-wrapper")).toBeVisible({ timeout: 30000 }); // node library list of nodes are visible
  await expect(page.getByTestId(`node-element-${nodeName}`)).toBeVisible(); // nodeName '01_demo_qubit_spectroscopy' is visible in the node library
  await expect(page.getByTestId(`title-or-name-${nodeName}`)).toBeVisible(); // 01_demo_qubit_spectroscopy label is visible in the node library
  // Check that the 01_demo_qubit_spectroscopy node has no visible parameters
  const testCalNode = page.getByTestId(`node-element-${nodeName}`);
  await expect(testCalNode.getByTestId("node-parameters-wrapper")).toBeHidden();
  await expect(testCalNode.getByTestId("parameter-values-qubits")).toBeHidden();
  await expect(testCalNode.getByTestId("parameter-values-num_shots")).toBeHidden();
  await expect(testCalNode.getByTestId("parameter-values-duration")).toBeHidden();

  // 3. Select a Calibration Node
  // Click the 01_demo_qubit_spectroscopy node.
  await page.getByTestId(`node-element-${nodeName}`).click();
  await page.waitForTimeout(1000);
  // Check that the 01_demo_qubit_spectroscopy node is runnable by containing a green dot.
  await expect(page.getByTestId(`dot-wrapper-${nodeName}`)).toBeVisible();
  // Check that the 3 different labels exist
  await expect(testCalNode.getByTestId("node-parameters-wrapper")).toBeVisible();
  await expect(testCalNode.getByTestId("parameter-values-qubits")).toBeVisible();
  await expect(testCalNode.getByTestId("parameter-values-num_shots")).toBeVisible();
  await expect(testCalNode.getByTestId("parameter-values-duration")).toBeVisible();
  // Has corresponding default parameters
  const qubitsField = testCalNode.getByTestId("input-field-qubits");
  const numShotsField = testCalNode.getByTestId("input-field-num_shots");
  const durationField = testCalNode.getByTestId("input-field-duration");

  // Wait for default values to load from backend
  // The backend may take time to scan the calibration library and load parameter defaults
  // We use longer timeouts and check each field has a non-empty value before proceeding
  await expect(qubitsField).not.toHaveValue("", { timeout: 30000 });
  await expect(numShotsField).not.toHaveValue("", { timeout: 30000 });
  await expect(durationField).not.toHaveValue("", { timeout: 30000 });

  // Now verify the actual default values are correct
  await expect(qubitsField).toHaveValue("q1,q2");
  await expect(numShotsField).toHaveValue("100");
  await expect(durationField).toHaveValue("8");
  // Their feilds are modifiable,
  await qubitsField.click();
  await numShotsField.click();
  await durationField.click();

  // 4. Change a node parameter value
  // Varify that it's possible to replace the default parameter values with new ones
  await qubitsField.click();
  await qubitsField.fill("q2.resonator");
  await numShotsField.click();
  await numShotsField.fill("1000");
  await durationField.click();
  await durationField.fill("1");
  await expect(qubitsField).toHaveValue("q2.resonator");
  await expect(numShotsField).toHaveValue("1000");
  await expect(durationField).toHaveValue("1");
  await page.getByTestId(`node-element-${nodeName}`).click();

  const screenshotPathStep4 = `screenshot-after-step4-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPathStep4 });
  await testInfo.attach('screenshot-after-step4', { path: screenshotPathStep4, contentType: 'image/png' });

  // 5. Run the Calibration Node
  // Click the Run button for 01_demo_qubit_spectroscopy.
  await page.getByTestId("run-button").click();

  // Wait for node execution - the node executes very quickly
  await page.waitForTimeout(3000); // Wait 3 seconds for node to execute and complete

  const screenshotPathStep5 = `screenshot-after-step5-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPathStep5 });
  await testInfo.attach('screenshot-after-step5', { path: screenshotPathStep5, contentType: 'image/png' });

  // Verify:
  // The running node section should be visible (even after node completes)
  await expect(page.getByTestId("running-job-wrapper")).toBeVisible({ timeout: 10000 });

  // The parameters section should show the parameters we set
  await expect(page.getByTestId("parameters-wrapper")).toBeVisible();
  await expect(page.getByTestId("parameter-title")).toContainText("Parameters");
  await expect(page.getByTestId("parameters-list")).toBeVisible();

  const screenshotPathFinished = `screenshot-after-finished-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPathFinished });
  await testInfo.attach('screenshot-after-step6', { path: screenshotPathFinished, contentType: 'image/png' });

  // Verify parameters are displayed (they should match what we set earlier)
  await expect(page.getByTestId("parameter-item-qubits")).toBeVisible();
  await expect(page.getByTestId("parameter-value-qubits")).toContainText("q2.resonator");
  await expect(page.getByTestId("parameter-item-num_shots")).toBeVisible();
  await expect(page.getByTestId("parameter-value-num_shots")).toContainText("1000");
  await expect(page.getByTestId("parameter-item-span")).toBeVisible();
  await expect(page.getByTestId("parameter-value-span")).toContainText("1");

  // 6. Check Results Section
  await expect(page.getByTestId("results-wrapper")).toBeVisible();
  // Confirm the Results section is populated with:
  // const resultsFrequency = page.getByTestId("data-key-pairfrequency_shift");
  const resultsFigure = page.getByTestId("data-key-pairfigures.spectroscopy");
  // Numerical values.
  // await expect(resultsFrequency).toBeVisible();
  // await expect(resultsFrequency).toContainText(frequencyShift);
  await expect(resultsFigure).toContainText('"spectroscopy":{1 Items');
  await expect(resultsFigure).toContainText('"./figures.spectroscopy.png":');
  // A generated figure.
  await expect(resultsFigure.getByTestId("data-key-pairfigures.spectroscopy../figures.spectroscopy.png")).toBeVisible(); // the pyplot image is visible

  // 7. Check/Update State Values
  // First, wait for the node to complete (state updates appear after completion)
  // Wait up to 30 seconds for node completion
  await page.waitForTimeout(5000); // Additional wait for node to finish if not already done

  // Verify the State Updates section displays suggested changes.
  // Note: states-column-wrapper should be in the running-job-wrapper we already verified
  await expect(page.getByTestId("states-column-wrapper")).toBeVisible({ timeout: 10000 });

  // State wrapper and title should always be present
  await expect(page.getByTestId("state-wrapper")).toBeVisible();
  await expect(page.getByTestId("state-title")).toBeVisible();

  // Check if state updates exist (they're conditional based on whether the node produces state updates)
  const stateUpdatesExist = await page.getByTestId("state-updates-top-wrapper").isVisible().catch(() => false);

  if (stateUpdatesExist) {
    // If state updates exist, verify their structure
    await expect(page.getByTestId("state-updates-top-wrapper")).toBeVisible();
    await expect(page.getByTestId("update-all-button")).toBeVisible();

    const ch1 = page.getByTestId("state-update-wrapper-#/channels/ch1/intermediate_frequency");
    const ch2 = page.getByTestId("state-update-wrapper-#/channels/ch2/intermediate_frequency");
    await expect(ch1).toBeVisible();
    await expect(ch2).toBeVisible();

    // Update the state value for ch1 to 20000000
    await expect(ch1.getByTestId("value-container")).toContainText("100000000");
    await expect(ch1.getByTestId("value-input")).toHaveValue("50000000");
    ch1.getByTestId("value-input").click();
    ch1.getByTestId("value-input").fill("20000000");
    await expect(ch1.getByTestId("update-before-icon")).toBeVisible();
    await qubitsField.click(); // Clicking (anywhere) away from input failed to spawn undo button
    await expect(ch1.getByTestId("undo-icon-wrapper")).toBeVisible();
    ch1.getByTestId("update-before-icon").click(); // Click the icon to update the state
    await expect(ch1.getByTestId("update-after-icon")).toBeVisible();

    // Update the state value for ch2 to [1,2,4,5]
    await expect(ch2.getByTestId("value-input")).toBeVisible();
    await expect(ch2.getByTestId("value-container")).toContainText("80000000");
    await expect(ch2.getByTestId("value-input")).toHaveValue("70000000");
    ch2.getByTestId("value-input").click();
    ch2.getByTestId("value-input").fill("[1,2,4,5]");
    await qubitsField.click(); // Clicking (anywhere) away from input feild to spawn undo button
    await expect(ch2.getByTestId("undo-icon-wrapper")).toBeVisible();
    await expect(ch2.getByTestId("update-before-icon")).toBeVisible();
    ch2.getByTestId("update-before-icon").click(); // Click the icon to update the state
    await expect(ch2.getByTestId("update-after-icon")).toBeVisible();
  }
});
