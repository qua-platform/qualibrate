import { useEffect } from "react";
import { useRootDispatch } from "..";
import { fetchGitgraphSnapshots, fetchSnapshotTags } from "./actions";
import { useSelector } from "react-redux";
import { getSnapshotsSearchQuery } from "./selectors";
import { getIsSnapshotUpdateRequired } from "../WebSocketStore";

export const useInitSnapshots = () => {
  const dispatch = useRootDispatch();
  const isUpdateRequired = useSelector(getIsSnapshotUpdateRequired);
  const snapshotsSearchQuery = useSelector(getSnapshotsSearchQuery);

  useEffect(() => {
    dispatch(fetchGitgraphSnapshots(true));
    dispatch(fetchSnapshotTags());
  }, []);

  useEffect(() => {
    if (isUpdateRequired) {
      dispatch(fetchGitgraphSnapshots(false));
    }
  }, [isUpdateRequired]);

  useEffect(() => {
    dispatch(fetchGitgraphSnapshots(false));
  }, [snapshotsSearchQuery]);
};
