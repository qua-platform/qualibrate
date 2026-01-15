import React from "react";
import { BaseEdge, BezierEdge, EdgeLabelRenderer, EdgeProps, MarkerType } from "@xyflow/react";
import styles from "./LoopingEdge.module.scss";
import { EdgeData, EdgeWithData } from "../../../../stores/GraphStores/GraphLibrary";

const edgeColor = "#70767d";
export const loopingEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 60,
    height: 8,
    color: edgeColor,
  },
  style: {
    strokeWidth: 2,
    stroke: edgeColor,
  },
};

const getLabelsFromData = (edgeData?: EdgeData) => {
  const hasCondition = Boolean(edgeData?.loop?.content);
  const hasMax = edgeData?.loop?.max_iterations !== undefined && edgeData?.loop?.max_iterations !== null;
  const label = edgeData?.loop?.label;

  const firstLabel = label ?? (hasCondition ? "condition" : undefined);
  const secondLabel = hasMax ? `max ${edgeData?.loop?.max_iterations}` : undefined;

  // case: only max_iterations (5x)
  if (!hasCondition && !label && hasMax) {
    return { firstLabel: undefined, secondLabel: `${edgeData?.loop?.max_iterations}` };
  }

  return { firstLabel, secondLabel };
};

const LoopingEdge = (props: EdgeProps<EdgeWithData>) => {
  if (props.source !== props.target) {
    return <BezierEdge {...props} />;
  }

  const { sourceX, sourceY, targetX, targetY, id, data, markerEnd, style } = props;
  const radiusX = (sourceX - targetX) * 0.6;
  const radiusY = 30;
  const edgePath = `M ${sourceX} ${sourceY} A ${radiusX} ${radiusY} 0 1 0 ${targetX} ${targetY}`;

  const { firstLabel, secondLabel } = getLabelsFromData(data);

  const leftLabel = firstLabel ? `${firstLabel}` : undefined;
  const rightLabel = secondLabel ? `${secondLabel}` : undefined;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className={styles.loopLabel}
          style={{ transform: `translate(-60%, -20%) translate(${sourceX - radiusX / 2}px, ${sourceY - radiusY * 2}px)` }}
        >
          {leftLabel}
          {leftLabel && rightLabel && <span className={styles.iterations}>{rightLabel}&times;</span>}
          {!leftLabel && rightLabel && <>{rightLabel}&times;</>}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default LoopingEdge;
