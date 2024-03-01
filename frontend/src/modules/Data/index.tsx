import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DataViewContextProvider } from "./context/DataViewContext";
import styles from "./Data.module.scss";
import cyKeys from "../../utils/cyKeys";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import { classNames } from "../../utils/classnames";
import { Gitgraph, templateExtend, TemplateName } from "@gitgraph/react";
import { JsonViewer, defineDataType } from "@textea/json-viewer";
import { DataViewApi } from "./api/DataViewApi";


const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime + "Z");
  const formattedDateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  return formattedDateTime;
};


const TimelineGraph = ({
  setJsonData,
  setResults,
  setDiffData,
}: {
  setJsonData: Dispatch<SetStateAction<any>>;
  setResults: Dispatch<SetStateAction<any>>;
  setDiffData: Dispatch<SetStateAction<any>>;
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
          return Object.assign(res, { isSelected: res?.id == selectedIndex });
        })
      );
      if (firstTime) {
        fetchOneGitgraphSnapshot(promise.result[promise.result.length - 1].id);
      } else {
        fetchOneGitgraphSnapshot(selectedIndex.toString());
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
    DataViewApi.fetchSnapshotUpdate((Number(id) - 1).toString(), id).then((promise: any) => {
      if (promise.result) {
        setDiffData(promise?.result);
      } else {
        setDiffData({});
      }
    });
  };
  const gitgraphUpdate = () => {
    const newArray = (allSnapshots as any[]).map((res, index) => {
      // console.log("Updating git graph, selected index: ", selectedIndex, "res.id: ", res.id, "index: ", index);
      return Object.assign(res, { isSelected: res?.id == selectedIndex });
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
      <div style={{ color: "#d9d5d4", paddingLeft: "20px", paddingTop: "20px" }}>TIMEGRAPH</div>
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
                  hash: `#${snapshotId}`,
                  author: "",
                  body: formatDateTime(snapshot.created_at),
                  subject: snapshot.metadata.name,
                  style: {
                    dot: {
                      color: snapshot.isSelected ? "#d9d5d4" : "gray",
                    },
                  },
                  onClick: () => {
                    setFlag(true);
                    setSelectedIndex(snapshotId);
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

const JSONEditor = ({ title, jsonData, height }: { title: string; jsonData: any; height: string }) => {
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        color: "#d9d5d4",
        height: height,
        minWidth: "630px",
        maxWidth: "100%",
        marginLeft: "20px",
        marginRight: "20px",
      }}
    >
      <h1 style={{ paddingTop: "20px", paddingBottom: "5px" }}>{title}</h1>
      <JsonViewer
        theme={"dark"}
        value={jsonData}
        valueTypes={[imageDataType]}
        displayDataTypes={false}
        defaultInspectDepth={3}
        style={{ overflowY: "auto", height: "100%", paddingBottom: "15px" }}
      />
    </div>
  );
};

const DataGUAlibrate = () => {
  const [ref] = useModuleStyle<HTMLDivElement>();
  const [jsonData, setJsonData] = useState(undefined);
  const [diffData, setDiffData] = useState(undefined);
  const [result, setResults] = useState(undefined);
  return (
    <div ref={ref} className={styles.wrapper}>
      <div className={classNames(styles.explorer)}>
        <div className={classNames(styles.data)}>
          <div className={styles.listWrapper} data-cy={cyKeys.data.EXPERIMENT_LIST}></div>
          <TimelineGraph setJsonData={setJsonData} setResults={setResults} setDiffData={setDiffData} />
        </div>
        <div className={styles.viewer}>
          <div>{result && <JSONEditor title={"RESULTS"} jsonData={result} height={"100%"} />}</div>
          <div
            style={{
              overflow: "auto",
            }}
          >
            {jsonData && !diffData && <JSONEditor title={"QUAM"} jsonData={jsonData} height={"100%"} />}
            {jsonData && diffData && <JSONEditor title={"QUAM"} jsonData={jsonData} height={"66%"} />}
            {jsonData && diffData && <JSONEditor title={"QUAM Updates"} jsonData={diffData} height={"33%"} />}
          </div>
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
