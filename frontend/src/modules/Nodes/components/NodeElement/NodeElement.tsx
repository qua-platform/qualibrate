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
 * - Direct mutation of allNodes map in NodesContext via setAllNodes
 * - Parameter updates trigger re-render of entire NodesContext consumer tree
 * - No debouncing on parameter input changes
 *
 * @see NodesContext for execution state management
 * @see WebSocketContext for real-time status updates (WebSocketContext.tsx:265-269)
 * @see Parameters for the collapsible parameter editing UI
 */
import React, { useMemo } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodeElement.module.scss";
import { Checkbox, CircularProgress } from "@mui/material";
import { InputParameter, Parameters, SingleParameter } from "../../../common/Parameters/Parameters";
import { ErrorResponseWrapper } from "../../../common/Error/ErrorResponseWrapper";
import InputField from "../../../../common/ui-components/common/Input/InputField";
import BlueButton from "../../../../ui-lib/components/Button/BlueButton";
import { NodesApi } from "../../api/NodesAPI";
import { RunIcon } from "../../../../ui-lib/Icons/RunIcon";
import Tooltip from "@mui/material/Tooltip";
import { InfoIcon } from "../../../../ui-lib/Icons/InfoIcon";
import { StatusVisuals } from "./NodeElementStatusVisuals";
import { getNodeRowClass } from "./helpers";
import { useSnapshotsContext } from "../../../Snapshots/context/SnapshotsContext";
import { useRootDispatch } from "../../../../stores";
import { useSelector } from "react-redux";
import { getAllNodes, getSelectedNode, getSubmitNodeResponseError } from "../../../../stores/NodesStore/selectors";
import { setAllNodes,
  setIsAllStatusesUpdated,
  setIsNodeRunning,
  setResults,
  setRunningNode,
  setRunningNodeInfo,
  setSelectedNode,
  setSubmitNodeResponseError,
  setUpdateAllButtonPressed,
} from "../../../../stores/NodesStore/actions";
import { ErrorWithDetails } from "../../../../stores/NodesStore/NodesStore";
import { getRunStatusIsRunning, getRunStatusNodeName, getRunStatusNodePercentage, getRunStatusNodeStatus } from "../../../../stores/WebSocketStore/selectors";

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
  [key: string]: NodeDTO;
}

/**
 * Format Date object to "YYYY/MM/DD HH:mm:ss" string for display.
 *
 * Used to display execution timestamps in the UI. This format matches
 * the NodesContext.parseDateString() format for bidirectional conversion.
 */
export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

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
export const NodeElement: React.FC<{ nodeKey: string; node: NodeDTO }> = ({ nodeKey, node }) => {
  const { firstId, secondId, fetchOneSnapshot, trackLatestSidePanel } = useSnapshotsContext();
  const dispatch = useRootDispatch();
  const allNodes = useSelector(getAllNodes);
  const selectedNode = useSelector(getSelectedNode);
  const submitNodeResponseError = useSelector(getSubmitNodeResponseError);
  const runStatusIsRunning = useSelector(getRunStatusIsRunning);
  const runStatusNodeName = useSelector(getRunStatusNodeName);
  const runStatusNodeStatus = useSelector(getRunStatusNodeStatus);
  const runStatusNodePercentage = useSelector(getRunStatusNodePercentage);

  /**
   * Update a single parameter value in the node's parameter map.
   *
   * Modifies the parameter's default value while preserving other metadata
   * (title, type, description). Triggers a full NodesContext state update,
   * causing re-render of all consumers.
   *
   * @remarks
   * **FRAGILE: No Debouncing**:
   * Every keystroke triggers full allNodes map update and context re-render.
   * Consider adding debouncing for text inputs to reduce re-render frequency.
   *
   * **FRAGILE: Direct State Mutation Pattern**:
   * Spreads entire allNodes map on every update. For large node libraries,
   * this could cause performance issues. Consider using a reducer pattern
   * or immutable update helpers.
   */
  const updateParameter = (paramKey: string, newValue: boolean | number | string) => {
    const updatedParameters = {
      ...node.parameters,
      [paramKey]: {
        ...(node.parameters as InputParameter)[paramKey],
        default: newValue,
      },
    };
    dispatch(setAllNodes({ ...allNodes, [nodeKey]: { ...node, parameters: updatedParameters } }));
  };

  /**
   * Render appropriate input component based on parameter type.
   *
   * Creates type-specific input elements for parameter editing. Currently
   * supports boolean (Checkbox) and all other types (InputField with string coercion).
   *
   * @remarks
   * **FRAGILE: Limited Type Support**:
   * Only boolean has dedicated UI - all other types (number, string, etc.) use
   * generic InputField with string coercion. Number validation happens at submission
   * time on backend, not during input. Consider adding number input with validation.
   *
   * **IMPROVEMENT NEEDED: Type Validation**:
   * No client-side validation for parameter types. Users can enter invalid values
   * (e.g., text in number field) and only discover errors after submission.
   */
  const getInputElement = (key: string, parameter: SingleParameter) => {
    switch (parameter.type) {
      case "boolean":
        return (
          <Checkbox
            checked={parameter.default as boolean}
            onClick={() => updateParameter(key, !parameter.default)}
            inputProps={{ "aria-label": "controlled" }}
            data-testid={`checkbox-${key}`}
          />
        );
      default:
        return (
          <InputField
            placeholder={key}
            data-testid={`input-field-${key}`}
            value={parameter.default ? parameter.default.toString() : ""}
            onChange={(val: boolean | number | string) => {
              updateParameter(key, val);
            }}
          />
        );
    }
  };

  /**
   * Extract parameter values from parameter definitions for API submission.
   *
   * Transforms parameter metadata objects into a simple key-value map containing
   * only the default values needed for backend execution.
   *
   * @param parameters - Full parameter definitions with type, title, description
   * @returns Simplified map of parameter names to values for API payload
   */
  const transformInputParameters = (parameters: InputParameter) => {
    return Object.entries(parameters).reduce(
      (acc, [key, parameter]) => {
        acc[key] = parameter.default ?? null;
        return acc;
      },
      {} as { [key: string]: boolean | number | string | null }
    );
  };

  /**
   * Submit node execution request to backend and update execution state.
   *
   * Handles the complete flow of starting a calibration run:
   * 1. Reset execution state and clear previous results
   * 2. Submit parameters to backend API
   * 3. Update UI state based on success/failure
   * 4. Trigger snapshot refresh if tracking latest results
   *
   * After successful submission, WebSocket updates will drive further state changes
   * (progress updates, completion status, etc.) via NodesContext.
   *
   * @remarks
   * **FRAGILE: Error Handling**:
   * Assumes error format matches ErrorWithDetails structure with detail[0].
   * If backend returns different error format, will throw accessing undefined properties.
   * No try-catch wrapping the API call - network errors will crash the component.
   *
   * **State Synchronization**:
   * Sets initial status to "running" optimistically before WebSocket confirms.
   * WebSocket updates (via NodesContext useEffect) will override this with actual status.
   *
   * **Side Effect: Snapshot Fetching**:
   * Conditionally fetches snapshot if trackLatestSidePanel is enabled. This coupling
   * between node execution and snapshot state makes the flow harder to follow.
   */
  const handleClick = async () => {
    dispatch(setIsNodeRunning(true));
    dispatch(setResults({}));
    dispatch(setUpdateAllButtonPressed(false));
    dispatch(setIsAllStatusesUpdated(false));
    dispatch(setRunningNode(node));
    dispatch(setSubmitNodeResponseError(undefined));
    const result = await NodesApi.submitNodeParameters(node.name, transformInputParameters(node.parameters as InputParameter));
    if (result.isOk) {
      dispatch(setRunningNodeInfo({ timestampOfRun: formatDate(new Date()), status: "running" }));
    } else {
      const errorWithDetails = result.error as ErrorWithDetails;
      dispatch(setSubmitNodeResponseError({
        nodeName: node.name,
        name: `${errorWithDetails.detail[0].type ?? "Error msg"}: `,
        msg: errorWithDetails.detail[0].msg,
      }));
      dispatch(setRunningNodeInfo({
        timestampOfRun: formatDate(new Date()),
        status: "error",
      }));
    }
    if (trackLatestSidePanel) {
      fetchOneSnapshot(Number(firstId), Number(secondId), false, true);
    }
  };

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
        nodeName: node.name,
        selectedItemName: selectedNode ?? "",
        runStatus:
          runStatusNodeName && runStatusNodeStatus
            ? {
                name: runStatusNodeName,
                status: runStatusNodeStatus,
              }
            : null,
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
            1. This node is currently running (runStatus.node.name === node.name), OR
            2. This node is NOT selected AND there's a non-pending status to show

            FRAGILE: Complex conditional logic - difficult to reason about all cases.
            Consider extracting to shouldShowStatus() helper function.
          */}
          {(runStatusNodeName === node.name || (selectedNode !== node.name && runStatusNodeStatus !== "pending")) && (
            <StatusVisuals
              status={runStatusNodeName === node.name ? runStatusNodeStatus : "pending"}
              percentage={Math.round(runStatusNodePercentage ?? 0)}
            />
          )}
        </div>
        {/* Show Run button only when: node is selected AND nothing is currently running */}
        {!runStatusIsRunning && node.name === selectedNode && (
          <BlueButton className={styles.runButton} data-testid="run-button" onClick={handleClick}>
            <RunIcon className={styles.runButtonIcon} />
            <span className={styles.runButtonText}>Run</span>
          </BlueButton>
        )}
        {/* Show spinner when: node is selected AND something is running */}
        {runStatusIsRunning && node.name === selectedNode && <CircularProgress size={32} />}
      </div>
      {/* Show validation errors only for the selected node that failed submission */}
      {node.name === selectedNode && node.name === submitNodeResponseError?.nodeName && (
        <ErrorResponseWrapper error={submitNodeResponseError} />
      )}
      {/* Show parameters section if node has any parameters defined */}
      {Object.keys(node?.parameters ?? {}).length > 0 && (
        <Parameters
          parametersExpanded={true}
          showTitle={true}
          key={node.name}
          show={selectedNode === node.name}
          currentItem={node}
          getInputElement={getInputElement}
          data-testid={`parameters-${nodeKey}`}
        />
      )}
    </div>
  );
};
