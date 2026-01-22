# End to End Workflow Navigation Testing 

[![Playwright Tests](https://github.com/qua-platform/qualibrate-app/actions/workflows/playwright-tests.yaml/badge.svg)](https://github.com/qua-platform/qualibrate-app/actions/workflows/playwright-tests.yaml)

### Overview
This is a front-end testing suite for integration workflows for the QUAlibrate Application. The following tests are designed to validate the functionality and correctness of [user workflows](https://quantum-machines.atlassian.net/wiki/spaces/hlsw/pages/3223912481/QAPP+UX+Design+Brief#User-workflows) section of the online documentation. 

---

### Prerequisites
1. Ensure you have cloned the **QUAlibrate** repository from GitHub.
2. Verify that you have the necessary node calibration scripts available to execute the workflows.

To start the QUAlibrate server locally, use the following command in your terminal:

```bash
qualibrate start
```
Once the server is running, access the application at http://127.0.0.1:8001/.

## Running Tests Locally with `act`

To simulate GitHub Actions locally and run the tests, you can use the `act` tool.

### Prerequisites

1. Install [act](https://github.com/nektos/act) by following the installation instructions on its GitHub page.
2. Ensure Docker is installed and running on your machine.

### Running Tests

To execute the Playwright tests locally using act, run the following command from qualibrate-app directory:
```bash
act -j test --container-architecture linux/amd64 -s GITHUB_TOKEN=<your_token> -s QUALIBRATION_EXAMPLES_TOKEN=<your_token>
```
- -j test: Runs the test job defined in the GitHub Actions workflow file.
- --container-architecture linux/amd64: Ensures compatibility with the workflow container.
- Replace <your_token> with the actual token value you generated. 
    - For GITHUB_TOKEN: 
        - Navigate [here](https://github.com/settings/personal-access-tokens/new) and enter any token name, scroll down, click generate, then copy token and paste into script
        - This will initially allow the playwright-tests.yaml script to checkout the necessary repositories 
    - for QUALIBRATION_EXAMPLES_TOKEN:
        - This will allow the GitHub Action to access the qualibrate-examples repository and pull the necessary calibration scripts which are a test-dependency. 
        - Note: Manually entering these tokens aren't a requirement for runinng the tests on Github, only locally with `act`. 

This will perform the steps as defined in the CI pipeline, including:
- Installing dependencies.
- Starting the qualibrate server.
- Running the Playwright tests.

(refer to qualibrate-app/.github/workflows/playwright-tests.yaml directly for more details)

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
