/**
 * @fileoverview Interactive quantum calibration node component with real-time execution status.
 *
 * Displays a single calibration node with parameter editing, execution controls, and
 * live status updates via WebSocket. Each node represents a quantum calibration procedure
 * (e.g., resonator_spectroscopy, qubit_spectroscopy) that can be executed with custom parameters.
 *
 * **Key Responsibilities**:
 * - Render node title, description, and status indicator
 * - Provide inline parameter editing for calibration inputs
 * - Handle node execution submission via API
 * - Display real-time progress updates from WebSocket
 * - Show validation errors from backend parameter validation
 *
 * **State Synchronization Flow**:
 * 1. User clicks Run button → handleClick() calls NodesApi.submitNodeParameters()
 * 2. Backend validates parameters and starts execution
 * 3. WebSocket pushes status updates every ~500ms to WebSocketContext
 * 4. NodesContext consumes runStatus and updates isNodeRunning
 * 5. Component reflects current status via StatusVisuals (green dot, red dot, progress spinner)
 *
 * **Integration Points**:
 * - NodesContext: Execution state, parameter updates, error handling
 * - SelectionContext: Tracks which node is currently selected in UI
 * - SnapshotsContext: Fetches calibration results after execution completes
 * - WebSocketContext: Real-time status updates (runStatus.node.status/percentage_complete)
 *
 * **FRAGILE: Error Handling**:
 * - No validation before submission - relies entirely on backend validation
 * - Parameter type coercion happens at submission time without user feedback
 * - API errors only shown after submission completes (no loading state error recovery)
 *
 * **FRAGILE: State Management**:
 * - No debouncing on parameter input changes
 *
 * @see NodesContext for execution state management
 * @see WebSocketContext for real-time status updates (WebSocketContext.tsx:265-269)
 * @see Parameters for the collapsible parameter editing UI
 */
import React, { useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodeElement.module.scss";
import {CircularProgress} from "@mui/material";

import {InputParameter, Parameters, SingleParameter, ErrorResponseWrapper, BlueButton, RunIcon, InfoIcon, ParameterSelector} from "../../../../components";
import Tooltip from "@mui/material/Tooltip";
import { useRootDispatch } from "../../../../stores";
import { useSelector } from "react-redux";
import {
  getSubmitNodeResponseError,
  setSelectedNode,
  handleRunNode,
  setNodeParameter,
  getIsNodeSelected,
  getNode,
} from "../../../../stores/NodesStore";
import { getRunStatusIsRunning, getRunStatusNodeStatus } from "../../../../stores/WebSocketStore";
import {StatusVisuals} from "./NodeElementStatusVisuals";
import {getNodeRowClass} from "./helpers";
import {GraphWorkflow} from "../../../../modules/GraphLibrary";
import { getIsLastRunNode } from "../../../../stores/WebSocketStore/selectors";

/**
 * Calibration node definition from backend node library scan.
 *
 * Represents a single quantum calibration procedure with its metadata and
 * configurable parameters. Nodes are discovered by scanning Python classes
 * that inherit from QualibrationNode.
 *
 * @property name - Node class name (e.g., "resonator_spectroscopy")
 * @property title - Display name for UI (defaults to name if not provided)
 * @property description - Human-readable explanation of calibration purpose
 * @property parameters - User-configurable inputs for this calibration
 * @property nodes - Child nodes for graph workflows (currently unused in NodeElement)
 */
export interface NodeDTO {
  id?: string;
  name: string;
  title?: string;
  description: string;
  parameters?: InputParameter;
  nodes?: InputParameter;
}

/**
 * Dictionary of all available calibration nodes, keyed by node name.
 *
 * Populated by NodesApi.fetchAllNodes() which triggers a backend rescan
 * of the node library. Used to render the complete list of available calibrations.
 */
export interface NodeMap {
  [key: string]: NodeDTO | GraphWorkflow;
}

/**
 * Interactive calibration node component with real-time execution tracking.
 *
 * Renders a single quantum calibration node with parameter inputs, execution controls,
 * and live status visualization. Supports inline parameter editing and displays
 * real-time progress updates via WebSocket during calibration execution.
 *
 * @param nodeKey - Unique key for this node instance (used for React list rendering)
 * @param node - Node definition containing name, parameters, and metadata
 *
 * @remarks
 * **Rendering Behavior**:
 * - Selected node expands to show parameters and Run button
 * - Non-selected nodes show only title and status indicator
 * - Status indicators: grey dot (pending), green dot (finished), red dot (error), progress spinner (running)
 *
 * **WebSocket Status Updates**:
 * Real-time status updates flow from WebSocket → NodesContext → this component:
 * - runStatus.node.name matches this node → show current execution status
 * - runStatus.node.percentage_complete → drives progress spinner
 * - runStatus.is_running → show Run button or CircularProgress
 *
 * **FRAGILE: Multiple Context Dependencies**:
 * This component depends on 4 different contexts (NodesContext, SelectionContext,
 * SnapshotsContext, WebSocketContext), creating tight coupling and making testing difficult.
 *
 * @see NodesContext for execution state and parameter management
 * @see getNodeRowClass for dynamic styling based on execution status (helpers.ts)
 * @see StatusVisuals for status indicator rendering (NodeElementStatusVisuals.tsx)
 */
export const NodeElement: React.FC<{ nodeKey: string }> = ({ nodeKey }) => {
  const dispatch = useRootDispatch();
  const node = useSelector(state => getNode(state, nodeKey));
  const isNodeSelected = useSelector(state => getIsNodeSelected(state, nodeKey));
  const submitNodeResponseError = useSelector(getSubmitNodeResponseError);
  const runStatusIsRunning = useSelector(getRunStatusIsRunning);
  const isLastRunNode = useSelector(state => getIsLastRunNode(state, nodeKey));
  const runStatusNodeStatus = useSelector(getRunStatusNodeStatus);
  const [errors, setErrors] = useState(new Set());

  const handleSetError = (key: string, isValid: boolean) => {
    const newSet = new Set(errors);

    if (isValid)
      newSet.delete(key);
    else
      newSet.add(key);

    setErrors(newSet);
  };
  /**
   * Update a single parameter value in the node's parameter map.
   *
   * Modifies the parameter's default value while preserving other metadata
   * (title, type, description). Triggers a full NodesContext state update,
   * causing re-render of all consumers.
   */
  const updateParameter = (paramKey: string, newValue: boolean | number | string | string[], isValid: boolean) => {
    handleSetError(paramKey, isValid);
    dispatch(setNodeParameter({ nodeKey, paramKey, newValue }));
  };

  const renderInputElement = (key: string, parameter: SingleParameter, node?: NodeDTO | GraphWorkflow) =>
    <ParameterSelector parameterKey={key} parameter={parameter} node={node} onChange={updateParameter} />;

  const handleClick = async () => dispatch(handleRunNode(node));

  /**
   * Insert spaces into long strings to enable line wrapping at fixed intervals.
   *
   * Prevents UI overflow when displaying long node names like "resonator_spectroscopy_with_flux_sweep"
   * without natural word breaks. Inserts a space every N characters to allow CSS word-wrap to break the line.
   */
  const insertSpaces = (str: string, interval = 40) => str.replace(new RegExp(`(.{${interval}})`, "g"), "$1 ").trim();

  return (
    <div
      // Dynamic styling based on selection state and execution status
      // See helpers.ts:getNodeRowClass for styling logic
      className={getNodeRowClass({
        isSelected: isNodeSelected,
        isLastRun: isLastRunNode,
        runStatus: runStatusNodeStatus,
      })}
      data-testid={`node-element-${nodeKey}`}
      onClick={() => {
        dispatch(setSelectedNode(node.name));
      }}
    >
      <div className={styles.row}>
        <div className={styles.titleOrNameWrapper}>
          <div className={styles.titleOrName} data-testid={`title-or-name-${nodeKey}`}>
            {/* Use title if available, fallback to name. insertSpaces prevents overflow */}
            {insertSpaces(node.title ?? node.name)}
          </div>
        </div>
        <div className={styles.descriptionWrapper}>
          {node.description && (
            <Tooltip title={<div className={styles.descriptionTooltip}>{node.description} </div>} placement="left-start" arrow>
              <span>
                <InfoIcon />
              </span>
            </Tooltip>
          )}
        </div>
        <div className={styles.dotWrapper} data-testid={`dot-wrapper-${nodeKey}`}>
          {/*
            Show status indicator if:
            1. This node is currently running (isLastRunNode), OR
            2. This node is NOT selected AND there's a non-pending status to show

            FRAGILE: Complex conditional logic - difficult to reason about all cases.
            Consider extracting to shouldShowStatus() helper function.
          */}
          {(isLastRunNode || (isNodeSelected && runStatusNodeStatus !== "pending")) && (
            <StatusVisuals status={isLastRunNode ? runStatusNodeStatus : "pending"} />
          )}
        </div>
        {/* Show Run button only when: node is selected AND nothing is currently running AND parameter inputs have no errors */}
        {!runStatusIsRunning && isNodeSelected && errors.size === 0 && (
          <BlueButton className={styles.runButton} data-testid="run-button" onClick={handleClick}>
            <RunIcon className={styles.runButtonIcon} />
            <span className={styles.runButtonText}>Run</span>
          </BlueButton>
        )}
        {/* Show spinner when: node is selected AND something is running */}
        {runStatusIsRunning && isNodeSelected && <CircularProgress size={32} />}
      </div>
      {/* Show validation errors only for the selected node that failed submission */}
      {isNodeSelected && node.name === submitNodeResponseError?.nodeName && (
        <ErrorResponseWrapper error={submitNodeResponseError} />
      )}
      {/* Show parameters section if node has any parameters defined */}
      {Object.keys(node?.parameters ?? {}).length > 0 && (
        <Parameters
          parametersExpanded={true}
          showTitle={true}
          key={node.name}
          show={isNodeSelected}
          currentItem={node}
          getInputElement={renderInputElement}
          data-testid={`parameters-${nodeKey}`}
        />
      )}
    </div>
  );
};
