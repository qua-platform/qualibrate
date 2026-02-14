/**
 * @fileoverview Container component rendering all available calibration nodes.
 *
 * Displays the complete list of quantum calibration nodes from the node library.
 * Shows a loading spinner during node library rescanning.
 */
import React from "react";
import { NodeElement } from "../NodeElement/NodeElement";
import { SearchField } from "../../../../components";
import { useSelector } from "react-redux";
import { getAllNodes, getIsRescanningNodes } from "../../../../stores/NodesStore";
import { classNames } from "../../../../utils/classnames";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodesLeftPanel.module.scss";
import { CircularProgress } from "@mui/material";

/**
 * Render list of all calibration nodes with loading state handling.
 *
 * Displays LoaderPage while rescanning the node library (triggered by
 * NodesApi.fetchAllNodes with rescan=true). Once loaded, renders each
 * node as an interactive NodeElement.
 */
export const NodesLeftPanel: React.FC = () => {
  const allNodes = useSelector(
    getAllNodes,
    // make sure that list rerenders only is map keys have changed
    { equalityFn: (prev, curr) => Object.keys(prev || {}).join() === Object.keys(curr || {}).join() }
  );
  const isRescanningNodes = useSelector(getIsRescanningNodes);

  return (
    <div className={styles.sidePanelWrapper}>
      <div className={styles.headerPanel}>
        <h2>Node Library</h2>
        <div className={styles.searchFilterContainer}>
          <SearchField placeholder="Search executions..." value={""} onChange={() => {}} debounceMs={500} />
        </div>
        <div className={classNames(styles.searchFilterContainer, styles.wrapAppliedFilters)}>
          {/* TODO: https://quantum-machines.atlassian.net/browse/QUAL-1742 */}
        </div>
      </div>
      <div className={styles.listWrapper} data-testid="node-list-wrapper">
        {isRescanningNodes
          ? <div className={styles.progress}>
              <CircularProgress size={32} />
              Node library scan in progress
              <div>
                See <span className={styles.logsText}>LOGS</span> for details (bottomright){" "}
              </div>
            </div>
          : allNodes && Object.keys(allNodes).map((key) => {
              return <NodeElement key={key} nodeKey={key} data-testid={`node-element-${key}`} />;
            })
        }
      </div>
    </div>
  );
};
