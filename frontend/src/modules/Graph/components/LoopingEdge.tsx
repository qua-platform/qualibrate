import React from "react";
import { BaseEdge, BezierEdge, EdgeLabelRenderer, EdgeProps, MarkerType } from "@xyflow/react";
import { EdgeWithData } from "../../../stores/GraphStores/GraphCommon";
import styles from "./styles.module.scss";

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

const LoopingEdge = (props: EdgeProps<EdgeWithData>) => {
  if (props.source !== props.target) {
    return <BezierEdge {...props} />;
  }

  const { sourceX, sourceY, targetX, targetY, id, data, markerEnd, style } = props;
  const radiusX = (sourceX - targetX) * 0.6;
  const radiusY = 30;
  const edgePath = `M ${sourceX} ${sourceY} A ${radiusX} ${radiusY} 0 1 0 ${targetX} ${targetY}`;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className={styles.loopLabel}
          style={{ transform: `translate(-60%, -20%) translate(${sourceX - radiusX/2}px, ${sourceY - radiusY*2}px)` }}
        >
          {data?.loop?.condition ? "Condition" :  "Loop"}
          {data?.loop?.maxIterations &&
            <span className={styles.iterations}>
              max {data?.loop?.maxIterations}&times;
            </span>
          }
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default LoopingEdge;
