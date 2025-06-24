import React, { useContext, useEffect, useState } from "react";
import { NodeDTO, NodeMap } from "../components/NodeElement/NodeElement";
import noop from "../../../common/helpers";
import { NodesApi } from "../api/NodesAPI";
import { SnapshotsApi } from "../../Snapshots/api/SnapshotsApi";
import { ErrorObject } from "../../common/Error/ErrorStatusWrapper";
import { formatDateTime } from "../../GraphLibrary/components/GraphStatus/components/MeasurementElement/MeasurementElement";
import { LastRunStatusNodeResponseDTO } from "../../TopbarMenu/TitleBarMenu";

export interface StateUpdateObject {
  key?: string | number;
  attr?: string;
  old?: string | number | object | number[];
  val?: string | number | object | number[];
  new?: string | number | object | number[];
  updated?: boolean;
  stateUpdated?: boolean;
}

export interface StateUpdate {
  [key: string]: StateUpdateObject;
}

export interface RunningNodeInfo {
  timestampOfRun?: string;
  runDuration?: string;
  status?: string;
  lastRunNodeName?: string;
  state_updates?: StateUpdate;
  error?: ErrorObject;
  idx?: string;
}

export interface ErrorWithDetails {
  detail: { input?: string; type?: string; loc?: string[]; msg: string }[];
}

export interface ResponseStatusError {
  nodeName: string;
  name: string;
  msg: string;
}

interface INodesContext {
  submitNodeResponseError?: ResponseStatusError;
  setSubmitNodeResponseError: (error?: ResponseStatusError) => void;
  runningNode?: NodeDTO;
  runningNodeInfo?: RunningNodeInfo;
  setRunningNode: (selectedNode: NodeDTO) => void;
  setRunningNodeInfo: (runningNodeInfo: RunningNodeInfo) => void;
  allNodes?: NodeMap;
  setAllNodes: (nodes: NodeMap) => void;
  isNodeRunning: boolean;
  setIsNodeRunning: (value: boolean) => void;
  results?: unknown | object;
  setResults: (value: unknown | object | undefined) => void;
  fetchAllNodes: () => void;
  isAllStatusesUpdated: boolean;
  setIsAllStatusesUpdated: (value: boolean) => void;
  updateAllButtonPressed: boolean;
  setUpdateAllButtonPressed: (a: boolean) => void;
  lastRunStatusNode: LastRunStatusNodeResponseDTO | null;
  setLastRunStatusNode: (node: LastRunStatusNodeResponseDTO | null) => void;
}

const NodesContext = React.createContext<INodesContext>({
  submitNodeResponseError: undefined,
  setSubmitNodeResponseError: noop,
  runningNode: undefined,
  runningNodeInfo: undefined,
  setRunningNode: noop,
  setRunningNodeInfo: noop,
  allNodes: undefined,
  setAllNodes: noop,
  isNodeRunning: false,
  setIsNodeRunning: noop,
  results: undefined,
  setResults: noop,
  fetchAllNodes: noop,
  isAllStatusesUpdated: false,
  setIsAllStatusesUpdated: noop,
  updateAllButtonPressed: false,
  setUpdateAllButtonPressed: noop,
  lastRunStatusNode: null,
  setLastRunStatusNode: noop,
});

export const useNodesContext = (): INodesContext => useContext<INodesContext>(NodesContext);

interface NodesContextProviderProps {
  children?: React.ReactNode;
}

export interface StatusResponseType {
  idx: number;
  completed_at?: string;
  status: string;
  error?: ErrorObject;
  name: string;
  state_updates?: StateUpdate;
  run_result?: {
    name?: string;
    created_at?: string;
    completed_at?: string;
    run_duration?: number;
    parameters?: {
      [key: string]: string;
    };
  };
  passed_parameters?: {
    [key: string]: string | number;
  };
}

export function NodesContextProvider(props: NodesContextProviderProps): React.ReactElement {
  const [allNodes, setAllNodes] = useState<NodeMap | undefined>(undefined);
  const [runningNode, setRunningNode] = useState<NodeDTO | undefined>(undefined);
  const [runningNodeInfo, setRunningNodeInfo] = useState<RunningNodeInfo | undefined>(undefined);
  const [isNodeRunning, setIsNodeRunning] = useState<boolean>(false);
  const [results, setResults] = useState<unknown | object | undefined>(undefined);
  const [submitNodeResponseError, setSubmitNodeResponseError] = useState<ResponseStatusError | undefined>(undefined);
  const [isAllStatusesUpdated, setIsAllStatusesUpdated] = useState<boolean>(false);
  const [updateAllButtonPressed, setUpdateAllButtonPressed] = useState<boolean>(false);
  const [lastRunStatusNode, setLastRunStatusNode] = useState<LastRunStatusNodeResponseDTO | null>(null);

  const fetchAllNodes = async () => {
    const response = await NodesApi.fetchAllNodes();
    if (response.isOk) {
      setAllNodes(response.result! as NodeMap);
    } else if (response.error) {
      console.log(response.error);
    }
  };
  useEffect(() => {
    fetchAllNodes();
  }, []);

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

  const fetchNodeResults = async () => {
    const lastRunResponse = await NodesApi.fetchLastRunInfo();
    if (lastRunResponse && lastRunResponse.isOk) {
      const lastRunResponseResult = lastRunResponse.result as StatusResponseType;
      if (lastRunResponseResult && lastRunResponseResult.status !== "error") {
        const idx = lastRunResponseResult.idx.toString();
        if (lastRunResponseResult.idx) {
          const snapshotResponse = await SnapshotsApi.fetchSnapshotResult(idx);
          if (snapshotResponse && snapshotResponse.isOk) {
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
              setRunningNodeInfo({
                ...runningNodeInfo,
                runDuration: diffInSeconds.toFixed(2),
                status: lastRunResponseResult.status,
                idx: lastRunResponseResult.idx.toString(),
                state_updates,
              });
            } else if (!runningNodeInfo?.timestampOfRun) {
              setRunningNodeInfo({
                ...runningNodeInfo,
                lastRunNodeName: lastRunResponseResult.name,
                status: lastRunResponseResult.status,
                idx: lastRunResponseResult.idx.toString(),
                state_updates,
              });
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
              setRunningNode({
                ...runningNode!,
                parameters,
                // parameters: { sadada: { dadasda: "dadasda" } },
              });
            }
            setResults(snapshotResponse.result);
          } else {
            console.log("snapshotResponse error", snapshotResponse.error);
          }
        } else {
          console.log("last run idx is falsy = ", lastRunResponseResult.idx);
        }
      } else {
        const error = lastRunResponseResult && lastRunResponseResult.error ? lastRunResponseResult.error : undefined;
        if (!lastRunResponseResult) {
          setRunningNodeInfo({
            ...runningNodeInfo,
            status: "pending",
            error,
          });
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
          setRunningNode({
            ...runningNode!,
            parameters,
            // parameters: { sadada: { dadasda: "dadasda" } },
          });
          setRunningNodeInfo({
            ...runningNodeInfo,
            status: "error",
            timestampOfRun: formatDateTime(lastRunResponseResult.run_result?.created_at ?? ""),
            runDuration: lastRunResponseResult.run_result?.run_duration?.toString(),
            state_updates: lastRunResponseResult.state_updates,
            idx: lastRunResponseResult.idx.toString(),
            // parameters: lastRunResponseResult.run_result?.parameters,
            error,
          });
        }

        console.log("last run status was error");
      }
    }
  };

  useEffect(() => {
    if (!isNodeRunning) {
      fetchNodeResults();
      if (runningNodeInfo?.status === "running") {
        setRunningNodeInfo({
          ...runningNodeInfo,
          status: "finished",
        });
      }
    }
  }, [isNodeRunning]);

  const checkIfNodeIsStillRunning = async () => {
    const response = await NodesApi.checkIsNodeRunning();
    if (response.isOk) {
      // console.log("checkIfNodeIsStillRunning", response.result);
      setIsNodeRunning(response.result as boolean);
    }
  };

  const fetchStatus = async () => {
    const res = await NodesApi.fetchLastRunStatusInfo();
    if (res.isOk && res.result?.node) {
      setLastRunStatusNode(res.result.node);
    }
  };

  useEffect(() => {
    const checkInterval = setInterval(() => { (async () => { await checkIfNodeIsStillRunning(); await fetchStatus(); })(); }, 500);
    return () => clearInterval(checkInterval);
  }, []);

  return (
    <NodesContext.Provider
      value={{
        runningNode,
        setRunningNode,
        runningNodeInfo,
        setRunningNodeInfo,
        submitNodeResponseError,
        setSubmitNodeResponseError,
        allNodes,
        setAllNodes,
        isNodeRunning,
        setIsNodeRunning,
        results,
        setResults,
        fetchAllNodes,
        isAllStatusesUpdated,
        setIsAllStatusesUpdated,
        updateAllButtonPressed,
        setUpdateAllButtonPressed,
        lastRunStatusNode,
        setLastRunStatusNode,
      }}
    >
      {props.children}
    </NodesContext.Provider>
  );
}
