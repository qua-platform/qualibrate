/**
 * @fileoverview Container component rendering all available calibration nodes.
 *
 * Displays the complete list of quantum calibration nodes from the node library.
 * Shows a loading spinner during node library rescanning.
 */
import React from "react";
import {NodeElement} from "../NodeElement/NodeElement";
import {SearchField, SortButton} from "../../../../components";
import {useSelector} from "react-redux";
import {getAllNodes, getIsRescanningNodes, getNodeListSearchValue, setNodeListSearch, setNodeListSortType} from "../../../../stores/NodesStore";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodesLeftPanel.module.scss";
import {CircularProgress} from "@mui/material";
import {useRootDispatch} from "../../../../stores";
import {NodesListSortType} from "../../../../stores/NodesStore/NodesStore";

const sortOptions = [
  {
    label: "Name (A-Z)",
    value: NodesListSortType.Name,
  },
  {
    label: "Last Run",
    value: NodesListSortType.LastRun,
  },
  // TODO: we don't save status and time of executions for every node, only the last one.
  // Because of that "Last Run" and "Status" are the same.
  // Uncomment when more nodes have execution status
  // {
  //   label: "Status",
  //   value: NodesListSortType.Status,
  // },
];

/**
 * Render list of all calibration nodes with loading state handling.
 *
 * Displays LoaderPage while rescanning the node library (triggered by
 * NodesApi.fetchAllNodes with rescan=true). Once loaded, renders each
 * node as an interactive NodeElement.
 */
export const NodesLeftPanel: React.FC = () => {
  const dispatch = useRootDispatch();
  const searchValue = useSelector(getNodeListSearchValue);
  const allNodes = useSelector(
    getAllNodes,
    // make sure that list rerenders only is map keys have changed
    { equalityFn: (prev, curr) => Object.keys(prev || {}).join() === Object.keys(curr || {}).join() }
  );
  const isRescanningNodes = useSelector(getIsRescanningNodes);

  const handleSetSearchValue = (value: string) => {
    dispatch(setNodeListSearch(value));
  };

  const handleOnSortSelect = (option: NodesListSortType) => {
    dispatch(setNodeListSortType(option));
  };

  return (
    <div className={styles.sidePanelWrapper}>
      <div className={styles.headerPanel}>
        <h2>Node Library</h2>
        <div className={styles.searchFilterContainer}>
          <SearchField placeholder="Search nodes..." value={searchValue} onChange={handleSetSearchValue} debounceMs={500} />
          <SortButton key={"sortFilter"} options={sortOptions} onSelect={handleOnSortSelect} />
        </div>
      </div>
      <div className={styles.listWrapper} data-testid="node-list-wrapper">
        {isRescanningNodes ? (
          <div className={styles.progress}>
            <CircularProgress size={32} />
            Node library scan in progress
            <div>
              See <span className={styles.logsText}>LOGS</span> for details (bottomright){" "}
            </div>
          </div>
        ) : (
          allNodes &&
          Object.keys(allNodes).map((key) => {
            return <NodeElement key={key} nodeKey={key} data-testid={`node-element-${key}`} />;
          })
        )}
      </div>
    </div>
  );
};
