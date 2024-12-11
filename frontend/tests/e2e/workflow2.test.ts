import { test, expect } from '@playwright/test';

// Test for Workflow 1
// Still in Progress
test('Workflow2', {
    annotation: {
      type: 'Second User Workflow', 
      description: 'Running a calibration graph',
      },
    },  async ({ page }) => {
    

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

    // Ensure the qubits section is editable to include qubits such as `Q0`, `Q2`, and `Q3`.
    const qubitsInput = page.getByRole('textbox', { name: 'qubits' });
    await qubitsInput.fill('q0, q2, q3');
    await expect(qubitsInput).toHaveValue('q0, q2, q3');

    // 3. Modify Node-Specific Parameters:
    // Navigate to a specific node in the calibration graph.
    const parameterTitle3 = page.locator('div:nth-child(3) > [class^="Parameters-module__parameterTitle__"]');
    const arrowIcon3 = parameterTitle3.locator('[class^="Parameters-module__arrowIconWrapper__"]');
    const parameterTitle4 = page.locator('div:nth-child(4) > [class^="Parameters-module__parameterTitle__"]');
    const arrowIcon4 = parameterTitle4.locator('[class^="Parameters-module__arrowIconWrapper__"]');
    await arrowIcon3.first().click();
    await arrowIcon4.first().click();

    await page.locator('div').filter({ hasText: /^Rabi$/ }).locator('div').click();
    // Update a parameter, such as changing the sampling points from `100` to `1000`.
    const samplingPointsInput = page.getByPlaceholder('sampling_points');
    await samplingPointsInput.click();
    await samplingPointsInput.fill('1000');
    await expect(samplingPointsInput).toHaveValue('1000');

    
    // 4. Run the Calibration Graph:
    // Click the "Play" button to start running the graph.
    await page.locator('.GraphElement-module__iconWrapper__uHkqg > div > svg').first().click();
    
    // Verify that the application navigates to the "Graph Status" page.
    //~~await expect(page).toHaveURL(/.*graph-status/);~~

    // Confirm that the graph status shows `Running`.
    await expect(page.getByText('Status: Running')).toBeVisible();

    // Confirm progress (e.g., "1 out of 3 nodes completed") is displayed.
    await expect(page.getByText(/Graph progress: \d+\/\d+ nodes completed/)).toBeVisible();

    // 5. Monitor Graph Execution:
    // Wait for the graph to finish executing.
    await page.waitForTimeout(5000); // Adjust timeout as per actual runtime.
    await expect(page.getByText('Status: Finished')).toBeVisible();

    // Verify total runtime is displayed (e.g., `12 seconds`).
    await expect(page.getByText(/Run duration: \d+\.\d{1,3}s/)).toBeVisible();

    // 6. View Results:
    // Check the results section to ensure that data is displayed.
    await expect(page.getByRole('textbox', { name: 'results' })).toBeVisible();

    // Confirm failed nodes or operations are marked.
    await expect(page.getByText('Failed Nodes')).not.toBeVisible(); // Update if necessary.

    // 7. Inspect Additional Nodes:
    // Navigate through the results of other nodes in the graph.
    await page.getByText('Rabi').click();
    await expect(page.getByRole('textbox', { name: 'results' })).toBeVisible();

    await page.getByText('Ramsey').click();
    await expect(page.getByRole('textbox', { name: 'results' })).toBeVisible();




    // 2. Select a Calibration Graph: 
    // Identify and click on a specific calibration graph (e.g., `Single Qubit Tuneup`).
    // Verify that the graph parameters are displayed.
    // Ensure the qubits section is editable to include qubits such as `Q0`, `Q2`, and `Q3`.


    // 3. Modify Node-Specific Parameters:
    // Navigate to a specific node in the calibration graph.
    // Update a parameter, such as changing the sampling points from `100` to `1000`.
    // Ensure that the updated parameter value is correctly reflected.
    
    // 4. Run the Calibration Graph:
    // Click the "Play" button to start running the graph.
    // Verify that the application navigates to the "Graph Status" page.
    // Confirm that the graph status shows `Running` and that progress (e.g., "1 out of 3 nodes completed") is displayed.
    
    // 5. Monitor Graph Execution:
    // Wait for the graph to finish executing.
    // Verify that the status updates to `Finished` and displays the total runtime (e.g., `12 seconds`).
    
    // 6. View Results:
    // Check the results section to ensure that data (e.g., qubit spectroscopy) is displayed.
    // Confirm that failed nodes or operations are clearly marked, along with the corresponding parameters.
    
    // 7. Inspect Additional Nodes:
    // Navigate through the results of other nodes in the graph (e.g., `Rabi` and `Ramsey`).
    // Verify that all available results are displayed, or confirm that no results are present if the node has not generated data.

    });  