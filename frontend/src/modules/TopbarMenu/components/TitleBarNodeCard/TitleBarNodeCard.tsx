import React from "react";
import { useSelector } from "react-redux";
/* eslint-disable css-modules/no-unused-class */
import styles from "./styles/TitleBarNodeCard.module.scss";
import { classNames } from "../../../../utils/classnames";
import Tooltip from "@mui/material/Tooltip";
import { TitleBarTooltipContent } from "./TitleBarNodeTooltipContent";
import { StatusIndicator } from "../TitleBarStatusIndicator/TitleBarStatusIndicator";
import { getStatusLabelElement } from "./TitleBarGetStatusLabelElement";
import { capitalize, formatTime, getWrapperClass } from "../../helpers";
import { DEFAULT_TOOLTIP_SX } from "../../constants";
import { NODES_KEY } from "../../../AppRoutes";
import { setActivePage } from "../../../../stores/NavigationStore";
import { useRootDispatch } from "../../../../stores";
import {
  getRunStatusNodeCurrentAction,
  getRunStatusNodeId,
  getRunStatusNodeName,
  getRunStatusNodePercentage,
  getRunStatusNodeStatus,
  getRunStatusNodeTimeRemaining
} from "../../../../stores/WebSocketStore";

const TitleBarNodeCard: React.FC = () => {
  const dispatch = useRootDispatch();
  const runStatusNodeName = useSelector(getRunStatusNodeName);
  const runStatusNodeStatus = useSelector(getRunStatusNodeStatus);
  const runStatusNodePercentage = useSelector(getRunStatusNodePercentage);
  const runStatusNodeId = useSelector(getRunStatusNodeId);
  const runStatusNodeCurrentAction = useSelector(getRunStatusNodeCurrentAction);
  const runStatusNodeTimeRemaining = useSelector(getRunStatusNodeTimeRemaining);

  const handleOnClick = () => {
    dispatch(setActivePage(NODES_KEY));
  };

  return (
    <Tooltip title={<TitleBarTooltipContent />} placement="bottom" componentsProps={{ tooltip: { sx: DEFAULT_TOOLTIP_SX } }}>
      <div onClick={handleOnClick} className={styles.hoverRegion}>
        <div className={classNames(styles.wrapper, getWrapperClass(runStatusNodeStatus ?? "", styles))}>
          <div className={styles.indicatorWrapper}>
            {StatusIndicator(
              capitalize(runStatusNodeStatus ?? "pending"),
              runStatusNodePercentage ?? 0,
              {
                Running: { width: 30, height: 30 },
                Finished: { width: 38, height: 38 },
                Error: { width: 20, height: 20 },
                Pending: { width: 26, height: 26 },
              },
              true
            )}
          </div>
          <div className={styles.textWrapper}>
            <div className={styles.topRowWrapper}>
              {runStatusNodeStatus?.toLowerCase() === "pending" ? (
                <div className={styles.noNodeRunningLabel}>No node is running</div>
              ) : (
                <div className={styles.nodeRunningLabel}>
                  {runStatusNodeId || runStatusNodeName ? "Active Node:" : "No node is running"}&nbsp;&nbsp;
                  {runStatusNodeId === -1
                    ? runStatusNodeName
                    : runStatusNodeId && runStatusNodeName
                      ? `#${runStatusNodeId} ${runStatusNodeName}`
                      : ""}
                </div>
              )}
            </div>
            <div className={styles.bottomRowWrapper}>
              {getStatusLabelElement(runStatusNodeStatus ?? undefined, runStatusNodeCurrentAction ?? undefined)}
              {runStatusNodeStatus?.toLowerCase() === "running" && runStatusNodePercentage && runStatusNodePercentage > 0 && (
                <div className={styles.timeRemainingText}>{formatTime(runStatusNodeTimeRemaining ?? 0)}&nbsp;left</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default TitleBarNodeCard;
