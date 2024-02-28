import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DataViewContextProvider } from "./context/DataViewContext";
import styles from "./Data.module.scss";
import cyKeys from "../../utils/cyKeys";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import { classNames } from "../../utils/classnames";
import { Gitgraph } from "@gitgraph/react";
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

  const fetchGitgraphSnapshots = () => {
    DataViewApi.fetchAllSnapshots().then((promise: any) => {
      setAllSnapshots(
        (promise.result as any[]).map((res, index) => {
          return Object.assign(res, { isSelected: index == selectedIndex });
        })
      );
      fetchOneGitgraphSnapshot(promise.result[selectedIndex].id);
    });
  };
  const intervalFetch = () => {
    DataViewApi.fetchAllSnapshots().then((promise: any) => {
      if (promise.result.length > allSnapshots.length && allSnapshots.length !== 0) {
        setAllSnapshots(promise.result);
        setFlag(true);
      }
      return promise;
    });
  };
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
    fetchGitgraphSnapshots(true);
  }, []);

  useEffect(() => {
    if (flag) {
      setAllSnapshots([]);
      const updateFn = setTimeout(() => gitgraphUpdate(), 2);
      return () => clearTimeout(updateFn);
    }
  }, [selectedIndex, flag]);

  useEffect(() => {
    setInterval(async () => intervalFetch(), 1500);
  }, [allSnapshots, setAllSnapshots]);

  return (
    <div className={styles.timelineGraphWrapper}>
      <div style={{ color: "white" }}>TIMEGRAPH</div>
      <div style={{ overflow: "scroll", maxHeight: "1140px" }}>
        {allSnapshots?.length > 0 && selectedIndex !== undefined && (
          <Gitgraph>
            {(gitgraph) => {
              const mainBranch = gitgraph.branch({
                name: "main",
                style: {
                  color: "gray",
                  label: {
                    strokeColor: "gray",
                  },
                },
                commitDefaultOptions: {
                  style: {
                    color: "gray",
                    message: {
                      color: "white",
                    },
                    dot: {
                      color: "gray",
                    },
                  },
                },
              });

              allSnapshots
                .slice()
                .reverse()
                .forEach((snapshot: any, index) => {
                  const snapshotId = snapshot?.id.toString();
                  mainBranch.commit({
                    hash: snapshotId,
                    author: "",
                    subject: snapshot.metadata.name,
                    style: {
                      dot: {
                        color: snapshot.isSelected ? "white" : "gray",
                      },
                    },
                    onClick: () => {
                      setFlag(true);
                      setSelectedIndex(allSnapshots.length - index - 1);
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
        <img height={250} width={400} src={value as string} alt={value as string} />
      </div>
    ),
  });
  return (
    <div style={{ color: "white", minWidth: "630px", paddingLeft: "20px" }}>
      <h1>{title}</h1>
      <JsonViewer theme={"dark"} value={jsonData} valueTypes={[imageDataType]} />
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
