import React from "react";
import styles from "./styles/TitleBarMenuCard.module.scss";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";
import CheckmarkIcon from "../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../ui-lib/Icons/ErrorIcon";
import { classNames } from "../../utils/classnames";
import { LastRunStatusNodeResponseDTO } from "./TitleBarMenu";
import Tooltip from "@mui/material/Tooltip";
import TitleBarTooltipContent from "./TitleBarTooltipContent";
import NoNodeRunningIcon from "../../ui-lib/Icons/NoNodeRunningIcon";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";

interface IProps {
  node: LastRunStatusNodeResponseDTO;
}

const StatusIndicator: React.FC<{ status: string; percentage: number }> = ({ status, percentage }) => {
  return (
    <>
      {status === "Running" && <CircularLoaderPercentage percentage={percentage ?? 0} width={30} height={30} />}
      {status === "Finished" && <CheckmarkIcon />}
      {status === "Error" && <ErrorIcon width={20} height={20} />}
      {status === "Pending" && <NoNodeRunningIcon width={26} height={26} />}
    </>
  );
};

const TitleBarMenuCard: React.FC<IProps> = ({ node }) => {
  const { openTab } = useFlexLayoutContext();
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor(((sec % 3600) % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s left`;
  };

  const getWrapperClass = () => {
    const status = node.status?.toLowerCase();
    if (status === "running") return styles.running;
    if (status === "finished") return styles.finished;
    if (status === "error") return styles.error;
    return styles.pending;
  };

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
      <div onClick={() => openTab("nodes")} className={classNames(styles.wrapper, getWrapperClass(), styles.pointerCursor)}>
        <div className={styles.contentWrapper}>
          <div className={styles.indicatorWrapper}>
            <StatusIndicator
              status={node.status?.charAt(0).toUpperCase() + node.status?.slice(1)}
              percentage={node.percentage_complete ?? 0}
            />
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
              {node.status?.toLowerCase() === "running" && node.percentage_complete > 0 && (
                <div className={styles.timeRemainingText}>{formatTime(node.time_remaining ?? 0)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default TitleBarMenuCard;
