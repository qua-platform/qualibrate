import React, { useState } from "react";
import styles from "./SnapshotsTimeline.module.scss";
import { useSelector } from "react-redux";
import {
  fetchOneSnapshot,
  getSelectedSnapshot,
  getSelectedSnapshotId,
  getSelectedWorkflowForGraph,
  setClickedForSnapshotSelection,
  setReset,
  setSelectedNodeInWorkflowId,
  setSelectedSnapshot,
  setSelectedSnapshotId,
  SnapshotDTO,
} from "../../../../stores/SnapshotsStore";
import { useRootDispatch } from "../../../../stores";
import ExecutionCard, { ManageTagsModal } from "../ExecutionCard";
import { getExecutionHistorySnapshots } from "../../../../stores/SnapshotsStore/selectors";

const SnapshotsTimeline: React.FC = () => {
  const dispatch = useRootDispatch();
  const selectedSnapshotId = useSelector(getSelectedSnapshotId);
  const selectedSnapshot = useSelector(getSelectedSnapshot);
  const selectedWorkflowGraph = useSelector(getSelectedWorkflowForGraph);
  const executionHistorySnapshots = useSelector(getExecutionHistorySnapshots);
  const [showTagsModal, setShowTagsModal] = useState(false);

  const handleOnClick = (snapshot: SnapshotDTO) => {
    dispatch(setSelectedSnapshotId(snapshot.id));
    dispatch(setSelectedNodeInWorkflowId(snapshot?.id));
    dispatch(setClickedForSnapshotSelection(true));
    dispatch(fetchOneSnapshot(snapshot.id));
    dispatch(setSelectedSnapshot(snapshot));
  };

  const handleOnAddTagClick = () => {
    setShowTagsModal(true);
  };

  const handleOnClose = () => {
    setShowTagsModal(false);
    dispatch(setReset(true));
  };

  return (
    <>
      <div className={styles.wrapper}>
        {selectedWorkflowGraph && (
          <>
            <ExecutionCard
              snapshot={selectedWorkflowGraph}
              isSelected={false}
              handleOnClick={() => handleOnClick(selectedWorkflowGraph)}
              handleOnAddTagClick={handleOnAddTagClick}
            />
            <div className={styles.nodeTitleWrapper}>
              <div className={styles.nodeTitle}>Nodes in this graph</div>
            </div>
          </>
        )}
      </div>
      {executionHistorySnapshots && executionHistorySnapshots.length > 0 && (
        <div className={styles.wrapper}>
          {executionHistorySnapshots.map((snapshot) => (
            <ExecutionCard
              key={snapshot.id}
              snapshot={snapshot}
              isSelected={snapshot.id === selectedSnapshotId}
              handleOnClick={() => handleOnClick(snapshot)}
              handleOnAddTagClick={handleOnAddTagClick}
            />
          ))}
        </div>
      )}
      {showTagsModal && <ManageTagsModal currentSelectedTags={selectedSnapshot?.metadata?.tags || []} handleOnClose={handleOnClose} />}
    </>
  );
};
export default SnapshotsTimeline;
