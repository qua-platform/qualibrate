import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getIsNodeRunning, getRunningNodeInfo } from "./selectors";
import { useRootDispatch } from "..";
import { fetchNodeResults, setIsNodeRunning, setRunningNodeInfo } from "./actions";
import { getRunStatusIsRunning, getRunStatusType } from "../WebSocketStore";

export const useInitNodes = () => {
  const dispatch = useRootDispatch();
  const isNodeRunning = useSelector(getIsNodeRunning);
  const runningNodeInfo = useSelector(getRunningNodeInfo);
  const runStatusType = useSelector(getRunStatusType);
  const isRunStatusRunning = useSelector(getRunStatusIsRunning);

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
    if (runStatusType === "node" && isNodeRunning !== isRunStatusRunning) {
      dispatch(setIsNodeRunning(isRunStatusRunning));
    }
  }, [runStatusType, isRunStatusRunning]);
};