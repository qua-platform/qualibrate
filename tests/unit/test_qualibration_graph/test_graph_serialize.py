from collections import defaultdict
from collections.abc import Sequence
from typing import Any

from qualibrate.models.node_status import ElementRunStatus
from qualibrate.models.outcome import Outcome
from qualibrate.orchestration.qualibration_orchestrator import (
    QualibrationOrchestrator,
)
from qualibrate.parameters import (
    GraphParameters,
)
from qualibrate.qualibration_graph import QualibrationGraph
from qualibrate.qualibration_library import QualibrationLibrary


class Orchestrator(QualibrationOrchestrator):
    def traverse_graph(
        self, graph: QualibrationGraph, targets: Sequence[Any]
    ) -> None:
        pass


def test_serialize_with_no_nested_graphs(
    qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
):
    g = QualibrationGraph(
        "name",
        graph_params,
        dict(qualibration_lib.nodes.items()),
        [("test_node", "one_more_node"), ("one_more_node", "test_cal")],
        orchestrator=Orchestrator(),
        description="some description",
    )
    assert g.serialize() == {
        "name": "name",
        "description": "some description",
        "orchestrator": {
            "__class__": (
                "tests.unit.test_qualibration_graph.test_graph_serialize"
                ".Orchestrator"
            ),
            "parameters": {},
        },
        "nodes": {
            "test_node": {
                "status": ElementRunStatus.pending,
                "retries": 0,
                "id": "test_node",
                "name": "test_node",
                "parameters": {
                    "str_value": {
                        "default": "test",
                        "title": "Str Value",
                        "type": "string",
                        "is_targets": False,
                    },
                    "int_value": {
                        "default": 1,
                        "title": "Int Value",
                        "type": "integer",
                        "is_targets": False,
                    },
                    "float_value": {
                        "default": 1.0,
                        "title": "Float Value",
                        "type": "number",
                        "is_targets": False,
                    },
                },
            },
            "one_more_node": {
                "status": ElementRunStatus.pending,
                "retries": 0,
                "id": "one_more_node",
                "name": "one_more_node",
                "parameters": {
                    "str_value": {
                        "default": "test",
                        "title": "Str Value",
                        "type": "string",
                        "is_targets": False,
                    },
                    "float_value": {
                        "default": 1.0,
                        "title": "Float Value",
                        "type": "number",
                        "is_targets": False,
                    },
                },
            },
            "test_cal": {
                "status": ElementRunStatus.pending,
                "retries": 0,
                "id": "test_cal",
                "name": "test_cal",
                "parameters": {
                    "resonator": {
                        "default": "q1.resonator",
                        "title": "Resonator",
                        "type": "string",
                        "is_targets": False,
                    },
                    "sampling_points": {
                        "default": 100,
                        "title": "Sampling Points",
                        "type": "integer",
                        "is_targets": False,
                    },
                },
            },
        },
        "connectivity": [
            ("test_node", "one_more_node"),
            ("one_more_node", "test_cal"),
        ],
        "parameters": {
            "retries": {
                "default": 1,
                "is_targets": False,
                "title": "Retries",
                "type": "integer",
            },
            "qubits": {
                "is_targets": True,
                "items": {"type": "string"},
                "title": "Qubits",
                "type": "array",
            },
        },
        # "flow": {
        #     "nodes": [
        #         {
        #             "id": 1,
        #             "data": {
        #                 "label": "test_node"
        #             }
        #         },
        #         {
        #             "id": 2,
        #             "data": {
        #                 "label": "one_more_node"
        #             }
        #         },
        #         {
        #             "id": 3,
        #             "data": {
        #                 "label": "test_cal"
        #             }
        #         }
        #     ],
        #     "edges": [
        #         {
        #             "data": {
        #                 "condition": Outcome.SUCCESSFUL
        #             },
        #             "id": "test_node -> one_more_node",
        #             "source": "test_node",
        #             "target": "one_more_node"
        #         },
        #         {
        #             "data": {
        #                 "condition": Outcome.SUCCESSFUL
        #             },
        #             "id": "one_more_node -> test_cal",
        #             "source": "one_more_node",
        #             "target": "test_cal"
        #         }
        #     ],
        # }
    }

# def test_serialize_with_nested_graphs(
#         qualibration_lib: QualibrationLibrary, graph_params: GraphParameters
# ):
#     g = qualibration_lib.graphs["workflow_top"]
#     assert g.serialize() == {
#   "name": "workflow_top",
#   "parameters": {
#     "qubits_1": {
#       "default": [
#         "q0",
#         "q1",
#         "q2",
#         "q3",
#         "q4",
#         "q5",
#         "q6"
#       ],
#       "items": {
#         "type": "string"
#       },
#       "title": "Qubits 1",
#       "type": "array",
#       "is_targets": True
#     }
#   },
#   "description": None,
#   "orchestrator": {
#     "__class__": "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator",
#     "parameters": {
#       "skip_failed": {
#         "default": True,
#         "title": "Skip Failed",
#         "type": "boolean"
#       }
#     }
#   },
#   "nodes": {
#     "subg": {
#       # "status": "pending",
#       # "retries": 0,
#       "id": "subg",
#       "name": "subg",
#       "parameters": {
#         "qubits_1": {
#           "default": [
#             "q0",
#             "q1",
#             "q2",
#             "q3",
#             "q4",
#             "q5",
#             "q6"
#           ],
#           "items": {
#             "type": "string"
#           },
#           "title": "Qubits 1",
#           "type": "array",
#           "is_targets": True
#         }
#       },
#       "description": None,
#       "orchestrator": {
#         "__class__": "qualibrate.orchestration.basic_orchestrator.BasicOrchestrator",
#         "parameters": {
#           "skip_failed": {
#             "default": True,
#             "title": "Skip Failed",
#             "type": "boolean"
#           }
#         }
#       },
#       "nodes": {
#         "test_cal": {
#           # "status": "pending",
#           # "retries": 0,
#           "id": "test_cal",
#           "name": "test_cal",
#           "parameters": {
#             "resonator": {
#               "default": "q1.resonator",
#               "title": "Resonator",
#               "type": "string",
#               "is_targets": False
#             },
#             "sampling_points": {
#               "default": 100,
#               "title": "Sampling Points",
#               "type": "integer",
#               "is_targets": False
#             }
#           }
#         },
#         "one_more_node": {
#           # "status": "pending",
#           # "retries": 0,
#           "id": "one_more_node",
#           "name": "one_more_node",
#           "parameters": {
#             "str_value": {
#               "default": "test",
#               "title": "Str Value",
#               "type": "string",
#               "is_targets": False
#             },
#             "float_value": {
#               "default": 1,
#               "title": "Float Value",
#               "type": "number",
#               "is_targets": False
#             }
#           }
#         }
#       },
#       "connectivity": [
#         (
#           "test_cal",
#           "one_more_node"
#         )
#       ]
#     },
#     "test_cal": {
#       # "status": "pending",
#       # "retries": 0,
#       "id": "test_cal",
#       "name": "test_cal",
#       "parameters": {
#         "resonator": {
#           "default": "q1.resonator",
#           "title": "Resonator",
#           "type": "string",
#           "is_targets": False
#         },
#         "sampling_points": {
#           "default": 100,
#           "title": "Sampling Points",
#           "type": "integer",
#           "is_targets": False
#         }
#       }
#     }
#   },
#   "connectivity": [
#     (
#       "subg",
#       "test_cal"
#     )
#   ],
#   "flow": {
#     "nodes": [
#       {
#         "id": 3,
#         "data": {
#           "label": "subg",
#           "subgraph": {
#             "nodes": [
#               {
#                 "id": 1,
#                 "data": {
#                   "label": "test_cal"
#                 }
#               },
#               {
#                 "id": 2,
#                 "data": {
#                   "label": "one_more_node"
#                 }
#               }
#             ],
#             "edges": [
#               {
#                 "id": "test_cal -> one_more_node",
#                 "source": "test_cal",
#                 "target": "one_more_node",
#                 "data": {
#                   "condition": Outcome.SUCCESSFUL
#                 }
#               }
#             ]
#           }
#         }
#       },
#       {
#         "id": 4,
#         "data": {
#           "label": "test_cal"
#         }
#       }
#     ],
#     "edges": [
#       {
#         "id": "subg -> test_cal",
#         "source": "subg",
#         "target": "test_cal",
#         "data": {
#           "condition": Outcome.SUCCESSFUL
#         }
#       }
#     ]
#   }
# }