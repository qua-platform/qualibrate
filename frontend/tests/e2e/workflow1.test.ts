import { test, expect } from '@playwright/test';

// Test for Workflow 1
test('Workflow1', {
  annotation: {
    type: 'First User Workflow', 
    description: 'Running a calibration node',
    },
  },  async ({ page }) => {
  
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
  await expect(page.getByText('test_cal', { exact: true })).toBeVisible(); // test_cal label is visible in the node library 
  await expect(page.getByText('test_calRun')).toBeVisible(); // test_cal 'calibration node tab' is visible in the node library 
  // Check that the test_cal node has no visible parameters
  await expect(page.getByText('ParametersResonator:Sampling').first()).toBeHidden();

  // 3. Select a Calibration Node
  // Click the test_cal node.
  await page.getByText('test_calRun').click();
  // Check that the 3 different labels exist
  await expect(page.getByText('ParametersResonator:Sampling').first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Resonator:$/ }).first()).toBeVisible();
  await expect(page.locator('div[class^="Parameters-module__parametersWrapper__"] > div:nth-child(3)').first()).toBeVisible();
  await expect(page.locator('div:nth-child(4)').first()).toBeVisible();
  // Has corresponding default parameters
  await expect(page.getByRole('textbox', { name: 'resonator' })).toHaveValue('q1.resonator');
  await expect(page.getByRole('textbox', { name: 'sampling_points' })).toHaveValue('100');
  await expect(page.getByRole('textbox', { name: 'noise_factor' })).toHaveValue('0.1');
  // Their feilds are modifiable, 
  await page.getByRole('textbox', { name: 'resonator' }).click();
  await page.getByRole('textbox', { name: 'sampling_points' }).click();
  await page.getByRole('textbox', { name: 'noise_factor' }).click();

  // 4. Change a node parameter value 
  // Varify that it's possible to replace the default parameter values with new ones 
  await page.getByRole('textbox', { name: 'resonator' }).click();
  await page.getByRole('textbox', { name: 'resonator' }).fill('q2.resonator');
  await page.getByRole('textbox', { name: 'sampling_points' }).click();
  await page.getByRole('textbox', { name: 'sampling_points' }).fill('1000');
  await page.getByRole('textbox', { name: 'noise_factor' }).click();
  await page.getByRole('textbox', { name: 'noise_factor' }).fill('0.2');
  await expect(page.getByRole('textbox', { name: 'resonator' })).toHaveValue('q2.resonator');
  await expect(page.getByRole('textbox', { name: 'sampling_points' })).toHaveValue('1000');
  await expect(page.getByRole('textbox', { name: 'noise_factor' })).toHaveValue('0.2');

  // 5. Run the Calibration Node
  // Click the Run button for test_cal.
  await page.locator('div').filter({ hasText: /^test_calRun$/ }).getByRole('button').click();
  await expect(page.getByRole('progressbar').getByRole('img')).toBeVisible(); // spinning loading icon appears 
  await expect(page.getByText('Status: running')).toBeVisible(); // status changes to running 
  // Verify:
  // The Running Job section appears, showing parameters and status.
  await expect(page.getByText('Running job : test_cal')).toBeVisible();
  await expect(page.getByText(/Run start:\s+(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})/)).toBeVisible(); // Matches the format: Run start: 2021/09/30 15:00:00
  // await page.waitForSelector('text=/Run duration:\\s*\\d+\\.\\d{2}\\s+seconds/', { timeout: 10000 });
  await expect(page.getByText(/Run duration:\s*\d+\.\d{2}\s+seconds/)).toBeVisible(); // Matches the format: Run duration: 4.00 seconds
  await expect(page.getByText('Parameters:')).toBeVisible();
  await expect(page.getByText('Resonator:q2.resonator')).toBeVisible();
  await expect(page.getByText('Sampling Points:1000')).toBeVisible();  // Job status changes to finished upon completion, along with other stats.
  await expect(page.getByText('Status: finished')).toBeVisible(); // status changes to finished 
  await expect(page.locator('[class^="RunningJob-module__dot__"]')).toHaveCSS('background-color', 'rgb(50, 205, 50)'); // green color 
  // parameters here match parameters in node parameter feilds 
  await expect(page.getByRole('textbox', { name: 'resonator' })).toHaveValue('q2.resonator');
  await expect(page.locator('#root')).toContainText('Resonator:q2.resonator');
  await expect(page.getByRole('textbox', { name: 'sampling_points' })).toHaveValue('1000');
  await expect(page.locator('#root')).toContainText('Sampling Points:1000');

  // 6. Check Results
  // Confirm the Results section is populated with:
  // Numerical values.
  await expect(page.getByTestId('data-key-pairfrequency_shift')).toBeVisible();
  await expect(page.getByTestId('data-key-pairfrequency_shift')).toContainText(/"frequency_shift":\d+(\.\d+)?/); // Matches the format of any number 
  await expect(page.getByTestId('data-key-pairresults_fig')).toContainText('"results_fig":{1 Items');
  await expect(page.getByTestId('data-key-pairresults_fig../results_fig.png')).toContainText('"./results_fig.png":');
  // A generated figure.
  await expect(page.getByTestId('data-key-pairresults_fig').locator('div').filter({ hasText: '"./results_fig.png":' }).first()).toBeVisible();
  await expect(page.locator('a')).toBeVisible(); // the pyplot image is visible 
  // Data storage location.
  await expect(page.getByTestId('data-key-pairarr')).toBeVisible();

  // 7. Check/Update State Values
  // Verify the State Updates section displays suggested changes.
  await expect(page.locator('[class^="RunningJob-module__stateUpdateWrapper__"]').first()).toBeVisible();
  await expect(page.locator('[class^="RunningJob-module__stateUpdatesTopWrapper__"] > div:nth-child(2)')).toBeVisible();
  await expect(page.locator('#root')).toContainText('#/channels/ch1/intermediate_frequency100000000 50000000');
  await expect(page.locator('#root')).toContainText('#/channels/ch2/intermediate_frequency[1,2,3] [1,2,4]');
  // Update intermediate frequency
  await page.locator('[class^="RunningJob-module__editIconWrapper__"] > svg').first().click();
  await page.getByRole('textbox', { name: 'Enter a value' }).click();
  await page.getByRole('textbox', { name: 'Enter a value' }).fill('20000000'); // Manually updating the frequency to 20000000 
  await page.locator('[class^="RunningJob-module__stateUpdateWrapper__"] > div > div').first().click();
  await expect(page.locator('[class^="RunningJob-module__stateUpdateIconWrapper__"] > svg')).toBeVisible(); // Green checkmark icon appears 
  // Update channels from [1,2,4] to [1,2,4,5]
  await page.locator('[class^="RunningJob-module__editIconWrapper__"] > svg').click();
  await page.getByPlaceholder('Enter a value').nth(1).click();
  await page.getByPlaceholder('Enter a value').nth(1).fill('[1,2,4,5]'); // manually updating the channels to [1,2,4,5] 
  await page.locator('[class^="RunningJob-module__stateUpdatesTopWrapper__"] > div:nth-child(2) > div > div > svg').click();
  await expect(page.locator('div:nth-child(2) > div > [class^="RunningJob-module__stateUpdateIconWrapper__"] > svg')).toBeVisible(); // Green checkmark icon appears
});


  //console.log(await page.locator('body').innerText());
