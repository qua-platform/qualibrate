from typing import ClassVar

from qualibrate import (
    logger,
)
from qualibrate.orchestration.basic_orchestrator import BasicOrchestrator
from qualibrate import GraphParameters, QualibrationGraph, QualibrationLibrary

library = QualibrationLibrary.get_active_library()


class Parameters(GraphParameters):
    targets_name: ClassVar[str] = "qubits_1"
    qubits_1: list[str]


logger.info("-------- start file----")
with QualibrationGraph.build(
    "long_graph",
    parameters=Parameters(qubits_1=[f"q{i}" for i in range(3)]),
    orchestrator=BasicOrchestrator(skip_failed=True),
) as subg:
    subg.add_node(library.nodes.get_nocopy("test_node").copy(name=f"node_1"))
    for i in range(2,150):
        subg.add_node(library.nodes.get_nocopy("test_node").copy(name=f"node_{i}"))
        subg.connect(src=f"node_{i-1}", dst=f"node_{i}")

subg.run()
# # node1 = library.nodes["test_node"]
# if __name__ == "__main__":
#     print(45)