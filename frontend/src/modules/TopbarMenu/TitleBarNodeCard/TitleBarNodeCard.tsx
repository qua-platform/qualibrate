import React from "react";
/* eslint-disable css-modules/no-unused-class */
import styles from "./styles/TitleBarNodeCard.module.scss";
import { classNames } from "../../../utils/classnames";
import Tooltip from "@mui/material/Tooltip";
import TitleBarTooltipContent from "./TitleBarNodeTooltipContent";
import { useFlexLayoutContext } from "../../../routing/flexLayout/FlexLayoutContext";
import { StatusIndicator } from "./TitleBarStatusIndicator";
import { getStatusLabelElement } from "./TitleBarGetStatusLabelElement";
import { formatTime, getWrapperClass, capitalize } from "../helpers";
import { LastRunStatusNodeResponseDTO, DEFAULT_TOOLTIP_SX } from "../constants";

interface IProps {
  node: LastRunStatusNodeResponseDTO;
}

const TitleBarNodeCard: React.FC<IProps> = ({ node }) => {
  const { openTab } = useFlexLayoutContext();

  return (
    <Tooltip title={<TitleBarTooltipContent node={node} />} placement="bottom" componentsProps={{ tooltip: { sx: DEFAULT_TOOLTIP_SX } }}>
      <div onClick={() => openTab("nodes")} className={styles.hoverRegion}>
        <div className={classNames(styles.wrapper, getWrapperClass(node.status, styles))}>
          <div className={styles.indicatorWrapper}>
            {StatusIndicator(
              capitalize(node.status),
              node.percentage_complete ?? 0, 
              {
                Running: { width: 30, height: 30 },
                Finished: { width: 38, height: 38 },
                Error: { width: 20, height: 20 },
                Pending: { width: 26, height: 26 }
              }, 
              true
            )}
          </div>
          <div className={styles.textWrapper}>
            <div className={styles.topRowWrapper}>
              {node.status?.toLowerCase() === "pending" ? (
                <div className={styles.noNodeRunningLabel}>No node is running</div>
              ) : (
                <div className={styles.nodeRunningLabel}>
                  Active Node:&nbsp;&nbsp;{node.id === -1 ? node.name : `#${node.id} ${node.name}`}
                </div>
              )}
            </div>
            <div className={styles.bottomRowWrapper}>
              {getStatusLabelElement(node.status ?? undefined, node.current_action ?? undefined)}
              {node.status?.toLowerCase() === "running" && node.percentage_complete > 0 && (
                <div className={styles.timeRemainingText}>{formatTime(node.time_remaining ?? 0)}&nbsp;left</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default TitleBarNodeCard;
