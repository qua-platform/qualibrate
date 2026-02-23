import React, { useCallback, useMemo, useRef, useState } from "react";
import styles from "./ResizableTabSidebar.module.scss";
import { classNames } from "../../utils/classnames";

type Props = {
  tabs: Array<{
    title: string;
    render: React.ReactNode;
  }>;
  startWidth?: number;
};

const minWidth = 240;
const maxWidth = 600;

const ResizableTabSidebar: React.FC<Props> = ({ tabs, startWidth = 280 }) => {
  const [expanded, setExpanded] = useState(true);
  const [width, setWidth] = useState(startWidth);
  const [activeTabName, setActiveTabName] = useState<string>(tabs[0].title);
  const [isResizing, setIsResizing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleOnToggleSidebar = () => setExpanded(!expanded);
  const handleOnSwitchTab = useCallback((tabName: string) => setActiveTabName(tabName), []);

  const handleStartResising = () => {
    const handleResise = (evt: MouseEvent) => {
      if (!ref.current) return;

      const diff = evt.clientX - ref.current.getBoundingClientRect().left;
      const newWidth = Math.max(minWidth, Math.min(diff, maxWidth));
      setWidth(newWidth);
    };

    const handleStopResising = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleResise);
      window.removeEventListener("mouseup", handleStopResising);
    };

    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleResise);
    window.addEventListener("mouseup", handleStopResising);
  };

  const currentTab = useMemo(() => tabs.find((tab) => tab.title === activeTabName)?.render || <></>, [tabs, activeTabName]);

  return (
    <>
      <div
        data-testid="vertical-component"
        className={classNames(styles.contentSidebar, !expanded && styles.collapsed, isResizing && styles.resizing)}
        style={{ width }}
        ref={ref}
        id="contentSidebar"
      >
        <button className={styles.sidebarToggleArrow} id="sidebarToggle" onClick={handleOnToggleSidebar}>
          {expanded ? "◀" : "▶"}
        </button>

        <div className={styles.displayCard}>
          <div className={styles.displayCardTabs}>
            {tabs.map((tab) => (
              <div
                key={tab.title}
                className={classNames(styles.displayCardTab, activeTabName === tab.title && styles.active)}
                onClick={() => handleOnSwitchTab(tab.title)}
                id={`tab${tab.title}`}
              >
                {tab.title}
              </div>
            ))}
          </div>

          <div className={styles.displayCardContent} id={`panel${activeTabName}`}>
            {currentTab}
          </div>
        </div>
      </div>
      <div className={styles.resizeHandler} onMouseDown={handleStartResising} />
    </>
  );
};

export default ResizableTabSidebar;
