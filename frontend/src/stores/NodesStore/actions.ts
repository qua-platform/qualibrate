import { NodesApi } from "../../modules/Nodes/api/NodesAPI";
import { RootDispatch, RootState } from "..";
import { nodesSlice, StateUpdate, StatusResponseType } from "./NodesStore";
import { NodeMap } from "../../modules/Nodes/components/NodeElement/NodeElement";
import { SnapshotsApi } from "../../modules/Snapshots/api/SnapshotsApi";
import { getRunningNode, getRunningNodeInfo } from "./selectors";
import { formatDateTime } from "../../modules/GraphLibrary/components/GraphStatus/components/MeasurementElement/MeasurementElement";

export const {
  setSelectedNode,
  setSubmitNodeResponseError,
  setRunningNode,
  setRunningNodeInfo,
  setAllNodes,
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