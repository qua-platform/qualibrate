import { useEffect } from "react";
import { useRootDispatch } from "../index";
import { fetchGitgraphSnapshots } from "./actions";
import { useSelector } from "react-redux";
import { getPageNumber } from "./selectors";
import { getIsSnapshotUpdateRequired } from "../WebSocketStore";

export const useInitSnapshots = () => {
  const dispatch = useRootDispatch();
  const pageNumber = useSelector(getPageNumber);
  const isUpdateRequired = useSelector(getIsSnapshotUpdateRequired);

  useEffect(() => {
    dispatch(fetchGitgraphSnapshots(true));
  }, [pageNumber]);

  // TODO Add lastSelectedId! in state

  useEffect(() => {
    if (isUpdateRequired) {
      dispatch(fetchGitgraphSnapshots(false));
    }
  }, [isUpdateRequired, pageNumber]);
  // -----------------------------------------------------------
};
