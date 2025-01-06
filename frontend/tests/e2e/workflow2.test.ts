import { test, expect } from '@playwright/test';

// Test for Workflow 1
// Still in Progress
test('Workflow2', {
    annotation: {
      type: 'Second User Workflow', 
      description: 'Running a calibration graph',
      },
    },  async ({ page }) => {
    
    // test.setTimeout(60000); // Increase timeout for server readiness or ensure resources are loaded
    // 1. Navigate to the Graph Library:
    // Ensure the application is running at http://127.0.0.1:8001/.
    await page.goto('http://localhost:8001/');
    // Verify that the main page loads successfully.
    expect(page.url()).toBe('http://localhost:8001/'); // page loaded successfully
    // Click on the "Graph Library" tab in the sidebar.
    await page.getByRole('button', { name: 'Graph library' }).click();
    // Confirm make page elements have loaded
    await expect(page.getByRole('heading', { name: 'Run calibration graph' })).toBeVisible();
    await expect(page.getByPlaceholder('graph name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
    await expect(page.getByText('Single Qubit TuneupParametersQubits:Qubit_spectroscopyRabiRamsey')).toBeVisible();
    await expect(page.getByText('test_workflowParametersQubits')).toBeVisible();

    // 2. Select a Calibration Graph:
    // Identify and click on a specific calibration graph (e.g., `Single Qubit Tuneup`).
    await page.getByText('Single Qubit TuneupParametersQubits:Qubit_spectroscopyRabiRamsey').click();
    // Verify that the graph parameters are displayed.
    await expect(page.getByRole('textbox', { name: 'qubits' })).toBeVisible();
    // You see the calibration nodes populated on the left hands side
    await expect(page.getByText('ParametersQubits:Qubit_spectroscopyRabiRamsey')).toBeVisible();
    await expect(page.getByText('ParametersQubits:').first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Qubit_spectroscopy$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Rabi$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Ramsey$/ }).first()).toBeVisible();
    // You see the calibration graph populated the right hand side
    await expect(page.locator('canvas').first()).toBeVisible();
    // Ensure the qubits section is editable to include qubits such as q0, q2, and q3.
    const qubitsInput = page.getByRole('textbox', { name: 'qubits' });
    await qubitsInput.click();
    await qubitsInput.fill('q0, q2, q3');
    await expect(qubitsInput).toHaveValue('q0, q2, q3');

    // 3. Modify Node-Specific Parameters:
    // Navigate to a specific node in the calibration graph and click on the qubit_spectroscopy node.
    await page.locator('canvas').first().click({
      modifiers: ['ControlOrMeta'],
      position: {
        x: 365,
        y: 63
      }
    });
    // verify that its parameters are expanded and are now visable
    await expect(page.locator('div').filter({ hasText: /^Sampling Points:$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Noise Factor:$/ }).first()).toBeVisible();
    // varify parameters qubit parameter has calapsed
    await expect(page.getByRole('textbox', { name: 'qubits' })).toBeHidden();
    // Navigate to the calibration graph and click the middle Rabi node
    await page.waitForTimeout(1000);
    await page.locator('canvas').first().click({
      position: {
        x: 367,
        y: 203
      }
    });
    // varify that the qubit_spectroscopy parameters have calapsed
    await expect(page.getByText('Qubit_spectroscopySampling')).toBeHidden();
    // varify that the Rabi parameters are visible
    await expect(page.getByText('RabiSampling Points:Noise')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Sampling Points:$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Noise Factor:$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Test List:$/ }).first()).toBeVisible();
    // For Rabi, update a parameter, such as changing the sampling points from 100 to 1000.
    const samplingPointsInput = page.getByPlaceholder('sampling_points');
    await samplingPointsInput.click();
    await samplingPointsInput.fill('1000');
    // Ensure that the updated parameter value is correctly reflected.
    await expect(samplingPointsInput).toHaveValue('1000');
    // Expand the Ramsey node it too also works correctly
    const parameterTitle5 = page.locator('div:nth-child(5) > [class^="Parameters-module__parameterTitle__"]');
    const arrowIcon5 = parameterTitle5.locator('[class^="Parameters-module__arrowIconWrapper__"]');
    await arrowIcon5.first().click();

    
    // 4. Run the Calibration Graph:
    // Click the "Play" button to start running the graph.
    await page.locator('[class^="GraphElement-module__iconWrapper__"] > div > svg').first().click();
    // Verify that the application navigates to the "Graph Status" page.
    await expect(page.getByText('Calibration Graph Progress')).toBeVisible();
    // Confirm that the graph status shows `Running`.
    await expect(page.getByText('Status: Running')).toBeVisible();
    // Confirm progress (e.g., "1 out of 3 nodes completed") is displayed.
    await expect(page.getByText('Graph progress: 0/3 node')).toBeVisible();
    await expect(page.getByText('No measurements found')).toBeVisible(); // before any node is measured at all 
    await expect(page.getByText('Graph progress: 1/3 node')).toBeVisible();
    await expect(page.locator('[class^="MeasurementElement-module__row__"]')).toBeVisible(); // Qubit_spectroscopy populates in execution history 
    await expect(page.getByText('Graph progress: 2/3 nodes')).toBeVisible();
    await expect(page.locator('[class^="MeasurementElement-module__rowWrapper__"]').first()).toBeVisible(); // Rabi populates in execution history 
    await expect(page.getByText('Graph progress: 3/3 nodes')).toBeVisible();
    await expect(page.locator('[class^="MeasurementElement-module__rowWrapper__"]').first()).toBeVisible(); // Ramsey populates in execution history 

    // 5. Monitor Graph Execution:
    // Wait for the graph to finish executing.
    await expect(page.getByText('Status: finished')).toBeVisible();
    // Verify total runtime is displayed (e.g., Run duration: 12.176s).
    await expect(page.getByText(/Run duration: \d+\.\d{1,3}s/)).toBeVisible();

    // 6. View Results:
    // Confirm nodes populated in Execution History are expandable and shows Status, Parameters, and Outcomes sections.  
    await page.locator('div:nth-child(3) > [class^="MeasurementElement-module__rowWrapper__"]').click();
    // await expect(page.getByText('#408 Qubit_spectroscopyStatus')).toBeVisible();
    // await expect(page.getByText(/#\d+ Qubit_spectroscopyStatus/)).toBeVisible();
    await expect(page.getByText(/.*Qubit_spectroscopyStatus/)).toBeVisible();
    await expect(page.getByText(/Status:Run start: \d{4}-\d{2}-\d{2}/)).toBeVisible();
    // Status 
    await expect(page.getByText('Status:', { exact: true })).toBeVisible();
    await expect(page.getByText(/Run start: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:/)).toBeVisible();
    // Parameters 
    await expect(page.getByText('Parameters')).toBeVisible();
    await expect(page.getByText('qubits: q0q2q3sampling_points')).toBeVisible();
    await expect(page.getByText('qubits: q0q2q3')).toBeVisible();
    await expect(page.getByText('sampling_points:')).toBeVisible();
    await expect(page.getByText('noise_factor:')).toBeVisible();
    // Outcomes 
    await expect(page.getByText('Outcomes')).toBeVisible();
    // Check the results section to ensure that data (e.g., qubit spectroscopy) is displayed. 
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter a value').first()).toBeVisible();
    await expect(page.getByTestId('data-key-pairfrequency_shift')).toBeVisible();
    await expect(page.getByTestId('data-key-pairfrequency_shift')).toContainText(/"frequency_shift":\d+(\.\d+)?/); // Matches the format of any number
    await expect(page.getByText('"./results_fig.png"')).toBeVisible();
    await expect(page.locator('a')).toBeVisible(); // results figure
    await expect(page.getByTestId('data-key-pairarr')).toBeVisible();
    // Confirm the QuAM state window is visible
    await expect(page.getByRole('heading', { name: 'QuAM' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter a value').nth(1)).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^\{\}0 Items$/ }).first()).toBeVisible();

    // 7 Inspect Additional Nodes:
    // Navigate through the results of other nodes in the graph (e.g., `Rabi` and `Ramsey`).
    await page.locator('canvas').first().click({ // clicking on the Rabi node
      position: {
        x: 157,
        y: 204
      }
    });
    await page.locator('canvas').first().click({ // clicking on the Ramsey node
      position: {
        x: 158,
        y: 348
      }
    });
  });  