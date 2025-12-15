/**
 * @fileoverview Container component rendering all available calibration nodes.
 *
 * Displays the complete list of quantum calibration nodes from the node library.
 * Shows a loading spinner during node library rescanning.
 */
import React from "react";
import {NodeElement} from "./NodeElement";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../../NodesPage.module.scss";
import {LoaderPage} from "../../../../components";
import {useSelector} from "react-redux";
import {getAllNodes, getIsRescanningNodes} from "../../../../stores/NodesStore";

/**
 * Render list of all calibration nodes with loading state handling.
 *
 * Displays LoaderPage while rescanning the node library (triggered by
 * NodesApi.fetchAllNodes with rescan=true). Once loaded, renders each
 * node as an interactive NodeElement.
 */
export const NodeElementList: React.FC = () => {
  const allNodes = useSelector(
    getAllNodes,
    // make sure that list rerenders only is map keys have changed
    { equalityFn: (prev, curr) => Object.keys(prev || {}).join() === Object.keys(curr || {}).join() }
  );
  const isRescanningNodes = useSelector(getIsRescanningNodes);

  if (isRescanningNodes) {
    return <LoaderPage />;
  }

  return (
    allNodes && (
      <div className={styles.listWrapper} data-testid="node-list-wrapper">
        {Object.keys(allNodes).map((key) => {
          return <NodeElement key={key} nodeKey={key} data-testid={`node-element-${key}`} />;
        })}
      </div>
    )
  );
};
