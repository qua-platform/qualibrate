import React, { MouseEvent } from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../styles.module.scss";
import { EdgeWithData } from "../../../../stores/GraphStores/GraphLibrary";

export interface ConditionalEdgeProps extends EdgeProps<EdgeWithData> {
  onConditionClick?: (edge: EdgeWithData) => void;
}

const ConditionalEdge = (props: ConditionalEdgeProps) => {
  const { id, data, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style, onConditionClick } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const handleOnClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onConditionClick?.(props as EdgeWithData);
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          data-testid={`conditional-edge-${data?.condition?.label ?? "condition"}`}
          onClick={handleOnClick}
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
