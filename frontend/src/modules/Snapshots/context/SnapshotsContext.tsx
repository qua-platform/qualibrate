import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { SnapshotDTO } from "../SnapshotDTO";
import { SnapshotResult, SnapshotsApi } from "../api/SnapshotsApi";
import { Res } from "../../../common/interfaces/Api";

interface ISnapshotsContext {
  totalPages: number;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
  allSnapshots: SnapshotDTO[];
  setAllSnapshots: Dispatch<SetStateAction<SnapshotDTO[]>>;

  selectedSnapshotId: number | undefined;
  setSelectedSnapshotId: Dispatch<SetStateAction<number | undefined>>;

  fetchOneSnapshot: (id: number) => void;

  jsonData: object | undefined;
  setJsonData: Dispatch<SetStateAction<object | undefined>>;
  diffData: object | undefined;
  setDiffData: Dispatch<SetStateAction<object | undefined>>;
  result: object | undefined;
  setResult: Dispatch<SetStateAction<object | undefined>>;
}

export const SnapshotsContext = React.createContext<ISnapshotsContext>({
  totalPages: 0,
  pageNumber: 0,
  setPageNumber: () => {},
  allSnapshots: [],
  setAllSnapshots: () => {},

  selectedSnapshotId: undefined,
  setSelectedSnapshotId: () => {},

  fetchOneSnapshot: () => {},

  jsonData: {},
  setJsonData: () => {},
  diffData: {},
  setDiffData: () => {},
  result: {},
  setResult: () => {},
});

export const useSnapshotsContext = (): ISnapshotsContext => useContext<ISnapshotsContext>(SnapshotsContext);

interface SnapshotsContextProviderProps {
  children: React.JSX.Element;
}

export function SnapshotsContextProvider(props: SnapshotsContextProviderProps): React.ReactElement {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [allSnapshots, setAllSnapshots] = useState<SnapshotDTO[]>([]);

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | undefined>(undefined);

  const [reset, setReset] = useState<boolean>(false);

  const [jsonData, setJsonData] = useState<object | undefined>(undefined);
  const [diffData, setDiffData] = useState<object | undefined>(undefined);
  const [result, setResult] = useState<object | undefined>(undefined);

  // -----------------------------------------------------------
  // FIRST FETCH ALL SNAPSHOTS ON THE BEGINNING
  const fetchGitgraphSnapshots = (firstTime: boolean, page: number) => {
    SnapshotsApi.fetchAllSnapshots(page).then((promise: Res<SnapshotResult>) => {
      if (promise.isOk) {
        setTotalPages(promise.result?.total_pages ?? 1);
        setPageNumber(promise.result?.page ?? 1);
        setAllSnapshots(promise?.result?.items ?? []);

        if (firstTime) {
          if (promise?.result?.items) {
            const lastElId = promise?.result.items.length > 0 ? promise?.result.items[0].id : 0;
            setSelectedSnapshotId(lastElId);
            // const lastIndex = promise?.result.items.length - 1;
            fetchOneSnapshot(lastElId);
          }
        } else {
          if (selectedSnapshotId) {
            fetchOneSnapshot(selectedSnapshotId);
            setReset(false);
          }
        }
      }
    });
  };

  useEffect(() => {
    setAllSnapshots([]);
    fetchGitgraphSnapshots(true, pageNumber);
  }, [pageNumber]);
  // -----------------------------------------------------------
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // PERIODICAL FETCH ALL SNAPSHOTS
  const intervalFetch = (page: number) => {
    SnapshotsApi.fetchAllSnapshots(page).then((promise: Res<SnapshotResult>) => {
      setTotalPages(promise.result?.total_pages as number);
      setPageNumber(promise.result?.page as number);
      const newMaxId = promise.result?.items[0].id;
      const odlMaxId = allSnapshots[0].id;
      console.log(`Max snapshot ID - previous=${odlMaxId}, latest=${newMaxId}`);
      if (newMaxId !== odlMaxId! && allSnapshots.length !== 0) {
        setReset(true);
      } else {
        setReset(false);
      }
      return promise;
    });
  };

  // TODO Add lastSelectedId! in state

  useEffect(() => {
    const checkInterval = setInterval(async () => intervalFetch(pageNumber), 1000);
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

  const fetchOneSnapshot = (snapshotId: number) => {
    // const fetchOneSnapshot = (snapshots: SnapshotDTO[], index: number) => {
    // const id1 = snapshots[index].id.toString();
    // const index2 = index - 1 >= 0 ? index - 1 : 0;
    // const index2 = selectedSnapshotId ? (selectedSnapshotId - 1 >= 0 ? selectedSnapshotId - 1 : 0) : 0;
    const id1 = (snapshotId ?? 0).toString();
    const id2 = snapshotId - 1 >= 0 ? (snapshotId - 1).toString() : "0";
    SnapshotsApi.fetchSnapshot(id1)
      .then((promise: Res<SnapshotDTO>) => {
        setJsonData(promise?.result?.data);
      })
      .catch((e) => {
        console.log(e);
      });
    SnapshotsApi.fetchSnapshotResult(id1)
      .then((promise: Res<object>) => {
        if (promise.result) {
          setResult(promise?.result);
        } else {
          setResult(undefined);
        }
      })
      .catch((e) => {
        console.log(e);
      });
    if (id1 !== id2) {
      SnapshotsApi.fetchSnapshotUpdate(id2, id1)
        .then((promise: Res<object>) => {
          if (promise.result) {
            setDiffData(promise?.result);
          } else {
            setDiffData({});
          }
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      setDiffData({});
    }
  };
  // const gitgraphUpdate = () => {
  //   const newArray = allSnapshots.map((res, index) => {
  //     return Object.assign(res, { isSelected: index === selectedSnapshotIndex });
  //   });
  //   setAllSnapshots(newArray);
  // };

  // useEffect(() => {
  //   if (flag) {
  //     setAllSnapshots([]);
  //     const updateFn = setTimeout(() => gitgraphUpdate(), 20);
  //     return () => clearTimeout(updateFn);
  //   }
  // }, [selectedSnapshotIndex, flag]);

  return (
    <SnapshotsContext.Provider
      value={{
        totalPages,
        pageNumber,
        setPageNumber,
        allSnapshots,
        setAllSnapshots,

        selectedSnapshotId,
        setSelectedSnapshotId,

        jsonData,
        setJsonData,
        diffData,
        setDiffData,
        result,
        setResult,
        fetchOneSnapshot,
      }}
    >
      {props.children}
    </SnapshotsContext.Provider>
  );
}
