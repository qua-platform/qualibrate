import React from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";
import styles from "./ConditionalEdge.module.scss";
import { EdgeWithData } from "../../../../stores/GraphStores/GraphLibrary";

export interface ConditionalEdgeProps extends EdgeProps<EdgeWithData> {
  onConditionClick?: (edge: EdgeWithData) => void;
}

const ConditionalEdge = (props: ConditionalEdgeProps) => {
  const { id, data, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          data-testid={`conditional-edge-${data?.condition?.label ?? "condition"}`}
          className={styles.conditionLabel}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {data?.condition?.label ?? "Condition"}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default React.memo(ConditionalEdge);
