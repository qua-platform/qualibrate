# End to End Workflow Navigation Testing 

### Overview
The following tests are designed to validate the functionality and correctness of [user workflows](https://quantum-machines.atlassian.net/wiki/spaces/hlsw/pages/3223912481/QAPP+UX+Design+Brief#User-workflows) in the QUAlibrate application.

---

### Prerequisites
1. Ensure you have cloned the **QUAlibrate** repository from GitHub.
2. Verify that you have the necessary node calibration scripts available to execute the workflows.

To start the QUAlibrate server locally, use the following command in your terminal:

```bash
qualibrate start
```
Once the server is running, access the application at http://127.0.0.1:8001/.

## Workflow 1: Running a calibration node 

### This test validates the end-to-end workflow of running a calibration node in the QUAlibrate application.

1. **Navigate to the Application**
    - Open http://127.0.0.1:8001/ in your web browser.
    - Verify the landing page loads successfully, and the Node Library is visible.
2. **Verify Calibration Nodes**
    - Check that at least one calibration node (e.g., `test_cal`) is displayed in the Node Library.
    - Check that node has no visible parameters 
3. **Select a Calibration Node**
    - Click the test_cal node.
    - Verify:
        - ~~The node label and parameters are displayed.~~
        - Check that the 3 different labels exist, their feilds are modifiable, and has corresponding default parameters 
4. **Change a node parameter value**
    - Varify that it's possible to replace the default parameter values with new ones 
5. **Run the Calibration Node**
    - Click the Run button for test_cal.
    - Verify:
        - The Running Job section appears, showing parameters and status.
        - Job status changes to finished upon completion, along with other stats.
            - parameters here match parameters in node parameter feilds 
7. **Check Results**
    - Confirm the Results section is populated with:
        - Numerical values.
        - A generated figure.
        - Data storage location.
8. **Check/Update State Values**
    - Verify the State Updates section displays suggested changes.
    - Modify values, click the up-arrow to apply changes, and ensure updates are successful.


## Workflow 2: Running a Calibration Graph

### The following workflow tests the functionality of running a calibration graph within the QUAlibrate application.

1. **Navigate to the Graph Library**:
   - Ensure the application is running at http://127.0.0.1:8001/.
   - Verify that the main page loads successfully.
   - Click on the "Graph Library" tab in the sidebar.
        - Confirm make page elements have loaded 
2. **Select a Calibration Graph**:
   - Identify and click on a specific calibration graph (e.g., `Single Qubit Tuneup`).
   - Verify that the graph parameters are displayed.
      - You see the calibration nodes populated on the left hands side 
      - You see the calibration graph populated the right hand side 
   - Ensure the qubits section is editable to include qubits such as `Q0`, `Q2`, and `Q3`.
3. **Modify Node-Specific Parameters**:
   - Navigate to a specific node in the calibration graph.
   - Update a parameter, such as changing the sampling points from `100` to `1000`.
   - Ensure that the updated parameter value is correctly reflected.
4. **Run the Calibration Graph**:
   - Click the "Play" button to start running the graph.
   - Verify that the application navigates to the "Graph Status" page.
   - Confirm that the graph status shows `Running` and that progress (e.g., "1 out of 3 nodes completed") is displayed.
5. **Monitor Graph Execution**:
   - Wait for the graph to finish executing.
   - Verify that the status updates to `Finished` and displays the total runtime (e.g., `12 seconds`).
6. **View Results**:
   - Check the results section to ensure that data (e.g., qubit spectroscopy) is displayed.
   - Confirm that failed nodes or operations are clearly marked, along with the corresponding parameters.
7. **Inspect Additional Nodes**:
   - Navigate through the results of other nodes in the graph (e.g., `Rabi` and `Ramsey`).
   - Verify that all available results are displayed, or confirm that no results are present if the node has not generated data.


## Workflow 3: Viewing Past Data

### This workflow ensures users can effectively interact with the "Data" section to review previously recorded measurements, inspect quantum system states, and view saved calibration results.

1. **Navigate to the Data Section**:
   - Open http://127.0.0.1:8001/ in your web browser.
   - Click on the "Data" tab in the sidebar.
   - Verify that the "Measurement History" heading is visible and that a list of past measurements is displayed.

2. **Verify Measurements**:
   - Check that at least two measurements (e.g., `qubit_spectroscopy`, `Power Rabi`) are present in the measurement list.
   - Confirm each measurement has a unique identifier and associated metadata.

3. **Search Quantum States**:
   - Use the search bar to filter measurements (e.g., search for "channel1").
   - Verify that the results update dynamically and only display relevant entries.

4. **Expand and Collapse Quantum States**:
   - Click on a quantum state entry to expand it.
   - Verify that the entry shows detailed data, such as channels and their respective values.
   - Collapse the entry and ensure it hides the details.

5. **Validate Qual Updates**:
   - Select a measurement with qual updates (e.g., `Power Rabi`).
   - Verify that the updates show old and new values for relevant parameters.
   - Check that updates correspond accurately to the recorded calibration data.

6. **Handle Missing Data**:
   - Identify a measurement without saved qual states.
   - Verify that an appropriate message (e.g., "No qual state saved for this measurement.") is displayed to the user.


#### ~~Workflow 4: Typical runtime workflows~~
- ~~Verify seamless switching between tabs during runtime.~~
- ~~Validate runtime updates appear dynamically in the "Running Job" container.~~
- ~~Test runtime responsiveness to changes in parameters mid-execution.~~
- ~~Verify logs and results update dynamically during node execution.~~
- ~~Check the correctness of intermediate runtime results (e.g., partial graphs, lo~~gs).
- ~~Test edge cases, such as disconnecting from the server mid-execution.~~
- ~~Ensure error handling for unexpected runtime failures.~~


#### ~~Workflow 5: Changing project~~
- ~~Verify navigation to the Project tab.~~
- ~~Validate project selection from the list.~~
- ~~Test search functionality for projects (case-insensitive).~~
- ~~Verify double-click opens a project directly.~~
- ~~Ensure switching projects reloads associated nodes and graphs.~~
- ~~Test project state retention (e.g., saving/loading).~~
- ~~Validate project creation via the "+" button.~~
- ~~Ensure feedback is provided for invalid or duplicate project names.~~
