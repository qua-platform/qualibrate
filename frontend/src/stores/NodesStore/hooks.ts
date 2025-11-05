import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getIsNodeRunning, getRunningNodeInfo } from "./selectors";
import { useRootDispatch } from "..";
import { fetchNodeResults, setIsNodeRunning, setRunningNodeInfo } from "./actions";
import { useWebSocketData } from "../../contexts/WebSocketContext";

export const useInitNodes = () => {
  const dispatch = useRootDispatch();
  const isNodeRunning = useSelector(getIsNodeRunning);
  const runningNodeInfo = useSelector(getRunningNodeInfo);
  const { runStatus } = useWebSocketData();

  useEffect(() => {
    if (!isNodeRunning) {
      dispatch(fetchNodeResults());
      if (runningNodeInfo?.status === "running") {
        dispatch(setRunningNodeInfo({
          ...runningNodeInfo,
          status: "finished",
        }));
      }
    }
  }, [isNodeRunning]);

  useEffect(() => {
    if (runStatus
      && runStatus.runnable_type === "node"
      && isNodeRunning !== runStatus.is_running
    ) {
      dispatch(setIsNodeRunning(runStatus.is_running));
    }
  }, [runStatus]);
}