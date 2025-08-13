import React, { useState } from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarGraphCard from "./TitleBarGraphCard/TitleBarGraphCard";
import { PROJECT_TAB } from "../../routing/ModulesRegistry";
import { NEW_PROJECT_BUTTON_VISIBLE } from "../../dev.config";
import CreateNewProjectIcon from "../../ui-lib/Icons/NewProjectButtonIcon";
import CreateNewProjectForm from "../Project/CreateNewProjectForm/CreateNewProjectForm";

const TitleBarMenu: React.FC = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents && topBarAdditionalComponents[activeTab ?? ""]}
      <div className={styles.menuCardsWrapper}>
        {activeTab === PROJECT_TAB && NEW_PROJECT_BUTTON_VISIBLE ? (
          <div className={styles.createProjectWrapper}>
            <button title="Create new project" onClick={() => setShowCreatePanel(prev => !prev)} className={styles.createProjectButton} >
              <CreateNewProjectIcon />
            </button>
            {showCreatePanel && (
              <div className={styles.createProjectPanelWrapper}>
                <CreateNewProjectForm onCancel={() => setShowCreatePanel(false)} />
              </div>
            )}
          </div>
        ) : (
          <TitleBarGraphCard />
        )}
      </div>
    </div>
  );
};

export default TitleBarMenu;
