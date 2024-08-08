import React, { useContext, useEffect, useState } from "react";
import { NodeDTO, NodeMap } from "../components/NodeElement/NodeElement";
import noop from "../../../common/helpers";
import { NodesApi } from "../api/NodesAPI";
import { SnapshotsApi } from "../../Snapshots/api/SnapshotsApi";

export interface StateUpdateObject {
  key?: string | number;
  attr?: string;
  old?: string | number;
  val?: string | number;
  new?: string | number;
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
  error?: NodeStatusError;
  idx?: string;
}

interface INodesContext {
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
}

const NodesContext = React.createContext<INodesContext>({
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
});

export const useNodesContext = (): INodesContext => useContext<INodesContext>(NodesContext);

interface NodesContextProviderProps {
  children: React.JSX.Element;
}

interface NodeStatusError {
  error_class: string;
  message: string;
  traceback: string[];
}

interface NodeStatusResponseType {
  idx: number;
  status: string;
  error?: NodeStatusError;
  name: string;
  state_updates?: StateUpdate;
}

export function NodesContextProvider(props: NodesContextProviderProps): React.ReactElement {
  const [allNodes, setAllNodes] = useState<NodeMap | undefined>(undefined);
  const [runningNode, setRunningNode] = useState<NodeDTO | undefined>(undefined);
  const [runningNodeInfo, setRunningNodeInfo] = useState<RunningNodeInfo | undefined>(undefined);
  const [isNodeRunning, setIsNodeRunning] = useState<boolean>(false);
  const [results, setResults] = useState<unknown | object | undefined>(undefined);

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

  const fetchNodeResults = async () => {
    const lastRunResponse = await NodesApi.fetchLastRunInfo();
    if (lastRunResponse && lastRunResponse.isOk) {
      const lastRunResponseResult = lastRunResponse.result as NodeStatusResponseType;
      if (lastRunResponseResult && lastRunResponseResult.status !== "error") {
        const idx = lastRunResponseResult.idx.toString();
        if (lastRunResponseResult.idx) {
          const snapshotResponse = await SnapshotsApi.fetchSnapshotResult(idx);
          if (snapshotResponse.isOk) {
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
                state_updates: lastRunResponseResult.state_updates,
              });
            } else if (!runningNodeInfo?.timestampOfRun) {
              setRunningNodeInfo({
                ...runningNodeInfo,
                lastRunNodeName: lastRunResponseResult.name,
                status: lastRunResponseResult.status,
                idx: lastRunResponseResult.idx.toString(),
                state_updates: lastRunResponseResult.state_updates,
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
        setRunningNodeInfo({ ...runningNodeInfo, status: "error", error: lastRunResponseResult.error });
        console.log("last run status was error");
      }
    } else {
      console.log(lastRunResponse);
    }
  };

  useEffect(() => {
    if (!isNodeRunning) {
      fetchNodeResults();
    }
  }, [isNodeRunning]);

  const checkIfNodeIsStillRunning = async () => {
    const response = await NodesApi.checkIsNodeRunning();
    if (response.isOk) {
      console.log("checkIfNodeIsStillRunning", response.result);
      setIsNodeRunning(response.result as boolean);
    }
  };
  useEffect(() => {
    const checkInterval = setInterval(async () => checkIfNodeIsStillRunning(), 500);
    return () => clearInterval(checkInterval);
  }, []);

  return (
    <NodesContext.Provider
      value={{
        runningNode,
        setRunningNode,
        runningNodeInfo,
        setRunningNodeInfo,
        allNodes,
        setAllNodes,
        isNodeRunning,
        setIsNodeRunning,
        results,
        setResults,
        fetchAllNodes,
      }}
    >
      {props.children}
    </NodesContext.Provider>
  );
}
