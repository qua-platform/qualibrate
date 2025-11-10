import React, { useCallback } from "react";
/* eslint-disable css-modules/no-unused-class */
import styles from "./styles/TitleBarNodeCard.module.scss";
import { classNames } from "../../../utils/classnames";
import Tooltip from "@mui/material/Tooltip";
import { TitleBarTooltipContent } from "./TitleBarNodeTooltipContent";
import { useMainPageContext } from "../../../routing/MainPageContext";
import { StatusIndicator } from "./TitleBarStatusIndicator";
import { getStatusLabelElement } from "./TitleBarGetStatusLabelElement";
import { capitalize, formatTime, getWrapperClass } from "../helpers";
import { DEFAULT_TOOLTIP_SX } from "../constants";
import { useWebSocketData } from "../../../contexts/WebSocketContext";
import { NODES_KEY } from "../../../routing/ModulesRegistry";

const TitleBarNodeCard: React.FC = () => {
  const { setActivePage } = useMainPageContext();
  const { runStatus } = useWebSocketData();

  const handleOnClick = useCallback(() => {
    setActivePage(NODES_KEY);
  }, [setActivePage]);

  return (
    <Tooltip title={<TitleBarTooltipContent />} placement="bottom" componentsProps={{ tooltip: { sx: DEFAULT_TOOLTIP_SX } }}>
      <div onClick={handleOnClick} className={styles.hoverRegion}>
        <div className={classNames(styles.wrapper, getWrapperClass(runStatus?.node?.status ?? "", styles))}>
          <div className={styles.indicatorWrapper}>
            {StatusIndicator(
              capitalize(runStatus?.node?.status ?? "pending"),
              runStatus?.node?.percentage_complete ?? 0,
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
              {runStatus?.node?.status?.toLowerCase() === "pending" ? (
                <div className={styles.noNodeRunningLabel}>No node is running</div>
              ) : (
                <div className={styles.nodeRunningLabel}>
                  {runStatus?.node?.id || runStatus?.node?.name ? "Active Node:" : "No node is running"}&nbsp;&nbsp;
                  {runStatus?.node?.id === -1
                    ? runStatus?.node?.name
                    : runStatus?.node?.id && runStatus?.node?.name
                      ? `#${runStatus?.node?.id} ${runStatus?.node?.name}`
                      : ""}
                </div>
              )}
            </div>
            <div className={styles.bottomRowWrapper}>
              {getStatusLabelElement(runStatus?.node?.status ?? undefined, runStatus?.node?.current_action ?? undefined)}
              {runStatus?.node?.status?.toLowerCase() === "running" && runStatus?.node?.percentage_complete > 0 && (
                <div className={styles.timeRemainingText}>{formatTime(runStatus?.node?.time_remaining ?? 0)}&nbsp;left</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default TitleBarNodeCard;
