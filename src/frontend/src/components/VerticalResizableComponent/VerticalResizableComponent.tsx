import React, { useCallback } from "react";
import styles from "./VerticalResizableComponent.module.scss";
import { classNames } from "../../utils/classnames";
import { formatNames } from "../../utils/formatNames";
import { ParameterStructure } from "../../stores/SnapshotsStore/api/SnapshotsApi";
import SnapshotComments from "./SnapshotComments";

type Props = {
  tabNames?: string[];
  tabData?: {
    [key: string]: ParameterStructure;
  };
  hasCommentSection?: boolean;
};

const VerticalResizableComponent: React.FC<Props> = ({ tabNames = ["Metadata", "Parameters"], tabData, hasCommentSection = true }) => {
  const [expanded, setExpanded] = React.useState(true);
  const [activeTabName, setActiveTabName] = React.useState<string>(tabNames[0]);
  const handleOnToggleSidebar = () => {
    setExpanded(!expanded);
  };
  const handleOnSwitchTab = useCallback((tabName: string) => {
    setActiveTabName(tabName);
  }, []);
  const detailsObject = tabData ? tabData[activeTabName.toLowerCase()] : {};
  const showComments = hasCommentSection && activeTabName.toLowerCase() === "metadata";

  return (
    <div data-testid="vertical-component" className={classNames(styles.contentSidebar, !expanded && styles.collapsed)} id="contentSidebar">
      <button className={styles.sidebarToggleArrow} id="sidebarToggle" onClick={handleOnToggleSidebar}>
        {expanded ? "◀" : "▶"}
      </button>

      <div className={styles.displayCard}>
        <div className={styles.displayCardTabs}>
          {tabNames.map((tabName) => (
            <div
              key={tabName}
              className={classNames(styles.displayCardTab, activeTabName === tabName && styles.active)}
              onClick={() => handleOnSwitchTab(tabName)}
              id={`tab${tabName}`}
            >
              {tabName}
            </div>
          ))}
        </div>

        <div className={styles.displayCardContent}>
          <div className={styles.displayCardPanelBody}>
            {detailsObject &&
              Object.keys(detailsObject).map((keyValue) => {
                const detailValue = detailsObject[keyValue];

                return (
                  <div key={keyValue} className={classNames(styles.displayCardPanel, styles.active)} id={`panel${activeTabName}`}>
                    <div className={styles.displayParam}>
                      <div className={styles.displayParamLabel}>{formatNames(keyValue)}</div>
                      <div className={styles.displayParamValue}>
                        {detailValue === null || detailValue === undefined
                          ? "—"
                          : typeof detailValue === "object"
                            ? JSON.stringify(detailValue, null, 2)
                            : detailValue}
                      </div>
                    </div>
                  </div>
                );
              })}

            {showComments && <SnapshotComments />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalResizableComponent;
