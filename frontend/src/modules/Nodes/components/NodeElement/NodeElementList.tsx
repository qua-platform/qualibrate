/**
 * @fileoverview Container component rendering all available calibration nodes.
 *
 * Displays the complete list of quantum calibration nodes from the node library.
 * Shows a loading spinner during node library rescanning.
 */
import React from "react";
import {NodeDTO, NodeElement} from "./NodeElement";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../../NodesPage.module.scss";
import LoaderPage from "../../../../ui-lib/loader/LoaderPage";
import {useSelector} from "react-redux";
import {getAllNodes, getIsRescanningNodes} from "../../../../stores/NodesStore/selectors";

/**
 * Render list of all calibration nodes with loading state handling.
 *
 * Displays LoaderPage while rescanning the node library (triggered by
 * NodesApi.fetchAllNodes with rescan=true). Once loaded, renders each
 * node as an interactive NodeElement.
 */
export const NodeElementList: React.FC = () => {
  const allNodes = useSelector(getAllNodes);
  const isRescanningNodes = useSelector(getIsRescanningNodes);

  if (isRescanningNodes) {
    return <LoaderPage />;
  }

  return (
    allNodes && (
      <div className={styles.listWrapper} data-testid="node-list-wrapper">
        {Object.entries(allNodes).map(([key, node]) => {
          return <NodeElement key={key} nodeKey={key} node={node as NodeDTO} data-testid={`node-element-${key}`} />;
        })}
      </div>
    )
  );
};
