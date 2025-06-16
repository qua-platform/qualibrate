import React from "react";
/* eslint-disable css-modules/no-unused-class */
import styles from "./styles/TitleBarNodeCard.module.scss";
import { classNames } from "../../../utils/classnames";
import { LastRunStatusNodeResponseDTO } from "../constants";
import Tooltip from "@mui/material/Tooltip";
import TitleBarTooltipContent from "./TitleBarNodeTooltipContent";
import { useFlexLayoutContext } from "../../../routing/flexLayout/FlexLayoutContext";
import { StatusIndicator } from "../StatusIndicator";
import { formatTime, getWrapperClass } from "../helpers";

interface IProps {
  node: LastRunStatusNodeResponseDTO;
}

const TitleBarNodeCard: React.FC<IProps> = ({ node }) => {
  const { openTab } = useFlexLayoutContext();

  const getStatusLabelElement = (): React.ReactNode => {
    const status = node.status?.toLowerCase();
    if (status === "running") {
      return (
        <div className={classNames(styles.statusContainer, styles.statusRunning)}>
          Running<span className={styles.statusRunningValue}>{node.current_action ? `: ${node.current_action}` : ""}</span>
        </div>
      );
    }
    if (status === "finished") {
      return <div className={classNames(styles.statusContainer, styles.statusFinished)}>Finished</div>;
    }
    if (status === "error") {
      return <div className={classNames(styles.statusContainer, styles.statusError)}>Error</div>;
    }
    return <div className={classNames(styles.statusContainer, styles.statusPending)}>Select and Run Node</div>;
  };

  return (
    <Tooltip
      title={<TitleBarTooltipContent node={node} />}
      placement="bottom"
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: "#42424C",
            padding: "12px",
            borderRadius: "6px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            fontSize: "0.85rem",
            lineHeight: "1.3",
          },
        },
      }}
    >
      <div onClick={() => openTab("nodes")} className={styles.hoverRegion}>
        <div className={classNames(styles.wrapper, getWrapperClass(node.status, styles))}>
          <div className={styles.indicatorWrapper}>
            {StatusIndicator(
              node.status?.charAt(0).toUpperCase() + node.status?.slice(1), 
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
              {getStatusLabelElement()}
              {node.status?.toLowerCase() === "running" && (
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
