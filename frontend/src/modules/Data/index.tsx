import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import styles from "../Data/Data.module.scss";
import cyKeys from "../../utils/cyKeys";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import { classNames } from "../../utils/classnames";
import { Gitgraph, templateExtend, TemplateName } from "@gitgraph/react";
import { defineDataType, JsonViewer, Path } from "@textea/json-viewer";
import { SnapshotsContextProvider, useSnapshotsContext } from "../Snapshots/context/SnapshotsContext";
import { SnapshotDTO } from "../Snapshots/SnapshotDTO";
import PaginationWrapper from "../Pagination/PaginationWrapper";
import InputField from "../../DEPRECATED_components/common/Input/InputField";
import jp from "jsonpath";

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

  setFlag: Dispatch<SetStateAction<boolean>>;
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

export const JSONEditor = ({ title, jsonDataProp, height }: { title: string; jsonDataProp: object; height: string }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [jsonData, setJsonData] = useState(jsonDataProp);

  const filterData = (data: object, term: string) => {
    if (!term) return data;

    try {
      // Convert search term to JSONPath query
      let jsonPathQuery = term.replace("#", "$").replace(/\*/g, "*").replace(/\//g, ".");

      // Perform the JSONPath query
      const result = jp.nodes(data, jsonPathQuery);

      // Reconstruct the filtered data structure
      return result.reduce((acc: any, { path, value }: { path: jp.PathComponent[]; value: any }) => {
        let current = acc;
        for (let i = 1; i < path.length - 1; i++) {
          const key = path[i] as string;
          if (!current[key]) current[key] = {};
          current = current[key];
        }
        const lastKey = path[path.length - 1] as string;
        current[lastKey] = value;
        return acc;
      }, {});
    } catch (error) {
      console.error("Invalid JSONPath query:", error);
      return data;
    }
  };

  const handleSearch = (_val: string, e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filteredData = filterData(jsonDataProp, e.target.value);
    setJsonData(filteredData);
  };

  const imageDataType = defineDataType({
    is: (value) => typeof value === "string" && value.startsWith("data:image"),
    Component: ({ value }) => (
      <div>
        <br />
        <img style={{ maxWidth: "100%", height: "auto" }} src={value as string} alt={value as string} />
      </div>
    ),
  });
  const handleOnSelect = async (path: Path) => {
    let searchPath = "#";
    path.forEach((a) => {
      searchPath += "/" + a;
    });
    setSearchTerm(searchPath);
    const filteredData = filterData(jsonDataProp, searchPath);
    await navigator.clipboard.writeText(searchPath);
    setJsonData(filteredData);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        color: "#d9d5d4",
        height: height,
        marginLeft: "20px",
        marginRight: "20px",
      }}
    >
      <h1 style={{ paddingTop: "20px", paddingBottom: "5px" }}>{title}</h1>

      <InputField value={searchTerm} title={"Search"} onChange={(_e, event) => handleSearch(event.target.value, event)}></InputField>
      <JsonViewer
        rootName={false}
        onSelect={(path, _a) => handleOnSelect(path)}
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
          <div data-cy={cyKeys.data.EXPERIMENT_LIST}></div>
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
          {result && <JSONEditor title={"RESULTS"} jsonDataProp={result} height={"100%"} />}
          <div
            style={{
              overflow: "auto",
              flex: 1,
            }}
          >
            {jsonData && !diffData && <JSONEditor title={"QUAM"} jsonDataProp={jsonData} height={"100%"} />}
            {jsonData && diffData && <JSONEditor title={"QUAM"} jsonDataProp={jsonData} height={"66%"} />}
            {jsonData && diffData && <JSONEditor title={"QUAM Updates"} jsonDataProp={diffData} height={"33%"} />}
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
