import { useEffect } from "react";
import { useRootDispatch } from "..";
import { fetchGitgraphSnapshots, fetchSnapshotTags, intervalFetch, setAllSnapshots } from "./actions";
import { useSelector } from "react-redux";
import { getAllSnapshots, getReset, getSnapshotsSearchQuery } from "./selectors";

export const useInitSnapshots = () => {
  const dispatch = useRootDispatch();
  const allSnapshots = useSelector(getAllSnapshots);
  const reset = useSelector(getReset);
  const snapshotsSearchQuery = useSelector(getSnapshotsSearchQuery);

  useEffect(() => {
    dispatch(setAllSnapshots([]));
    dispatch(fetchGitgraphSnapshots(true, snapshotsSearchQuery));
    dispatch(fetchSnapshotTags());
  }, [snapshotsSearchQuery]);
  // -----------------------------------------------------------
  // -----------------------------------------------------------

  // TODO Add lastSelectedId! in state

  useEffect(() => {
    const checkInterval = setInterval(() => dispatch(intervalFetch(snapshotsSearchQuery)), 1000);
    return () => clearInterval(checkInterval);
  }, [allSnapshots, snapshotsSearchQuery]);
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // PERIODICAL FETCH ALL SNAPSHOTS
  useEffect(() => {
    if (reset) {
      // setAllSnapshots([]);
      const updateFn = setTimeout(() => dispatch(fetchGitgraphSnapshots(false, snapshotsSearchQuery)), 2);
      return () => clearTimeout(updateFn);
    }
  }, [reset, snapshotsSearchQuery]);
  // -----------------------------------------------------------
};
