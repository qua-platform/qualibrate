import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DataViewContextProvider } from "./context/DataViewContext";
import styles from "./Data.module.scss";
import cyKeys from "../../utils/cyKeys";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import { classNames } from "../../utils/classnames";
import { Gitgraph, templateExtend, TemplateName } from "@gitgraph/react";
import { JsonViewer, defineDataType } from "@textea/json-viewer";
import { DataViewApi } from "./api/DataViewApi";

const TimelineGraph = ({
  setJsonData,
  setResults,
}: {
  setJsonData: Dispatch<SetStateAction<any>>;
  setResults: Dispatch<SetStateAction<any>>;
}) => {
  const [allSnapshots, setAllSnapshots] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [flag, setFlag] = useState<boolean>(false);
  const [reset, setReset] = useState<boolean>(false);

  // -----------------------------------------------------------
  // FIRST FETCH ALL SNAPSHOTS ON THE BEGINNING
  const fetchGitgraphSnapshots = (firstTime: boolean) => {
    DataViewApi.fetchAllSnapshots().then((promise: any) => {
      setAllSnapshots(
        (promise.result as any[]).map((res, index) => {
          if (firstTime) {
            return Object.assign(res, { isSelected: index == promise.result.length - 1 });
          }
          return Object.assign(res, { isSelected: index == selectedIndex });
        })
      );
      if (firstTime) {
        fetchOneGitgraphSnapshot(promise.result[promise.result.length - 1].id);
      } else {
        fetchOneGitgraphSnapshot(promise.result[selectedIndex].id);
        setReset(false);
      }
    });
  };

  useEffect(() => {
    fetchGitgraphSnapshots(true);
  }, []);
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // PERIODICAL FETCH ALL SNAPSHOTS
  const intervalFetch = () => {
    DataViewApi.fetchAllSnapshots().then((promise: any) => {
      const oldMaxId = Math.max(...allSnapshots.map((res: any) => res.id));
      const newMaxId = Math.max(...promise.result.map((res: any) => res.id));
      console.log(`Max snapshot ID - previous=${oldMaxId}, latest=${newMaxId}`);
      if (newMaxId > oldMaxId && allSnapshots.length !== 0) {
        setReset(true);
      } else {
        setReset(false);
      }
      return promise;
    });
  };
  useEffect(() => {
    const checkInterval = setInterval(async () => intervalFetch(), 1500);
    return () => clearInterval(checkInterval);
  }, [allSnapshots]);
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // PERIODICAL FETCH ALL SNAPSHOTS
  useEffect(() => {
    if (reset) {
      setAllSnapshots([]);
      const updateFn = setTimeout(() => fetchGitgraphSnapshots(false), 2);
      return () => clearTimeout(updateFn);
    }
  }, [reset]);
  // -----------------------------------------------------------

  const fetchOneGitgraphSnapshot = (id: string) => {
    DataViewApi.fetchSnapshot(id).then((promise: any) => {
      setJsonData(promise?.result.data);
    });
    DataViewApi.fetchSnapshotResult(id).then((promise: any) => {
      if (promise.result) {
        setResults(promise?.result);
      } else {
        setResults(undefined);
      }
    });
  };
  const gitgraphUpdate = () => {
    const newArray = (allSnapshots as any[]).map((res, index) => {
      return Object.assign(res, { isSelected: index == selectedIndex });
    });
    setAllSnapshots(newArray);
  };

  useEffect(() => {
    if (flag) {
      setAllSnapshots([]);
      const updateFn = setTimeout(() => gitgraphUpdate(), 2);
      return () => clearTimeout(updateFn);
    }
  }, [selectedIndex, flag]);

  const withoutAuthor = templateExtend(TemplateName.Metro, {
    commit: {
      message: {
        displayAuthor: false,
      },
      spacing: 50,
    },
  });

  return (
    <div className={styles.timelineGraphWrapper}>
      <div style={{ color: "#d9d5d4" }}>TIMEGRAPH</div>
      <div className={styles.svgWrapper}>
        {allSnapshots?.length > 0 && selectedIndex !== undefined && (
          <Gitgraph options={{ template: withoutAuthor }}>
            {(gitgraph) => {
              const mainBranch = gitgraph.branch({
                name: "main",
                style: {
                  color: "gray",
                  label: {
                    strokeColor: "gray",
                  },
                  spacing: 0.5,
                },
                commitDefaultOptions: {
                  style: {
                    color: "gray",
                    message: {
                      color: "#d9d5d4",
                    },
                  },
                },
              });

              allSnapshots.forEach((snapshot: any, index) => {
                const snapshotId = snapshot?.id.toString();
                mainBranch.commit({
                  hash: snapshotId,
                  author: "",
                  subject: snapshot.metadata.name,
                  style: {
                    dot: {
                      color: snapshot.isSelected ? "#d9d5d4" : "gray",
                    },
                  },
                  onClick: () => {
                    setFlag(true);
                    setSelectedIndex(index);
                    fetchOneGitgraphSnapshot(snapshotId);
                  },
                });
              });
            }}
          </Gitgraph>
        )}
      </div>
    </div>
  );
};

const JSONEditor = ({ title, jsonData }: { title: string; jsonData: any }) => {
  const imageDataType = defineDataType({
    is: (value) => typeof value === "string" && value.startsWith("data:image"),
    Component: ({ value }) => (
      <div>
        <br />
        <img style={{ maxWidth: "100%", height: "auto" }} src={value as string} alt={value as string} />
      </div>
    ),
  });
  return (
    <div style={{ color: "#d9d5d4", minWidth: "630px", maxWidth: "800px", paddingLeft: "20px" }}>
      <h1>{title}</h1>
      <JsonViewer theme={"dark"} value={jsonData} valueTypes={[imageDataType]} style={{ overflowY: "auto", height: "100%" }} />
    </div>
  );
};

const DataGUAlibrate = () => {
  const [ref] = useModuleStyle<HTMLDivElement>();
  const [jsonData, setJsonData] = useState(undefined);
  const [result, setResults] = useState(undefined);
  return (
    <div ref={ref} className={styles.wrapper}>
      <div className={classNames(styles.explorer)}>
        <div className={classNames(styles.data)}>
          <div className={styles.listWrapper} data-cy={cyKeys.data.EXPERIMENT_LIST}></div>
          <TimelineGraph setJsonData={setJsonData} setResults={setResults} />
        </div>
        <div className={styles.viewer}>
          {jsonData && <JSONEditor title={"QUAM"} jsonData={jsonData} />}
          {result && <JSONEditor title={"RESULTS"} jsonData={result} />}
        </div>
      </div>
    </div>
  );
};

export default () => (
  <DataViewContextProvider>
    <DataGUAlibrate />
  </DataViewContextProvider>
);
