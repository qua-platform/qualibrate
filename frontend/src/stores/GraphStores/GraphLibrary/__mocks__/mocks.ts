import { GraphMap } from "../GraphLibraryStore";

export const MOCK_ALL_GRAPHS: GraphMap = {
  "Single Qubit Tuneup": {
    name: "workflow_top",
    parameters: {
      qubits_1: {
        default: ["q0", "q1", "q2", "q3", "q4", "q5", "q6"],
        items: { type: "string" },
        title: "Qubits 1",
        type: "array",
        is_targets: true,
      },
    },
    description: null,
    orchestrator: {
      __class__: "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator",
      parameters: {
        skip_failed: {
          default: true,
          title: "Skip Failed",
          type: "boolean",
        },
      },
    },
    nodes: {
      workflow1: {
        status: "pending",
        id: "workflow1",
        name: "workflow1",
        parameters: {
          qubits_1: {
            default: ["q1", "q2", "q5"],
            items: { type: "string" },
            title: "Qubits 1",
            type: "array",
            is_targets: true,
          },
          wf_param: {
            default: "some_str_param",
            description: "wf_param description",
            title: "Wf Param",
            type: "string",
            is_targets: false,
          },
        },
        description: null,
        orchestrator: {
          __class__: "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator",
          parameters: {
            skip_failed: {
              default: true,
              title: "Skip Failed",
              type: "boolean",
            },
          },
        },
        nodes: {
          wf_node1: {
            id: "wf_node1",
            name: "wf_node1",
            parameters: {
              sampling_points: {
                default: 500,
                description: "Sampling points description",
                title: "Sampling Points",
                type: "integer",
                is_targets: false,
              },
              noise_factor: {
                default: 0.1,
                description: "Noise factor rate",
                title: "Noise Factor",
                type: "number",
                is_targets: false,
              },
            },
          },
          wf_node2: {
            id: "wf_node2",
            name: "wf_node2",
            parameters: {
              sampling_points: {
                default: 100,
                title: "Sampling Points",
                type: "integer",
                is_targets: false,
              },
              noise_factor: {
                default: 0.1,
                title: "Noise Factor",
                type: "number",
                is_targets: false,
              },
            },
          },
          wf_node3: {
            id: "wf_node3",
            name: "wf_node3",
            parameters: {
              sampling_points: {
                default: 100,
                title: "Sampling Points",
                type: "integer",
                is_targets: false,
              },
              noise_factor: {
                default: 0.1,
                title: "Noise Factor",
                type: "number",
                is_targets: false,
              },
            },
          },
        },
        connectivity: [["wf_node1", "wf_node3"]],
      },
      workflow2: {
        status: "pending",
        id: "workflow2",
        name: "workflow2",
        parameters: {
          qubits_1: {
            default: ["q1", "q2", "q5"],
            items: {
              type: "string",
            },
            title: "Qubits 1",
            type: "array",
            is_targets: true,
          },
          wf_param: {
            default: "some_str_param",
            description: "wf_param description",
            title: "Wf Param",
            type: "string",
            is_targets: false,
          },
        },
        description: null,
        orchestrator: {
          __class__: "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator",
          parameters: {
            skip_failed: {
              default: true,
              title: "Skip Failed",
              type: "boolean",
            },
          },
        },
        nodes: {
          wf_node1: {
            id: "wf_node1",
            name: "wf_node1",
            parameters: {
              sampling_points: {
                default: 500,
                description: "Sampling points description",
                title: "Sampling Points",
                type: "integer",
                is_targets: false,
              },
              noise_factor: {
                default: 0.1,
                description: "Noise factor rate",
                title: "Noise Factor",
                type: "number",
                is_targets: false,
              },
            },
          },
          wf_node2: {
            id: "wf_node2",
            name: "wf_node2",
            parameters: {
              sampling_points: {
                default: 100,
                title: "Sampling Points",
                type: "integer",
                is_targets: false,
              },
              noise_factor: {
                default: 0.1,
                title: "Noise Factor",
                type: "number",
                is_targets: false,
              },
            },
          },
          wf_node3: {
            id: "wf_node3",
            name: "wf_node3",
            parameters: {
              sampling_points: {
                default: 100,
                title: "Sampling Points",
                type: "integer",
                is_targets: false,
              },
              noise_factor: {
                default: 0.1,
                title: "Noise Factor",
                type: "number",
                is_targets: false,
              },
            },
          },
        },
        connectivity: [["wf_node1", "wf_node3"]],
      },
      node1: {
        status: "pending",
        id: "node1",
        name: "node1",
        parameters: {
          sampling_points: {
            default: 120,
            description: "Sampling points description",
            title: "Sampling Points",
            type: "integer",
            is_targets: false,
          },
          noise_factor: {
            default: 0.1,
            description: "Noise factor rate",
            title: "Noise Factor",
            type: "number",
            is_targets: false,
          },
        },
      },
    },
    connectivity: [
      ["workflow1", "workflow2"],
      ["workflow2", "node1"],
    ],
  },
};
