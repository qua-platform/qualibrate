import { NodesApi } from "./api/NodesAPI";
import { RootDispatch, RootState } from "..";
import { ErrorWithDetails, nodesSlice, StateUpdate, StatusResponseType } from "./NodesStore";
import { NodeDTO, NodeMap } from "../../modules/Nodes";
import { fetchOneSnapshot, getFirstId, getSecondId, getTrackLatestSidePanel, SnapshotsApi } from "../SnapshotsStore";
import { getRunningNode, getRunningNodeInfo } from "./selectors";
import { formatDateTime } from "../../utils/formatDateTime";
import { InputParameter } from "../../components";

export const {
  setSelectedNode,
  setSubmitNodeResponseError,
  runNode,
  setRunningNode,
  setRunningNodeInfo,
  setAllNodes,
  setNodeParameter,
  setIsNodeRunning,
  setResults,
  setIsAllStatusesUpdated,
  setUpdateAllButtonPressed,
  setIsRescanningNodes,
} = nodesSlice.actions;

export const fetchAllNodes = (rescan?: boolean) => async (dispatch: RootDispatch) => {
  dispatch(setAllNodes(undefined));
  dispatch(setIsRescanningNodes(true));
  const response = await NodesApi.fetchAllNodes(rescan);
  if (response.isOk) {
    dispatch(setAllNodes(response.result! as NodeMap));
  } else if (response.error) {
    console.error("Failed to fetch all nodes:", response.error);
  }
  dispatch(setIsRescanningNodes(false));
};

function parseDateString(dateString: string): Date {
  const [datePart, timePart] = dateString.split(" ");
  const [year, month, day] = datePart.split("/").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

const formatString = (str: string) => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const fetchNodeResults = () => async (dispatch: RootDispatch, getState: () => RootState) => {
  const lastRunResponse = await NodesApi.fetchLastRunInfo();
  if (lastRunResponse && lastRunResponse.isOk) {
    const lastRunResponseResult = lastRunResponse.result as StatusResponseType;
    if (lastRunResponseResult && lastRunResponseResult.status !== "error") {
      const idx = lastRunResponseResult.idx.toString();
      if (lastRunResponseResult.idx) {
        const snapshotResponse = await SnapshotsApi.fetchSnapshotResult(idx);
        if (snapshotResponse && snapshotResponse.isOk) {
          const state = getState();
          const runningNodeInfo = getRunningNodeInfo(state);
          const runningNode = getRunningNode(state);

          const state_updates: StateUpdate = {};
          if (lastRunResponseResult.state_updates) {
            Object.entries(lastRunResponseResult.state_updates).forEach(([key, graph]) => {
              state_updates[key] = { ...graph, stateUpdated: false };
            });
          }
          if (runningNodeInfo && runningNodeInfo.timestampOfRun) {
            const startDateAndTime: Date = parseDateString(runningNodeInfo?.timestampOfRun);
            const now: Date = new Date();
            const diffInMs = now.getTime() - startDateAndTime.getTime();

            const diffInSeconds = Math.floor(diffInMs / 1000);
            dispatch(setRunningNodeInfo({
              ...runningNodeInfo,
              runDuration: diffInSeconds.toFixed(2),
              status: lastRunResponseResult.status,
              idx: lastRunResponseResult.idx.toString(),
              state_updates,
            }));
          } else if (!runningNodeInfo?.timestampOfRun) {
            dispatch(setRunningNodeInfo({
              ...runningNodeInfo,
              lastRunNodeName: lastRunResponseResult.name,
              status: lastRunResponseResult.status,
              idx: lastRunResponseResult.idx.toString(),
              state_updates,
            }));
            let parameters = {};
            Object.entries(lastRunResponseResult.passed_parameters ?? {}).forEach(([key, value]) => {
              parameters = {
                ...parameters,
                [key]: {
                  default: value,
                  title: formatString(key),
                  type: "string",
                },
              };
            });
            dispatch(setRunningNode({
              ...runningNode!,
              parameters,
              // parameters: { sadada: { dadasda: "dadasda" } },
            }));
          }
          dispatch(setResults(snapshotResponse.result));
        } else {
          console.error("Failed to fetch snapshot result:", snapshotResponse.error);
        }
      } else {
        console.warn("Last run idx is falsy:", lastRunResponseResult.idx);
      }
    } else {
      const state = getState();
      const runningNodeInfo = getRunningNodeInfo(state);
      const runningNode = getRunningNode(state);

      const error = lastRunResponseResult && lastRunResponseResult.error ? lastRunResponseResult.error : undefined;
      if (!lastRunResponseResult) {
        dispatch(setRunningNodeInfo({
          ...runningNodeInfo,
          status: "pending",
          error,
        }));
      } else if (lastRunResponseResult && lastRunResponseResult.status === "error") {
        let parameters = {};
        Object.entries(lastRunResponseResult.run_result?.parameters ?? {}).forEach(([key, value]) => {
          parameters = {
            ...parameters,
            [key]: {
              default: value,
              title: formatString(key),
              type: "string",
            },
          };
        });
        dispatch(setRunningNode({
          ...runningNode!,
          parameters,
          // parameters: { sadada: { dadasda: "dadasda" } },
        }));
        dispatch(setRunningNodeInfo({
          ...runningNodeInfo,
          status: "error",
          timestampOfRun: formatDateTime(lastRunResponseResult.run_result?.created_at ?? ""),
          runDuration: lastRunResponseResult.run_result?.run_duration?.toString(),
          state_updates: lastRunResponseResult.state_updates,
          idx: lastRunResponseResult.idx.toString(),
          // parameters: lastRunResponseResult.run_result?.parameters,
          error,
        }));
        console.error("Last run status was error", lastRunResponse);
      }
    }
  } else {
      if (!lastRunResponse.isOk) {  // Do nothing if isOK, since this means that there was no last run
        console.log("Failed to fetch last run info:", lastRunResponse);
      }
  }
};

/**
 * Format Date object to "YYYY/MM/DD HH:mm:ss" string for display.
 *
 * Used to display execution timestamps in the UI. This format matches
 * the NodesContext.parseDateString() format for bidirectional conversion.
 */
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
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
    {} as { [key: string]: boolean | number | string | null | string[] }
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
export const handleRunNode = (node: NodeDTO) => async (dispatch: RootDispatch, getState: () => RootState) => {
    dispatch(runNode(node));

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
    if (getTrackLatestSidePanel(getState())) {
      dispatch(fetchOneSnapshot(Number(getFirstId(getState())), Number(getSecondId(getState())), false, true));
    }
  };
