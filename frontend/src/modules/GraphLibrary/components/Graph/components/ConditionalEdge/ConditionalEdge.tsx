import React, { MouseEvent, useCallback, useState } from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";
import { EdgeWithData } from "../../../../../../stores/GraphStores/GraphCommon/GraphCommonStore";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../styles.module.scss";
import ConditionalEdgePopUp from "../ConditionalEdge/ConditionalEdgePopUp";

const ConditionalEdge = (props: EdgeProps<EdgeWithData>) => {
  const { id, source, target, data, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const [open, setOpen] = useState(false);

  const handleOnClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setOpen(true);
    },
    [setOpen]
  );

  const handleOnClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          data-testid={`conditional-edge-${data?.condition_label ?? "condition"}`}
          onClick={handleOnClick}
          className={styles.conditionLabel}
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {data?.condition_label ?? "Condition"}
        </div>
      </EdgeLabelRenderer>
      <ConditionalEdgePopUp
        id={id}
        open={open}
        onClose={handleOnClose}
        source={source}
        target={target}
        label={data?.condition_label}
        description={data?.condition_description}
      />
    </>
  );
};

export default React.memo(ConditionalEdge);
