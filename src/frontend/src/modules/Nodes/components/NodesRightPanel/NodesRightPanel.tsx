import React, { useCallback, useState } from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodesRightPanel.module.scss";
import { Results } from "../../../../components";
import { useSelector } from "react-redux";
import { getIsRescanningNodes, getResults, handleRunNode, setNodeParameter, getSelectedNode } from "../../../../stores/NodesStore";
import { getRunResultNodeError, getRunStatusIsRunning } from "../../../../stores/WebSocketStore";
import { SnapshotsApi } from "../../../../stores/SnapshotsStore/api/SnapshotsApi";
import { classNames } from "../../../../utils/classnames";
import { NodeDTO } from "../NodeElement/NodeElement";
import { useRootDispatch } from "../../../../stores";
import ParametersModal from "../../../../components/ParametersModal/ParametersModal";
import { RunningJob } from "../RunningJob/RunningJob";

export const NodesRightPanel = () => {
  const [showPopup, setShowPopup] = useState(false);
  const dispatch = useRootDispatch();
  const selectedNode = useSelector(getSelectedNode);
  const results = useSelector(getResults);
  const runResultError = useSelector(getRunResultNodeError);
  const isRescanningNodes = useSelector(getIsRescanningNodes);
  const runStatusIsRunning = useSelector(getRunStatusIsRunning);

  const handleOnClickRunButton = () => setShowPopup(true);
  const handleStopClick = async () => SnapshotsApi.stopNodeRunning();
  const handleClose = () => setShowPopup(false);
  const handleApply = useCallback(async () => selectedNode && dispatch(handleRunNode(selectedNode as NodeDTO)), [selectedNode]);
  const handleParamChange = useCallback(
    (paramKey: string, newValue: boolean | number | string | string[] | undefined) =>
      dispatch(setNodeParameter({ nodeKey: selectedNode.name, paramKey, newValue })),
    [selectedNode?.name]
  );

  return (
    <div className={styles.wrapper} data-testid="nodes-page-wrapper">
      <div className={styles.nodesAndRunningJobInfoWrapper} data-testid="nodes-and-job-wrapper">
        <div className={styles.nodesContainerDown}>
          <div className={styles.nodeRunningJobInfoWrapper}>
            <RunningJob />
          </div>
          <Results jsonObject={results ?? {}} showSearch={false} toggleSwitch={true} errorObject={runResultError} />
        </div>
      </div>
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
