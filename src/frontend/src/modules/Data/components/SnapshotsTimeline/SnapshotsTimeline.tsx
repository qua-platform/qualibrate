import React, { useState } from "react";
import styles from "./SnapshotsTimeline.module.scss";
import { useSelector } from "react-redux";
import {
  fetchOneSnapshot,
  getAllSnapshots,
  getSelectedSnapshot,
  getSelectedSnapshotId,
  getSelectedWorkflowForGraph,
  setClickedForSnapshotSelection,
  setSelectedNodeInWorkflowName,
  setSelectedSnapshot,
  setSelectedSnapshotId,
  SnapshotDTO,
} from "../../../../stores/SnapshotsStore";
import { useRootDispatch } from "../../../../stores";
import ExecutionCard, { ManageTagsModal } from "../ExecutionCard";

const SnapshotsTimeline: React.FC = () => {
  const dispatch = useRootDispatch();
  const allSnapshots = useSelector(getAllSnapshots);
  const selectedSnapshotId = useSelector(getSelectedSnapshotId);
  const selectedSnapshot = useSelector(getSelectedSnapshot);
  const selectedWorkflowGraph = useSelector(getSelectedWorkflowForGraph);
  const [showTagsModal, setShowTagsModal] = useState(false);

  const handleOnClick = (snapshot: SnapshotDTO) => {
    dispatch(setSelectedSnapshotId(snapshot.id));
    dispatch(setSelectedNodeInWorkflowName(snapshot?.metadata?.name));
    dispatch(setClickedForSnapshotSelection(true));
    dispatch(fetchOneSnapshot(snapshot.id));
    dispatch(setSelectedSnapshot(snapshot));
  };

  const handleOnAddTagClick = () => {
    setShowTagsModal(true);
  };

  const handleOnClose = () => {
    setShowTagsModal(false);
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
      {(selectedWorkflowGraph?.items ?? allSnapshots)?.length > 0 && (
        <div className={styles.wrapper}>
          {(selectedWorkflowGraph?.items ?? allSnapshots).map((snapshot) => (
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
      {showTagsModal && <ManageTagsModal currentSelectedTags={selectedSnapshot?.tags} handleOnClose={handleOnClose} />}
    </>
  );
};
export default SnapshotsTimeline;
