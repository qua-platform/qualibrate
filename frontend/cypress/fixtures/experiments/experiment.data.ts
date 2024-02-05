export const ExperimentWorkflow = {
  name: "Scan with error correction",
  description: "Performs Bayesian estimation for the optimal parameters and uses this during the circuit run.",
  graph: {
    data: [],
    directed: true,
    multigraph: false,
    elements: {
      nodes: [
        {
          data: {
            ident: "calibration_1",
            name: "CalibrateSystem",
            id: "calibration_1",
            value: "calibration_1",
          },
        },
        {
          data: {
            ident: "scan_list",
            name: "TaskList",
            id: "scan_list",
            value: "scan_list",
          },
        },
        {
          data: {
            ident: "external_instruments",
            name: "ExternalScan",
            id: "external_instruments",
            value: "external_instruments",
          },
        },
        {
          data: {
            ident: "QPU",
            name: "QPUcircuitRunner",
            id: "QPU",
            value: "QPU",
          },
        },
        {
          data: {
            ident: "correction_1",
            name: "BayesianEstimation",
            id: "correction_1",
            value: "correction_1",
          },
        },
        {
          data: {
            ident: "final_report",
            name: "FinalDataAnalysis",
            id: "final_report",
            value: "final_report",
          },
        },
      ],
      edges: [
        {
          data: {
            source: "calibration_1",
            target: "scan_list",
          },
        },
        {
          data: {
            source: "scan_list",
            target: "external_instruments",
          },
        },
        {
          data: {
            source: "scan_list",
            target: "QPU",
          },
        },
        {
          data: {
            source: "external_instruments",
            target: "scan_list",
          },
        },
        {
          data: {
            source: "QPU",
            target: "scan_list",
          },
        },
        {
          data: {
            source: "QPU",
            target: "correction_1",
          },
        },
        {
          data: {
            source: "QPU",
            target: "final_report",
          },
        },
        {
          data: {
            source: "correction_1",
            target: "QPU",
          },
        },
      ],
    },
  },
  resolved_inputs: {
    calibration_1: {},
    scan_list: {
      calibration: "#calibration_1/calibration_status",
      laser_setpoint_locked: "#external_instruments/setpoint_reached",
      circuit_done: "#QPU/circuit_finished",
    },
    external_instruments: {
      set_point: "#scan_list/scan_setpoint",
    },
    QPU: {
      circuit_param: "#scan_list/circuit_specification",
      error_correction: "#correction_1/correction_data",
    },
    correction_1: {
      precorrected_data: "#QPU/precorrected_data",
    },
    final_report: {
      data: "#QPU/final_data",
    },
  },
  icons: {
    CalibrateSystem: "bootstrap/gear-fill.svg",
    TaskList: "bootstrap/list-task.svg",
    ExternalScan: "bootstrap/sliders.svg",
    QPUcircuitRunner: "bootstrap/cpu.svg",
    BayesianEstimation: "bootstrap/speedometer.svg",
    FinalDataAnalysis: "bootstrap/file-bar-graph.svg",
  },
};

export const ExperimentDataList = [
  {
    description: "test",
    project_id: 1,
    runtime_id: 1,
    author_id: 1,
    submit: "2022-07-20T09:41:28.735605+00:00",
    current_status: "Successful",
    id: 66,
    workflow_id: 19,
    parameters_id: 21,
    start: "2022-07-20T09:41:29.229414+00:00",
    end: "2022-07-20T09:42:27.845725+00:00",
    eui: {
      path: "#/j42",
    },
  },
  {
    description: "mqtt job 6",
    project_id: 1,
    runtime_id: 1,
    author_id: 1,
    submit: "2022-06-16T09:59:16.129017+00:00",
    current_status: "Successful",
    id: 58,
    workflow_id: 14,
    parameters_id: 16,
    start: null,
    end: "2022-06-16T09:59:23.808767+00:00",
    eui: {
      path: "#/j3a",
    },
  },
  {
    description: "mqtt job 5",
    project_id: 1,
    runtime_id: 1,
    author_id: 1,
    submit: "2022-06-16T09:56:32.491491+00:00",
    current_status: "Successful",
    id: 57,
    workflow_id: 14,
    parameters_id: 16,
    start: null,
    end: "2022-06-16T09:56:40.443878+00:00",
    eui: {
      path: "#/j39",
    },
  },
  {
    description: "mqtt job 4",
    project_id: 1,
    runtime_id: 1,
    author_id: 1,
    submit: "2022-06-16T09:55:41.366213+00:00",
    current_status: "Successful",
    id: 56,
    workflow_id: 14,
    parameters_id: 16,
    start: null,
    end: "2022-06-16T09:55:49.368615+00:00",
    eui: {
      path: "#/j38",
    },
  },
];
