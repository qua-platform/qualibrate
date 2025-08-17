import React from "react";
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarGraphCard from "./TitleBarGraphCard/TitleBarGraphCard";
import { PROJECT_TAB } from "../../routing/ModulesRegistry";
import ProjectTitleBar from "./ProjectTitleBar";

const TopBar: React.FC = () => {
  const { activeTab } = useFlexLayoutContext();
  
  return activeTab === PROJECT_TAB ? <ProjectTitleBar /> : <TitleBarGraphCard />;
};

const TitleBarMenu: React.FC = () => {
  const { activeTab, topBarAdditionalComponents } = useFlexLayoutContext();

  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activeTab ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents && topBarAdditionalComponents[activeTab ?? ""]}
      <div className={styles.menuCardsWrapper}>
        <TopBar />
      </div>
    </div>
  );
};

export default TitleBarMenu;
