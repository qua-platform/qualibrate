import { test, expect } from '@playwright/test';

// Test for Workflow 1
test('Workflow1 - Running a Calibration Node', async ({ page }) => {
  const date = /Run start:\s+(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
  const runDuration = /Run duration:\s\s*\d+\.\d{2}\s+s/;
  const frequencyShift = /"frequency_shift":\d+(\.\d+)?/; 
  
  // 0. Prerequisite: 
  // Be sure that the QUAlibrate application is running locally at http://127.0.0.1:8001/

  // 1. Navigate to the Application
  // Open http://127.0.0.1:8001/ in your web browser.
  await page.goto('http://localhost:8001/');
  expect(page.url()).toBe('http://localhost:8001/'); // page loaded successfully

  // 2. Verify Calibration Nodes
  // Check that at least one calibration node (e.g., test_cal) is displayed in the Node Library.
  const nodeLibrary = page.locator('.node-library'); 
  await expect(nodeLibrary.isVisible()).toBeTruthy(); // node-library is showing as the landing page 
  await expect(page.locator('[class^="NodesPage-module__listWrapper__"]')).toBeVisible(); // node library is visible
  const testCalTab = await page.locator('[class^="NodeElement-module__rowWrapper__"] >> text=test_cal');
  await expect(testCalTab).toBeVisible(); // test_cal 'calibration node tab' is visible in the node library 
  await expect(page.getByText('test_cal').first()).toBeVisible(); // test_cal label is visible in the node library 
  // Check that the test_cal node has no visible parameters
  await expect(page.getByText('ParametersResonator:Sampling').first()).toBeHidden();
  
  // 3. Select a Calibration Node
  // Click the test_cal node.
  await page.getByText('test_cal').first().click();
  // Check that the 3 different labels exist
  await expect(page.getByText('ParametersResonator:Sampling').first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Resonator:$/ }).first()).toBeVisible();
  await expect(page.locator('div[class^="Parameters-module__parametersWrapper__"] > div:nth-child(3)').first()).toBeVisible();
  await expect(page.locator('div:nth-child(4)').first()).toBeVisible();
  // Has corresponding default parameters
  const resonatorField = page.getByRole('textbox', { name: 'resonator' });
  const samplingPointsField = page.getByRole('textbox', { name: 'sampling_points' });
  const noiseFactorField = page.getByRole('textbox', { name: 'noise_factor' });
  await expect(resonatorField).toHaveValue('q1.resonator');
  await expect(samplingPointsField).toHaveValue('100');
  await expect(noiseFactorField).toHaveValue('0.1');
  // Their feilds are modifiable, 
  await resonatorField.click();
  await samplingPointsField.click();
  await noiseFactorField.click();

  // 4. Change a node parameter value 
  // Varify that it's possible to replace the default parameter values with new ones 
  await resonatorField.click();
  await resonatorField.fill('q2.resonator');
  await samplingPointsField.click();
  await samplingPointsField.fill('1000');
  await noiseFactorField.click();
  await noiseFactorField.fill('0.2');
  await expect(resonatorField).toHaveValue('q2.resonator');
  await expect(samplingPointsField).toHaveValue('1000');
  await expect(noiseFactorField).toHaveValue('0.2');

  // 5. Run the Calibration Node
  // Click the Run button for test_cal.
  await page.locator('div').filter({ hasText: /^test_calRun$/ }).getByRole('button').click();
  await expect(page.getByRole('progressbar').getByRole('img')).toBeVisible(); // spinning loading icon appears 
  await expect(page.getByText('Status: running')).toBeVisible(); // status changes to running 
  const runningStatusInfo = await page.locator('[class^="RunningJob-module__wrapper__"]').innerText();
  await expect(page.locator('[class^="RunningJob-module__wrapper__"]')).toContainText('Running job: test_cal');
  // Verify:
  // The Running Job section appears, showing parameters and status.
  await expect(page.getByText('Running job: test_cal')).toBeVisible();
  await expect(page.locator('[class^="RunningJob-module__wrapper__"]')).toContainText(date); // Matches the format: Run start: 2021/09/30 15:00:00
  await expect(page.locator('[class^="RunningJob-module__wrapper__"]')).toContainText(runDuration); // Matches the format: Run duration:  4.00 s
  await expect(runningStatusInfo).toContain('Parameters');
  await expect(page.getByText('Resonator:q2.resonator')).toBeVisible();
  await expect(page.getByText('Sampling Points:1000')).toBeVisible();  // Job status changes to finished upon completion, along with other stats.
  await expect(page.getByText('Status: finished')).toBeVisible(); // status changes to finished 
  await expect(page.locator('[class^="RunningJob-module__dot__"]')).toHaveCSS('background-color', 'rgb(50, 205, 50)'); // green color 
  // parameters here match parameters in node parameter feilds 
  await expect(page.getByRole('textbox', { name: 'resonator' })).toHaveValue('q2.resonator');
  await expect(page.locator('[class^="RunningJob-module__wrapper__"]')).toContainText('Resonator:q2.resonator');
  await expect(page.getByRole('textbox', { name: 'sampling_points' })).toHaveValue('1000');
  await expect(page.locator('[class^="RunningJob-module__wrapper__"]')).toContainText('Sampling Points:1000');

  // 6. Check Results
  // Confirm the Results section is populated with:
  const resultsFrequency = page.getByTestId('data-key-pairfrequency_shift');
  const resultsFigure = page.getByTestId('data-key-pairresults_fig');
  // Numerical values.
  await expect(resultsFrequency).toBeVisible();
  await expect(resultsFrequency).toContainText(frequencyShift);
  await expect(resultsFigure).toContainText('"results_fig":{1 Items');
  await expect(resultsFigure).toContainText('"./results_fig.png":');
  // A generated figure.
  await expect(resultsFigure.locator('div').filter({ hasText: '"./results_fig.png":' }).first()).toBeVisible();
  await expect(page.locator('a')).toBeVisible(); // the pyplot image is visible 
  // Data storage location.
  await expect(page.getByTestId('data-key-pairarr')).toBeVisible();

  // 7. Check/Update State Values
  // Verify the State Updates section displays suggested changes.
  await expect(page.locator('[class^="RunningJob-module__stateUpdateWrapper__"]').first()).toBeVisible();
  await expect(page.locator('[class^="RunningJob-module__stateUpdatesTopWrapper__"] > div:nth-child(2)')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^100000000$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^\[1,2,3\]$/ }).first()).toBeVisible();
  // Update intermediate frequency
  await page.locator('div').filter({ hasText: /^1#\/channels\/ch1\/intermediate_frequency100000000$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^1#\/channels\/ch1\/intermediate_frequency100000000$/ }).getByRole('textbox').fill('20000000');
  await page.locator('div').filter({ hasText: /^1#\/channels\/ch1\/intermediate_frequency100000000$/ }).getByRole('img').nth(1).click();
  await expect(page.locator('div').filter({ hasText: /^1#\/channels\/ch1\/intermediate_frequency100000000$/ }).getByRole('img').nth(2)).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^1#\/channels\/ch1\/intermediate_frequency100000000$/ }).locator('path').nth(1)).toBeVisible();
  // Update channels from [1,2,4] to [1,2,4,5]
  await page.locator('div').filter({ hasText: /^2#\/channels\/ch2\/intermediate_frequency\[1,2,3\]$/ }).getByRole('textbox').dblclick();
  await page.locator('div').filter({ hasText: /^2#\/channels\/ch2\/intermediate_frequency\[1,2,3\]$/ }).getByRole('textbox').fill('[1,2,4,5]');
  await page.locator('div').filter({ hasText: /^2#\/channels\/ch2\/intermediate_frequency\[1,2,3\]$/ }).getByRole('img').nth(1).click();
  await expect(page.locator('div').filter({ hasText: /^\[1,2,3\]\[1,2,4,5\]$/ }).locator('path').nth(1)).toBeVisible(); // Green checkmark icon appears
});