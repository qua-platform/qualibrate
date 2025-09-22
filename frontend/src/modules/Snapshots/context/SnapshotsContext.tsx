import React, { Dispatch, PropsWithChildren, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { SnapshotDTO } from "../SnapshotDTO";
import { SnapshotsApi } from "../api/SnapshotsApi";

interface ISnapshotsContext {
  // trackLatestSidePanel: boolean;
  trackLatestSidePanel: boolean;
  setTrackLatestSidePanel: Dispatch<SetStateAction<boolean>>;
  trackPreviousSnapshot: boolean;
  setTrackPreviousSnapshot: Dispatch<SetStateAction<boolean>>;
  totalPages: number;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
  allSnapshots: SnapshotDTO[];
  setAllSnapshots: Dispatch<SetStateAction<SnapshotDTO[]>>;

  selectedSnapshotId: number | undefined;
  setSelectedSnapshotId: Dispatch<SetStateAction<number | undefined>>;

  latestSnapshotId: number | undefined;
  setLatestSnapshotId: Dispatch<SetStateAction<number | undefined>>;

  clickedForSnapshotSelection: boolean;
  setClickedForSnapshotSelection: Dispatch<SetStateAction<boolean>>;

  fetchOneSnapshot: (id: number, id2?: number, updateResult?: boolean, fetchUpdate?: boolean) => void;

  jsonData: object | undefined;
  setJsonData: Dispatch<SetStateAction<object | undefined>>;
  jsonDataSidePanel: object | undefined;
  setJsonDataSidePanel: Dispatch<SetStateAction<object | undefined>>;
  diffData: object | undefined;
  setDiffData: Dispatch<SetStateAction<object | undefined>>;
  result: object | undefined;
  setResult: Dispatch<SetStateAction<object | undefined>>;
  firstId: string;
  setFirstId: (id: string) => void;
  secondId: string;
  setSecondId: (id: string) => void;
  reset: boolean;
  setReset: (val: boolean) => void;
}

export const SnapshotsContext = React.createContext<ISnapshotsContext>({
  trackLatestSidePanel: true,
  setTrackLatestSidePanel: () => {},
  trackPreviousSnapshot: true,
  setTrackPreviousSnapshot: () => {},
  totalPages: 0,
  pageNumber: 0,
  setPageNumber: () => {},
  allSnapshots: [],
  setAllSnapshots: () => {},

  selectedSnapshotId: undefined,
  setSelectedSnapshotId: () => {},

  latestSnapshotId: undefined,
  setLatestSnapshotId: () => {},

  clickedForSnapshotSelection: false,
  setClickedForSnapshotSelection: () => {},

  fetchOneSnapshot: () => {},

  jsonData: {},
  setJsonData: () => {},
  jsonDataSidePanel: {},
  setJsonDataSidePanel: () => {},
  diffData: {},
  setDiffData: () => {},
  result: {},
  setResult: () => {},
  firstId: "0",
  setFirstId: () => {},
  secondId: "0",
  setSecondId: () => {},
  reset: false,
  setReset: () => {},
});

export const useSnapshotsContext = (): ISnapshotsContext => useContext<ISnapshotsContext>(SnapshotsContext);

export function SnapshotsContextProvider(props: PropsWithChildren<ReactNode>): React.ReactElement {
  const [trackLatestSidePanel, setTrackLatestSidePanel] = useState(true);
  const [trackPreviousSnapshot, setTrackPreviousSnapshot] = useState(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [allSnapshots, setAllSnapshots] = useState<SnapshotDTO[]>([]);

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | undefined>(undefined);
  const [clickedForSnapshotSelection, setClickedForSnapshotSelection] = useState<boolean>(false);
  const [latestSnapshotId, setLatestSnapshotId] = useState<number | undefined>(undefined);

  const [reset, setReset] = useState<boolean>(false);

  const [jsonDataSidePanel, setJsonDataSidePanel] = useState<object | undefined>(undefined);
  const [jsonData, setJsonData] = useState<object | undefined>(undefined);
  const [diffData, setDiffData] = useState<object | undefined>(undefined);
  const [result, setResult] = useState<object | undefined>(undefined);

  const [firstId, setFirstId] = useState<string>("0");
  const [secondId, setSecondId] = useState<string>("0");

  const fetchSnapshotJsonData = useCallback((id: string) => {
    try {
      return SnapshotsApi.fetchSnapshot(id);
    } catch (e) {
      console.error(`Failed to fetch a snapshot (id=${id}):`, e);
      return null;
    }
  }, []);
  const fetchSnapshotResults = useCallback((id: string) => {
    try {
      return SnapshotsApi.fetchSnapshotResult(id);
    } catch (e) {
      console.error(`Failed to fetch results for the snapshot (id=${id}):`, e);
      return undefined;
    }
  }, []);
  const fetchSnapshotDiff = useCallback((id2: string, id1: string) => {
    try {
      return SnapshotsApi.fetchSnapshotUpdate(id1, id2);
    } catch (e) {
      console.error(`Failed to fetch snapshot updates for the snapshots (id2=${id2}, id1=${id1}):`, e);
      return undefined;
    }
  }, []);

  const fetchOneSnapshot = async (snapshotId: number, snapshotId2?: number, updateResult = true, fetchUpdate = false) => {
    const id1 = (snapshotId ?? 0).toString();
    const id2 = snapshotId2 ? snapshotId2.toString() : snapshotId - 1 >= 0 ? (snapshotId - 1).toString() : "0";
    const resSnapshotJsonData = await fetchSnapshotJsonData(id1);
    if (resSnapshotJsonData?.isOk) {
      if (updateResult) {
        setJsonData(resSnapshotJsonData.result?.data);
        const resSnapshotResults = await fetchSnapshotResults(id1);
        if (resSnapshotResults?.isOk) {
          setResult(resSnapshotResults?.result);
        }
      }
      setJsonDataSidePanel(resSnapshotJsonData?.result?.data?.quam ?? {});
    }
    if (id1 !== id2 && fetchUpdate) {
      const resSnapshotDiff = await fetchSnapshotDiff(id2, id1);
      if (resSnapshotDiff?.isOk) {
        setDiffData(resSnapshotDiff?.result ?? {});
      }
    } else {
      setDiffData({});
    }
  };
  const fetchAllSnapshots = useCallback(async (page: number) => {
    try {
      return SnapshotsApi.fetchAllSnapshots(page);
    } catch (e) {
      console.error(`Failed to fetch all snapshots (page=${page}):`, e);
      return null;
    }
  }, []);

  const fetchGitgraphSnapshots = async (firstTime: boolean, page: number) => {
    const resAllSnapshots = await fetchAllSnapshots(page);
    setAllSnapshots([]);
    if (resAllSnapshots && resAllSnapshots?.isOk) {
      const items = resAllSnapshots.result?.items;
      setTotalPages(resAllSnapshots.result?.total_pages ?? 1);
      setPageNumber(resAllSnapshots.result?.page ?? 1);
      setAllSnapshots(resAllSnapshots.result?.items ?? []);
      let lastElId = 0;
      if (items) {
        lastElId = items.length > 0 ? items[0]?.id : 0;
        setLatestSnapshotId(lastElId);
        if (trackLatestSidePanel) {
          const snapshotId1 = lastElId;
          const snapshotId2 = trackPreviousSnapshot ? lastElId - 1 : Number(secondId);
          fetchOneSnapshot(snapshotId1, snapshotId2, false, true);
        }
      }
      if (firstTime) {
        if (items) {
          setSelectedSnapshotId(lastElId);
          fetchOneSnapshot(lastElId, lastElId - 1, true, true);
        } else {
          if (selectedSnapshotId) {
            fetchOneSnapshot(selectedSnapshotId);
            setReset(false);
          }
        }
      }
    }
  };

  useEffect(() => {
    setAllSnapshots([]);
    fetchGitgraphSnapshots(true, pageNumber);
  }, [pageNumber]);
  // -----------------------------------------------------------
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // PERIODICAL FETCH ALL SNAPSHOTS
  const intervalFetch = async (page: number) => {
    const resAllSnapshots = await fetchAllSnapshots(page);
    if (resAllSnapshots) {
      setTotalPages(resAllSnapshots.result?.total_pages as number);
      setPageNumber(resAllSnapshots.result?.page as number);
      const newMaxId = resAllSnapshots.result?.items[0]?.id;
      const odlMaxId = allSnapshots ? allSnapshots[0]?.id : 0;
      console.log(`Max snapshot ID - previous=${odlMaxId}, latest=${newMaxId}`);
      if (newMaxId !== odlMaxId! && resAllSnapshots.result?.items?.length !== 0) {
        setReset(true);
      } else {
        setReset(false);
      }
    }
  };

  // TODO Add lastSelectedId! in state

  useEffect(() => {
    const checkInterval = setInterval(() => intervalFetch(pageNumber), 1000);
    return () => clearInterval(checkInterval);
  }, [allSnapshots, pageNumber]);
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // PERIODICAL FETCH ALL SNAPSHOTS
  useEffect(() => {
    if (reset) {
      // setAllSnapshots([]);
      const updateFn = setTimeout(() => fetchGitgraphSnapshots(false, pageNumber), 2);
      return () => clearTimeout(updateFn);
    }
  }, [reset, pageNumber]);
  // -----------------------------------------------------------

  return (
    <SnapshotsContext.Provider
      value={{
        trackLatestSidePanel,
        setTrackLatestSidePanel,
        trackPreviousSnapshot,
        setTrackPreviousSnapshot,
        totalPages,
        pageNumber,
        setPageNumber,
        allSnapshots,
        setAllSnapshots,

        selectedSnapshotId,
        setSelectedSnapshotId,

        latestSnapshotId,
        setLatestSnapshotId,

        clickedForSnapshotSelection,
        setClickedForSnapshotSelection,

        jsonData,
        setJsonData,
        jsonDataSidePanel,
        setJsonDataSidePanel,
        diffData,
        setDiffData,
        result,
        setResult,
        fetchOneSnapshot,
        firstId,
        setFirstId,
        secondId,
        setSecondId,
        reset,
        setReset,
      }}
    >
      {props.children}
    </SnapshotsContext.Provider>
  );
}
