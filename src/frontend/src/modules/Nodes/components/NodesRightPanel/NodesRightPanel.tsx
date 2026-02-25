import React, { useCallback, useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodesRightPanel.module.scss";
import { ParametersViewer, Results, ResizableTabSidebar } from "../../../../components";
import { useSelector } from "react-redux";
import { getIsRescanningNodes, getResults, getRunningNode, handleRunNode, setNodeParameter } from "../../../../stores/NodesStore";
import { getRunResultNodeError, getRunStatusIsRunning } from "../../../../stores/WebSocketStore";
import { ParameterStructure, SnapshotsApi } from "../../../../stores/SnapshotsStore/api/SnapshotsApi";
import { classNames } from "../../../../utils/classnames";
import { NodeDTO } from "../NodeElement/NodeElement";
import { useRootDispatch } from "../../../../stores";
import { getRunningNodeInfo, getSelectedNode } from "../../../../stores/NodesStore/selectors";
import ParametersModal from "../../../../components/ParametersModal/ParametersModal";
import { StateUpdates } from "../StateUpdates/StateUpdates";
import StatusBanner from "../StatusBanner/StatusBanner";

export const nodeToParameters = (node?: NodeDTO): ParameterStructure => {
  if (!node || !node.parameters) return {};

  return Object.entries(node.parameters).reduce((acc, [paramKey, paramObject]) => {
    acc[paramKey] = paramObject.default;
    return acc;
  }, {} as ParameterStructure);
};

export const NodesRightPanel = () => {
  const [showPopup, setShowPopup] = useState(false);
  const dispatch = useRootDispatch();
  const selectedNode = useSelector(getSelectedNode);
  const results = useSelector(getResults);
  const runResultError = useSelector(getRunResultNodeError);
  const isRescanningNodes = useSelector(getIsRescanningNodes);
  const runStatusIsRunning = useSelector(getRunStatusIsRunning);
  const runningNode = useSelector(getRunningNode);
  const runningNodeInfo = useSelector(getRunningNodeInfo);

  const handleOnClickRunButton = () => setShowPopup(true);
  const handleStopClick = async () => SnapshotsApi.stopNodeRunning();
  const handleClose = () => setShowPopup(false);
  const handleApply = useCallback(async () => selectedNode && dispatch(handleRunNode(selectedNode as NodeDTO)), [selectedNode]);
  const handleParamChange = useCallback(
    (paramKey: string, newValue: boolean | number | string | string[] | undefined) =>
      dispatch(setNodeParameter({ nodeKey: selectedNode.name, paramKey, newValue })),
    [selectedNode?.name]
  );

  const tabs = [
    {
      title: "State Updates",
      render: <StateUpdates />,
    },
    {
      title: "Parameters",
      render: (
        <div className={styles.tabContainer}>
          <ParametersViewer data={nodeToParameters(runningNode)} />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.wrapper} data-testid="nodes-page-wrapper">
      <StatusBanner />
      {runningNodeInfo && results ? (
        <div className={styles.resultsWrapper}>
          <ResizableTabSidebar tabs={tabs} startWidth={350} />
          <div className={styles.nodesAndRunningJobInfoWrapper} data-testid="nodes-and-job-wrapper">
            <Results jsonObject={results ?? {}} showSearch={false} toggleSwitch={true} errorObject={runResultError} />
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>⚡</div>
          <h3>Run a node to view details</h3>
          <p>Choose a node from the library to configure and run</p>
        </div>
      )}
      {selectedNode ? (
        runStatusIsRunning ? (
          <button
            disabled={isRescanningNodes}
            className={classNames(styles.floatingButton, styles.stop)}
            id="floatingRerunBtn"
            onClick={handleStopClick}
          >
            ⏹ STOP
          </button>
        ) : (
          <button disabled={isRescanningNodes} className={styles.floatingButton} id="floatingRerunBtn" onClick={handleOnClickRunButton}>
            ▶ Run
          </button>
        )
      ) : (
        <></>
      )}
      <ParametersModal
        show={showPopup}
        onClose={handleClose}
        onApply={handleApply}
        onParamChange={handleParamChange}
        params={selectedNode?.parameters}
      />
    </div>
  );
};
