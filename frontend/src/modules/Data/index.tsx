import React, { Dispatch, SetStateAction } from "react";
import styles from "./Data.module.scss";
import cyKeys from "../../utils/cyKeys";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import { classNames } from "../../utils/classnames";
import { Gitgraph, templateExtend, TemplateName } from "@gitgraph/react";
import { JsonViewer, defineDataType } from "@textea/json-viewer";
import { SnapshotsContextProvider, useSnapshotsContext } from "../Snapshots/context/SnapshotsContext";
import { SnapshotDTO } from "../Snapshots/SnapshotDTO";
import PaginationWrapper from "../Pagination/PaginationWrapper";

const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const TimelineGraph = ({
  allSnapshots,
  selectedSnapshotIndex,
  setSelectedSnapshotIndex,
  setSelectedSnapshotId,
  setFlag,
  fetchOneGitgraphSnapshot,
}: {
  allSnapshots: SnapshotDTO[];

  selectedSnapshotIndex: number | undefined;
  setSelectedSnapshotIndex: Dispatch<SetStateAction<number | undefined>>;
  setSelectedSnapshotId: Dispatch<SetStateAction<number | undefined>>;

  setFlag: Dispatch<SetStateAction<any>>;
  fetchOneGitgraphSnapshot: (snapshots: SnapshotDTO[], selectedIndex: number) => void;
}) => {
  const withoutAuthor = templateExtend(TemplateName.Metro, {
    commit: {
      message: {
        displayAuthor: false,
      },
      spacing: 50,
    },
  });

  return (
    allSnapshots?.length > 0 &&
    selectedSnapshotIndex !== undefined && (
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

          allSnapshots.map((snapshot: SnapshotDTO, index) => {
            const snapshotId = snapshot?.id.toString();
            mainBranch.commit({
              hash: `#${snapshotId}`,
              author: "",
              body: formatDateTime(snapshot.created_at),
              subject: snapshot.metadata?.name,
              style: {
                dot: {
                  color: selectedSnapshotIndex === index ? "#d9d5d4" : "gray",
                },
              },
              onClick: () => {
                setFlag(true);
                setSelectedSnapshotIndex(index);
                setSelectedSnapshotId(snapshot?.id);
                fetchOneGitgraphSnapshot(allSnapshots, index);
              },
            });
          });
        }}
      </Gitgraph>
    )
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
  const {
    totalPages,
    setPageNumber,
    allSnapshots,
    selectedSnapshotIndex,
    setSelectedSnapshotIndex,
    setSelectedSnapshotId,
    jsonData,
    diffData,
    result,
    setFlag,
    fetchOneGitgraphSnapshot,
  } = useSnapshotsContext();
  return (
    <div ref={ref} className={styles.wrapper}>
      <div className={classNames(styles.explorer)}>
        <div className={classNames(styles.data)}>
          <div className={styles.listWrapper} data-cy={cyKeys.data.EXPERIMENT_LIST}></div>
          <TimelineGraph
            allSnapshots={allSnapshots}
            setFlag={setFlag}
            selectedSnapshotIndex={selectedSnapshotIndex}
            setSelectedSnapshotIndex={setSelectedSnapshotIndex}
            setSelectedSnapshotId={setSelectedSnapshotId}
            fetchOneGitgraphSnapshot={fetchOneGitgraphSnapshot}
          />
          <PaginationWrapper numberOfPages={totalPages} setPageNumber={setPageNumber} />
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
  <SnapshotsContextProvider>
    <DataGUAlibrate />
  </SnapshotsContextProvider>
);
