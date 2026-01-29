import React from "react";
import {
  getSelectedNodeInWorkflowName,
  getSelectedWorkflow,
  setSelectedNodeInWorkflowName,
  setSelectedSnapshotId,
  setSelectedWorkflow,
  setSubgraphForward,
  SnapshotDTO,
} from "../../../../stores/SnapshotsStore";
import styles from "./ExecutionCard.module.scss";
import { classNames } from "../../../../utils/classnames";
import { formatDate } from "../../../../utils/formatDateTime";
import { formatTimeDuration } from "../../../../utils/formatTimeDuration";
import { useRootDispatch } from "../../../../stores";
import { useSelector } from "react-redux";
import { setSelectedSnapshot } from "../../../../stores/SnapshotsStore/actions";
import { TagsList } from "./components";

type Props = {
  snapshot: SnapshotDTO;
  isSelected: boolean;
  handleOnClick: () => void;
  handleOnAddTagClick: () => void;
};

const ExecutionCard: React.FC<Props> = ({ snapshot, isSelected = true, handleOnClick, handleOnAddTagClick }) => {
  const dispatch = useRootDispatch();
  const selectedNodeInWorkflowName = useSelector(getSelectedNodeInWorkflowName);
  const selectedWorkflow = useSelector(getSelectedWorkflow);

  const isHighlighted = snapshot.metadata.name === selectedNodeInWorkflowName || isSelected;

  const statusClassMap: Record<string, string> = {
    running: styles.statusRunning,
    pending: styles.statusPending,
    success: styles.statusSuccess,
    failure: styles.statusFailure,
    error: styles.statusError,
  };
  const statusDotClassMap: Record<string, string> = {
    running: styles.statusDotRunning,
    pending: styles.statusDotPending,
    success: styles.statusDotSuccess,
    failure: styles.statusDotFailure,
    error: styles.statusDotError,
  };
  const executionId = snapshot.id;
  const executionName = snapshot.metadata?.name;
  const executionStatus = snapshot.metadata?.status ?? "finished";
  const runStart = snapshot.metadata?.run_start;
  const runDuration = snapshot.metadata?.run_duration ?? 0;
  const isWorkflowType = snapshot.type_of_execution.toLocaleLowerCase() === "workflow";

  const handleOnGraphClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(setSelectedWorkflow(snapshot));
    dispatch(setSelectedSnapshotId(snapshot?.id));
    dispatch(setSelectedSnapshot(snapshot));

    dispatch(setSelectedNodeInWorkflowName(snapshot?.metadata?.name));
    if (snapshot?.metadata?.name !== selectedWorkflow?.metadata?.name) {
      dispatch(setSubgraphForward(snapshot.metadata.name));
    }
  };

  return (
    <div className={classNames(styles.executionCard, isHighlighted && styles.selected)} onClick={handleOnClick}>
      <div className={styles.executionHeader}>
        <div className={styles.executionHeaderLeft}>
          <span className={styles.executionName} title={executionName}>
            {executionName}
          </span>
        </div>
        <div className={classNames(styles.executionStatus, statusClassMap[executionStatus])}>
          <div className={classNames(styles.statusDot, statusDotClassMap[executionStatus])} />
          {executionStatus}
        </div>
      </div>
      <div className={styles.executionMeta}>
        <div className={styles.executionMetaItem}>
          <span className={styles.executionId}>#{executionId}</span>
        </div>
        <div className={styles.executionMetaItem}>
          {/*TODO Extract to an Icon*/}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatTimeDuration(runDuration)}
        </div>
        <div className={styles.executionMetaItem}>
          {/*TODO Extract to an Icon*/}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {runStart && formatDate(runStart)}
        </div>
        {isWorkflowType && (
          <div className={styles.executionMetaItemGraphCard}>
            <span className={styles.executionTypeBadge} onClick={handleOnGraphClick}>
              GRAPH
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </div>
        )}
      </div>
      <TagsList snapshot={snapshot} handleOnAddTagClick={handleOnAddTagClick} />
    </div>
  );
};
export default ExecutionCard;
