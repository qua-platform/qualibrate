import React from "react";
import {
  getSelectedNodeInWorkflowName,
  getSelectedWorkflow,
  setSelectedNodeInWorkflowId,
  setSelectedSnapshot,
  setSelectedSnapshotId,
  setSelectedWorkflow,
  setSubgraphForward,
  SnapshotDTO,
} from "../../../../stores/SnapshotsStore";
import styles from "./ExecutionCard.module.scss";
import { formatDate } from "../../../../utils/formatDateTime";
import { formatTimeDuration } from "../../../../utils/formatTimeDuration";
import { useRootDispatch } from "../../../../stores";
import { useSelector } from "react-redux";
import { TagsList } from "./components";
import { DateFilterIcon, ClockIcon, ListCard } from "../../../../components";

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

  const isHighlighted = snapshot.id === selectedNodeInWorkflowName || isSelected;
  const executionId = snapshot.id;
  const executionName = snapshot.metadata?.name;
  const executionStatus = snapshot.metadata?.status === "finished" || !snapshot.metadata?.status ? "completed" : snapshot.metadata?.status;
  const runStart = snapshot.metadata?.run_start;
  const runDuration = snapshot.metadata?.run_duration ?? 0;
  const isWorkflowType = snapshot.metadata.type_of_execution?.toLocaleLowerCase() === "workflow";

  const handleOnGraphClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(setSelectedWorkflow(snapshot));
    dispatch(setSelectedSnapshotId(snapshot?.id));
    dispatch(setSelectedSnapshot(snapshot));

    dispatch(setSelectedNodeInWorkflowId(snapshot?.id));
    if (snapshot?.metadata?.name !== selectedWorkflow?.metadata?.name) {
      dispatch(setSubgraphForward(snapshot.metadata.name));
    }
  };

  const renderSnapshotDescription = () => <>
    <div className={styles.executionMetaItem}>
      <span>#{executionId}</span>
    </div>
    <div className={styles.executionMetaItem}>
      <ClockIcon />
      {formatTimeDuration(runDuration)}
    </div>
    <div className={styles.executionMetaItem}>
      <DateFilterIcon width={14} height={14}/>
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
  </>;

  return (
    <ListCard
      isHighlighted={isHighlighted}
      onClick={handleOnClick}
      title={executionName}
      executionStatus={executionStatus}
      description={renderSnapshotDescription()}
      footer={<TagsList snapshot={snapshot} handleOnAddTagClick={handleOnAddTagClick} />}
    />
  );
};

export default ExecutionCard;
