# QUAlibrate-App

**Web Application for Managing Quantum Calibration**

QUAlibrate-App is the web-based interface of the QUAlibrate project, providing a user-friendly way to manage and run calibration routines for quantum processing units (QPUs). For more detailed information, visit the [QUAlibrate documentation page](https://qua-platform.github.io/qualibrate/).&#x20;

QUAlibrate-App consists of both frontend and backend components, allowing users to interact with their quantum system through an intuitive web interface. The web app allows users to run calibration nodes and graphs, view live updates, and access data visualization tools, making the calibration process more accessible for both researchers and engineers.

## Installation

It is recommended to install QUAlibrate-App through the main QUAlibrate package:

```bash
pip install qualibrate
```

This install `qualibrate-core`, `qualibrate-app`, and `qualibrate-runner`.

Alternatively, QUAlibrate-App can be installed separately through

```bash
pip install qualibrate-app
```

However, to perform any calibrations using QUAlibrate-App, it needs to be linked to a qualibrate-runner server that is capable of executing the calibrations. For additional guidance, visit the [QUAlibrate Documentation](https://qua-platform.github.io/qualibrate/).

## Running the Web App

Before starting the web interface, run the configuration setup:

```bash
qualibrate config
```

After the configuration is complete, start the web interface with:

```bash
qualibrate start
```

This should start up the QUAlibrate server, and will indicate the web path, the default being `localhost:8001`.

## Developer Installation

For developers who want to contribute to QUAlibrate-App or run the app locally with the latest code changes, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/qua-platform/qualibrate-app.git
   cd qualibrate-app
   ```

2. Install the backend dependencies:

   ```bash
   cd backend
   pip install -e .
   ```

3. Install the frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

   After running `npm run build`, a `dist` folder will be created. Copy this folder to the backend directory:

   ```bash
   cp -r dist ../backend/
   ```

4. Run the web app for development:

   ```bash
   qualibrate config
   qualibrate start
   ```

## License

QUAlibrate-App is licensed under the BSD-3 license. See the [LICENSE](https://github.com/qua-platform/qualibrate-app/blob/main/LICENSE) file for more details.
