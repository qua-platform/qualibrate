import { expect, test } from "@playwright/test";

// Test for Workflow 1
test("Workflow1 - Running a Calibration Node", async ({ page }, testInfo) => {
  const date = /(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
  const runDuration = /\d+\.\d{2}\s+s/;
  const idx = /\d+/;
  const frequencyShift = /"frequency_shift":\d+(\.\d+)?/;

  // 0. Prerequisite:
  // Be sure that the QUAlibrate application is running locally at http://127.0.0.1:8001/

  // 1. Navigate to the Application
  // Open http://127.0.0.1:8001/ in your web browser.
  await page.goto("http://localhost:8001/", { waitUntil: "load" });
  expect(page.url()).toBe("http://localhost:8001/"); // page loaded successfully

  // 1a. Verify Project Page and go to project (node) page
  try {
    await expect(page.getByTestId("project-wrapper-demo_project")).toBeVisible({ timeout: 2000 });
  } catch {}
  try {
    const lets_start_button = page.getByTestId("lets-start-button-demo_project");
    await expect(lets_start_button).toBeVisible({ timeout: 1000 }); // Project page loaded sucessfully
    await lets_start_button.click();
  } catch {
    // Skip if project wrapper is not visible and assume that we are already on the nodes page
  }

  // 2. Verify Calibration Nodes
  // Check that at least one calibration node (e.g., test_cal) is displayed in the Node Library.
  await expect(page.getByTestId("nodes-and-job-wrapper")).toBeVisible({ timeout: 10000 }); // Node page loaded sucessfully
  await expect(page.getByTestId("nodes-page-wrapper")).toBeVisible(); // Node page loaded sucessfully
  // await expect(page.getByTestId('title-wrapper')).toBeVisible(); // title wrapper is visible
  // await expect(page.getByTestId('title-wrapper')).toContainText('Run calibration node'); // title is correct
  await expect(page.getByTestId("refresh-button")).toBeVisible(); // refresh button is visible
  await expect(page.getByTestId("menu-item-nodes")).toBeVisible(); // node library is showing as the landing page

  // Wait for the node library to load with increased timeout (backend may still be initializing)
  await expect(page.getByTestId("node-list-wrapper")).toBeVisible({ timeout: 30000 }); // node library list of nodes are visible
  await expect(page.getByTestId("node-element-test_cal")).toBeVisible(); // test_cal 'calibration node tab' is visible in the node library
  await expect(page.getByTestId("title-or-name-test_cal")).toBeVisible(); // test_cal label is visible in the node library
  // Check that the test_cal node has no visible parameters
  const testCalNode = page.getByTestId("node-element-test_cal");
  await expect(testCalNode.getByTestId("node-parameters-wrapper")).toBeHidden();
  await expect(testCalNode.getByTestId("parameter-values-resonator")).toBeHidden();
  await expect(testCalNode.getByTestId("parameter-values-sampling_points")).toBeHidden();
  await expect(testCalNode.getByTestId("parameter-values-noise_factor")).toBeHidden();

  // 3. Select a Calibration Node
  // Click the test_cal node.
  await page.getByTestId("node-element-test_cal").click();
  await page.waitForTimeout(1000);
  // Check that the test_cal node is runnable by containing a green dot.
  await expect(page.getByTestId("dot-wrapper-test_cal")).toBeVisible();
  // Check that the 3 different labels exist
  await expect(testCalNode.getByTestId("node-parameters-wrapper")).toBeVisible();
  await expect(testCalNode.getByTestId("parameter-values-resonator")).toBeVisible();
  await expect(testCalNode.getByTestId("parameter-values-sampling_points")).toBeVisible();
  await expect(testCalNode.getByTestId("parameter-values-noise_factor")).toBeVisible();
  // Has corresponding default parameters
  const resonatorField = testCalNode.getByTestId("input-field-resonator");
  const samplingPointsField = testCalNode.getByTestId("input-field-sampling_points");
  const noiseFactorField = testCalNode.getByTestId("input-field-noise_factor");

  // Wait for default values to load from backend
  // The backend may take time to scan the calibration library and load parameter defaults
  // We use longer timeouts and check each field has a non-empty value before proceeding
  await expect(resonatorField).not.toHaveValue("", { timeout: 30000 });
  await expect(samplingPointsField).not.toHaveValue("", { timeout: 30000 });
  await expect(noiseFactorField).not.toHaveValue("", { timeout: 30000 });

  // Now verify the actual default values are correct
  await expect(resonatorField).toHaveValue("q1.resonator");
  await expect(samplingPointsField).toHaveValue("100");
  await expect(noiseFactorField).toHaveValue("0.1");
  // Their feilds are modifiable,
  await resonatorField.click();
  await samplingPointsField.click();
  await noiseFactorField.click();

  // 4. Change a node parameter value
  // Varify that it's possible to replace the default parameter values with new ones
  await resonatorField.click();
  await resonatorField.fill("q2.resonator");
  await samplingPointsField.click();
  await samplingPointsField.fill("1000");
  await noiseFactorField.click();
  await noiseFactorField.fill("0.2");
  await expect(resonatorField).toHaveValue("q2.resonator");
  await expect(samplingPointsField).toHaveValue("1000");
  await expect(noiseFactorField).toHaveValue("0.2");
  await page.getByTestId("node-element-test_cal").click();

  const screenshotPathStep4 = `screenshot-after-step4-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPathStep4 });
  await testInfo.attach("screenshot-after-step4", { path: screenshotPathStep4, contentType: "image/png" });

  // 5. Run the Calibration Node
  // Click the Run button for test_cal.
  await page.getByTestId("run-button").click();

  // Wait for node execution - the node executes very quickly
  await page.waitForTimeout(3000); // Wait 3 seconds for node to execute and complete

  const screenshotPathStep5 = `screenshot-after-step5-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPathStep5 });
  await testInfo.attach("screenshot-after-step5", { path: screenshotPathStep5, contentType: "image/png" });

  // Verify:
  // The running node section should be visible (even after node completes)
  await expect(page.getByTestId("running-job-wrapper")).toBeVisible({ timeout: 10000 });

  // The parameters section should show the parameters we set
  await expect(page.getByTestId("parameters-wrapper")).toBeVisible();
  await expect(page.getByTestId("parameter-title")).toContainText("Parameters");
  await expect(page.getByTestId("parameters-list")).toBeVisible();

  const screenshotPathFinished = `screenshot-after-finished-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPathFinished });
  await testInfo.attach("screenshot-after-step6", { path: screenshotPathFinished, contentType: "image/png" });

  // Verify parameters are displayed (they should match what we set earlier)
  await expect(page.getByTestId("parameter-item-resonator")).toBeVisible();
  await expect(page.getByTestId("parameter-value-resonator")).toContainText("q2.resonator");
  await expect(page.getByTestId("parameter-item-sampling_points")).toBeVisible();
  await expect(page.getByTestId("parameter-value-sampling_points")).toContainText("1000");
  await expect(page.getByTestId("parameter-item-noise_factor")).toBeVisible();
  await expect(page.getByTestId("parameter-value-noise_factor")).toContainText("0.2");

  // 6. Check Results Section
  await expect(page.getByTestId("results-wrapper")).toBeVisible();
  // Confirm the Results section is populated with:
  const resultsFrequency = page.getByTestId("data-key-pairfrequency_shift");
  const resultsFigure = page.getByTestId("data-key-pairresults_fig");
  // Numerical values.
  await expect(resultsFrequency).toBeVisible();
  await expect(resultsFrequency).toContainText(frequencyShift);
  await expect(resultsFigure).toContainText('"results_fig":{1 Items');
  await expect(resultsFigure).toContainText('"./results_fig.png":');
  // A generated figure.
  await expect(resultsFigure.getByTestId("data-key-pairresults_fig../results_fig.png")).toBeVisible(); // the pyplot image is visible
  // Data storage location.
  await expect(page.getByTestId("data-key-pairarr")).toBeVisible();

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
  const stateUpdatesExist = await page
    .getByTestId("state-updates-top-wrapper")
    .isVisible()
    .catch(() => false);

  if (stateUpdatesExist) {
    // If state updates exist, verify their structure
    await expect(page.getByTestId("state-updates-top-wrapper")).toBeVisible();
    await expect(page.getByTestId("update-all-button")).toBeVisible();

    const ch1 = page.getByTestId("state-update-wrapper-#/channels/ch1/intermediate_frequency");
    // const ch2 = page.getByTestId("state-update-wrapper-#/channels/ch2/intermediate_frequency");
    await expect(ch1).toBeVisible();
    // await expect(ch2).toBeVisible();

    // Update the state value for ch1 to 20000000
    await expect(ch1.getByTestId("value-container")).toContainText("100000000");
    await expect(ch1.getByTestId("value-input")).toHaveValue("50000000");
    ch1.getByTestId("value-input").click();
    ch1.getByTestId("value-input").fill("20000000");
    await expect(ch1.getByTestId("update-before-icon")).toBeVisible();
    await resonatorField.click(); // Clicking (anywhere) away from input failed to spawn undo button
    await expect(ch1.getByTestId("undo-icon-wrapper")).toBeVisible();
    ch1.getByTestId("update-before-icon").click(); // Click the icon to update the state
    await expect(ch1.getByTestId("update-after-icon")).toBeVisible();

    // Update the state value for ch2 to [1,2,4,5]
    // await expect(ch2.getByTestId("value-input")).toBeVisible();
    // await expect(ch2.getByTestId("value-container")).toContainText("80000000");
    // await expect(ch2.getByTestId("value-input")).toHaveValue("70000000");
    // ch2.getByTestId("value-input").click();
    // ch2.getByTestId("value-input").fill("[1,2,4,5]");
    // await resonatorField.click(); // Clicking (anywhere) away from input feild to spawn undo button
    // await expect(ch2.getByTestId("undo-icon-wrapper")).toBeVisible();
    // await expect(ch2.getByTestId("update-before-icon")).toBeVisible();
    // ch2.getByTestId("update-before-icon").click(); // Click the icon to update the state
    // await expect(ch2.getByTestId("update-after-icon")).toBeVisible();
  }
});
