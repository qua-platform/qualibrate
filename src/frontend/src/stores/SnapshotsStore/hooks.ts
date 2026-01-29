import { useEffect } from "react";
import { useRootDispatch } from "..";
import { fetchGitgraphSnapshots, fetchSnapshotTags, intervalFetch, setAllSnapshots } from "./actions";
import { useSelector } from "react-redux";
import { getAllSnapshots, getPageNumber, getReset } from "./selectors";

export const useInitSnapshots = () => {
  const dispatch = useRootDispatch();
  const pageNumber = useSelector(getPageNumber);
  const allSnapshots = useSelector(getAllSnapshots);
  const reset = useSelector(getReset);

  useEffect(() => {
    dispatch(setAllSnapshots([]));
    dispatch(fetchGitgraphSnapshots(true, pageNumber));
    dispatch(fetchSnapshotTags());
  }, [pageNumber]);
  // -----------------------------------------------------------
  // -----------------------------------------------------------

  // TODO Add lastSelectedId! in state

  useEffect(() => {
    const checkInterval = setInterval(() => dispatch(intervalFetch(pageNumber)), 1000);
    return () => clearInterval(checkInterval);
  }, [allSnapshots, pageNumber]);
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // PERIODICAL FETCH ALL SNAPSHOTS
  useEffect(() => {
    if (reset) {
      // setAllSnapshots([]);
      const updateFn = setTimeout(() => dispatch(fetchGitgraphSnapshots(false, pageNumber)), 2);
      return () => clearTimeout(updateFn);
    }
  }, [reset, pageNumber]);
  // -----------------------------------------------------------
};
