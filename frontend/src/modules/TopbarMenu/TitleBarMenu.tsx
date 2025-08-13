import React from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarGraphCard from "./TitleBarGraphCard/TitleBarGraphCard";
import { PROJECT_TAB } from "../../routing/ModulesRegistry";
import { NEW_PROJECT_BUTTON_VISIBLE } from "../../dev.config";
import CreateNewProjectIcon from "../../ui-lib/Icons/NewProjectButtonIcon";

const TitleBarMenu: React.FC = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();
  
  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents && topBarAdditionalComponents[activeTab ?? ""]}
      <div className={styles.menuCardsWrapper}>
        {activeTab === PROJECT_TAB && NEW_PROJECT_BUTTON_VISIBLE ? (
          <div className={styles.createProjectWrapper}>
            <button className={styles.createProjectButton} title="Create new project">
              <CreateNewProjectIcon />
            </button>
          </div>
        ) : (
          <TitleBarGraphCard />
        )}
      </div>
    </div>
  );
};

export default TitleBarMenu;
