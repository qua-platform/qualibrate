import React from "react";
import styles from "./styles/TitleBarMenuCard.module.scss";
import CircularLoaderPercentage from "../../ui-lib/Icons/CircularLoaderPercentage";
import CheckmarkIcon from "../../ui-lib/Icons/CheckmarkIcon";
import ErrorIcon from "../../ui-lib/Icons/ErrorIcon";
import { classNames } from "../../utils/classnames";
import { LastRunStatusNodeResponseDTO } from "./TitleBarMenu";
import Tooltip from "@mui/material/Tooltip";
import TitleBarTooltipContent from "./TitleBarTooltipContent";

interface IProps {
  node: LastRunStatusNodeResponseDTO;
}

const StatusIndicator: React.FC<{ status: string; percentage: number }> = ({ status, percentage }) => {
  return (
    <>
      {status === "Running" && <CircularLoaderPercentage percentage={percentage ?? 0} />}
      {status === "Finished" && <CheckmarkIcon />}
      {status === "Error" && <ErrorIcon />}
    </>
  );
};

const TitleBarMenuCard: React.FC<IProps> = ({ node }) => {
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
    return styles.error;
  };
  
  const getStatusClass = () => {
    const status = node.status?.toLowerCase();
    if (status === "running") return styles.statusRunning;
    if (status === "finished") return styles.statusFinished;
    return styles.statusError;
  };
  
  const getStatusLabel = (): string => {
    const status = node.status?.toLowerCase();
    if (status === "running") return "Running";
    if (status === "finished") return "Finished";
    return "Error";
  };  
  
  return (
      <Tooltip
        title={<TitleBarTooltipContent node={node} />}
        arrow
        placement="bottom"
        classes={{
          tooltip: styles.customTooltip,
        }}
      >
      <div className={classNames(styles.wrapper, getWrapperClass(), styles.pointerCursor)}>
        <div className={styles.contentWrapper}>
          <div className={styles.indicatorWrapper}>
            <StatusIndicator
              status={node.status?.charAt(0).toUpperCase() + node.status?.slice(1)}
              percentage={node.percentage_complete ?? 0}
            />
          </div>

          <div className={styles.textWrapper}>
            <div className={styles.rowWrapper}>
              <div>
                {"Active Node"}:&nbsp;{node.id === -1 ? node.name : `#${node.id} ${node.name}`}
              </div>
            </div>
            <div className={styles.rowWrapper}>
              <div className={classNames(styles.statusContainer, getStatusClass())}>
                {getStatusLabel()}
              </div>
              {node.status?.toLowerCase() === "running" && <div className={styles.timeRemainingText}>{formatTime(node.time_remaining ?? 0)}</div>}
            </div>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default TitleBarMenuCard;
