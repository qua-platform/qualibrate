import { NodeNames, NodeType } from "./types";
import { ExperimentSchemaDTO } from "../../../src/modules/Experiments/types";

export const graphAliases = {
  graph: "graph",
  schema: "schema",
  parameters: "parameters",
  patchParameter: "patchParameter",
};

export const graphNodes: NodeType = {
  [NodeNames.CALIBRATION]: {
    x: 472,
    y: 50,
  },
  [NodeNames.SCAN_LIST]: {
    x: 353,
    y: 214,
  },
};

export const graphWorkflow = {
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

export const graphParameters = {
  calibration_1: {
    instrumentAddress: "123.192.41.5",
  },
  scan_list: {
    scan_points: [1.23, 4.2, 10.2, 18.2, 24.2, 27.8, 28.1, 28.6, 29.1, 29.2, 29.1, 30, 30.12],
  },
};

const calibrationSchema: ExperimentSchemaDTO = {
  name: "CalibrateSystem",
  description: "Makes sure that system is calibrated",
  command: "python3",
  bin: "calibrate.py",
  dependancies: [],
  icon: "bootstrap/gear-fill.svg",
  inputs: [
    {
      description: {
        instrumentAddress: "instrument IP address for calibration",
      },
      units: {
        instrumentAddress: "IP address",
      },
      type: {
        instrumentAddress: 1,
      },
    },
  ],
  outputs: [
    {
      description: {
        calibration_status: "Calibration status",
      },
      units: {
        calibration_status: "calibrated, uncalibrated",
      },
      retention: {
        calibration_status: 0,
      },
    },
  ],
};

export const NodeSchemaMap = {
  calibration_1: calibrationSchema,
};
