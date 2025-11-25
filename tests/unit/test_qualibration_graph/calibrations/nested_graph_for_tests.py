from typing import ClassVar, TypeAlias

from qualibrate import (
    GraphParameters,
    QualibrationGraph,
    QualibrationLibrary,
    logger,
)
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate.parameters import RunnableParameters
from qualibrate.q_runnnable import QRunnable

GraphElementType: TypeAlias = QRunnable[RunnableParameters, RunnableParameters]

library = QualibrationLibrary.get_active_library()


class Parameters(GraphParameters):
    targets_name: ClassVar[str] = "qubits_1"
    qubits_1: list[str]


logger.info("-------- start file----")

topg_: QualibrationGraph[GraphElementType] = QualibrationGraph.build(
    "workflow_top",
    parameters=Parameters(qubits_1=[f"q{i}" for i in range(7)]),
    orchestrator=BasicOrchestrator(skip_failed=True),
)
with topg_ as topg:
    with QualibrationGraph.build(
        "subg",
        parameters=Parameters(qubits_1=[f"q{i}" for i in range(7)]),
        orchestrator=BasicOrchestrator(skip_failed=True),
    ) as subg:
        subg.add_node(library.nodes["test_cal"])
        subg.add_node(library.nodes["one_more_node"])
        subg.connect(src="test_cal", dst="one_more_node")


    node1 = library.nodes["test_cal"]

    topg.add_node(subg)
    topg.add_node(node1)

    topg.connect(src=subg, dst=node1)

# print(topg_.serialize())
