"""
Job execution orchestration for QualibrationNodes and workflows.

This module provides the top-level execution layer for running calibration
nodes and workflows (graphs). It handles:
- Parameter validation
- State tracking throughout execution
- Error capture and reporting
- Timestamp management (start/completion times)
- Integration with the active QualibrationLibrary

The execution follows a try-except-finally pattern to ensure state is always
updated, even when errors occur. This state is used by the web UI and other
monitoring systems to track calibration progress.
"""

import traceback
from collections.abc import Mapping
from datetime import datetime
from typing import Any, cast

from fastapi import HTTPException, status
from pydantic import BaseModel, ValidationError
from qualibrate.models.run_summary.graph import GraphRunSummary
from qualibrate.models.run_summary.node import NodeRunSummary
from qualibrate.qualibration_library import QualibrationLibrary

from qualibrate_runner.config import State
from qualibrate_runner.core.models.common import RunError
from qualibrate_runner.core.models.enums import RunnableType, RunStatusEnum
from qualibrate_runner.core.models.last_run import LastRun
from qualibrate_runner.core.types import QGraphType, QLibraryType, QNodeType


def validate_input_parameters(
    parameters_class: type[BaseModel],
    passed_parameters: Mapping[str, Any],
) -> BaseModel:
    """
    Validate input parameters against a Pydantic model schema.

    This function ensures that parameters passed to nodes or workflows conform
    to their expected schema. If validation fails, it raises an HTTP exception
    suitable for API responses.

    Args:
        parameters_class: The Pydantic model class defining the expected
            parameter schema
        passed_parameters: Dictionary of parameter names and values to validate

    Returns:
        A validated Pydantic model instance with the parameters

    Raises:
        HTTPException: With status 422 (Unprocessable Entity) if validation
            fails, containing detailed error information from Pydantic
    """
    try:
        return parameters_class.model_validate(passed_parameters)
    except ValidationError as ex:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=ex.errors()
        ) from ex


def get_active_library_or_error() -> QLibraryType:
    """
    Retrieve the currently active QualibrationLibrary.

    This is a thin wrapper around QualibrationLibrary.get_active_library that
    explicitly requests an existing library (create=False). It will raise an
    error if no active library exists.

    Returns:
        The active QualibrationLibrary instance

    Raises:
        Exception: If no active library exists (raised by get_active_library)
    """
    return QualibrationLibrary.get_active_library(create=False)


def run_node(
    node: QNodeType,
    passed_input_parameters: Mapping[str, Any],
    state: State,
) -> None:
    """
    Execute a single QualibrationNode with comprehensive state tracking.

    This function orchestrates the execution of a calibration node, managing
    the complete lifecycle:
    1. Initialize state with RUNNING status
    2. Execute the node in interactive mode
    3. Capture any errors with full traceback
    4. Update state with final results (success or error)

    The state is ALWAYS updated in the finally block, ensuring monitoring
    systems have accurate information even when exceptions occur.

    Args:
        node: The QualibrationNode instance to execute
        passed_input_parameters: Runtime parameters to pass to the node's
            run method
        state: Global state object that tracks the current run status and
            results for monitoring/UI purposes

    Raises:
        Exception: Any exception raised by node.run() is re-raised after
            being captured in state.last_run.error

    Side Effects:
        - Updates state.run_item to reference the executing node
        - Updates state.last_run with execution status, timing, and results
        - Calls node.run() which may execute quantum programs and update
          quantum machine state
    """
    # Set the currently executing item for monitoring
    state.run_item = node
    run_status = RunStatusEnum.RUNNING

    # Initialize the run tracking with start time and RUNNING status
    state.last_run = LastRun(
        name=node.name,
        status=RunStatusEnum.RUNNING,
        idx=-1,  # Snapshot index, updated after successful run
        passed_parameters=passed_input_parameters,
        started_at=datetime.now().astimezone(),
        runnable_type=RunnableType.NODE,
    )

    # Track snapshot index and error state
    idx = -1
    run_error = None

    try:
        # Execute the node in interactive mode with provided parameters
        # interactive=True enables that the user approves changes to variables in the frontend after execution
        node.run(interactive=True, **passed_input_parameters)
    except Exception as ex:
        # Capture error details for state tracking
        run_status = RunStatusEnum.ERROR
        run_error = RunError(
            error_class=ex.__class__.__name__,
            message=str(ex),
            traceback=traceback.format_tb(ex.__traceback__),
        )
        # Re-raise to allow caller to handle the error
        raise
    else:
        # If successful, capture the snapshot index for data storage
        # The snapshot_idx links results to stored data files
        _idx = node.snapshot_idx if hasattr(node, "snapshot_idx") else -1
        idx = _idx if _idx is not None else -1
        run_status = RunStatusEnum.FINISHED
    finally:
        # ALWAYS update state with final results, even if an error occurred
        # This ensures the UI and monitoring systems have current information
        state.last_run = LastRun(
            name=state.last_run.name,
            status=run_status,
            idx=idx,
            # TODO: Make run summary generic
            run_result=cast(NodeRunSummary | None, node.run_summary),
            runnable_type=state.last_run.runnable_type,
            passed_parameters=passed_input_parameters,
            started_at=state.last_run.started_at,
            completed_at=datetime.now().astimezone(),
            state_updates=node.state_updates,  # QuAM state changes
            error=run_error,
        )


def run_workflow(
    workflow: QGraphType,
    passed_input_parameters: Mapping[str, Any],
    state: State,
) -> None:
    """
    Execute a calibration workflow (DAG of QualibrationNodes).

    This function orchestrates the execution of a workflow (also called a graph),
    which is a directed acyclic graph (DAG) of interconnected QualibrationNodes.
    The workflow execution follows these steps:
    1. Initialize state with RUNNING status
    2. Get a fresh copy of the workflow from the active library
    3. Validate and structure the input parameters
    4. Execute the workflow's DAG, running nodes in dependency order
    5. Capture any errors with full traceback
    6. Update state with final results

    The workflow is retrieved fresh from the library to ensure a clean instance
    for each run, avoiding state pollution between runs.

    Args:
        workflow: The workflow (graph) instance to execute - note that a fresh
            copy is retrieved from the library, so this is mainly used for
            the name
        passed_input_parameters: Runtime parameters containing both workflow-
            level parameters and node-specific parameters. These are validated
            against workflow.full_parameters_class which includes both
            'parameters' (workflow-level) and 'nodes' (per-node overrides)
        state: Global state object that tracks the current run status and
            results for monitoring/UI purposes

    Raises:
        Exception: Any exception raised during workflow execution is re-raised
            after being captured in state.last_run.error

    Side Effects:
        - Updates state.run_item to reference the executing workflow
        - Updates state.last_run with execution status, timing, and results
        - Executes all nodes in the workflow DAG in dependency order
        - May execute quantum programs and update quantum machine state
    """
    run_status = RunStatusEnum.RUNNING

    # Initialize the run tracking with start time and RUNNING status
    state.last_run = LastRun(
        name=workflow.name,
        status=run_status,
        idx=-1,  # Snapshot index, updated after successful run
        started_at=datetime.now().astimezone(),
        runnable_type=RunnableType.GRAPH,
        passed_parameters=passed_input_parameters,
    )

    # Track snapshot index and error state
    idx = -1
    run_error = None

    try:
        # Get the active library to retrieve a fresh workflow copy
        library = get_active_library_or_error()

        # Get a fresh copy of the workflow from the library
        # This ensures each run starts with a clean state
        workflow = library.graphs[workflow.name]

        # Set the currently executing item for monitoring
        state.run_item = workflow

        # Validate and structure input parameters
        # full_parameters_class expects: {parameters: {...}, nodes: {...}}
        # where 'parameters' are workflow-level and 'nodes' are per-node
        input_parameters = workflow.full_parameters_class(
            **passed_input_parameters
        )

        # Execute the workflow DAG
        # Nodes are executed in dependency order determined by the DAG
        workflow.run(
            nodes=input_parameters.nodes.model_dump(),
            **input_parameters.parameters.model_dump(),
        )
    except Exception as ex:
        # Capture error details for state tracking
        run_status = RunStatusEnum.ERROR
        run_error = RunError(
            error_class=ex.__class__.__name__,
            message=str(ex),
            traceback=traceback.format_tb(ex.__traceback__),
        )
        # Re-raise to allow caller to handle the error
        raise
    else:
        # If successful, capture the snapshot index for data storage
        # The snapshot_idx links results to stored data files
        idx = workflow.snapshot_idx if hasattr(workflow, "snapshot_idx") else -1
        idx = idx if idx is not None else -1
        run_status = RunStatusEnum.FINISHED
    finally:
        # ALWAYS update state with final results, even if an error occurred
        # This ensures the UI and monitoring systems have current information
        state.last_run = LastRun(
            name=state.last_run.name,
            status=run_status,
            idx=idx,
            run_result=cast(GraphRunSummary | None, workflow.run_summary),
            started_at=state.last_run.started_at,
            completed_at=datetime.now().astimezone(),
            runnable_type=state.last_run.runnable_type,
            passed_parameters=passed_input_parameters,
            error=run_error,
        )
