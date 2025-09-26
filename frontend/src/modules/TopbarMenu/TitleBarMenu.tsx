import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles/TitleBarMenu.module.scss";
import { useFlexLayoutContext } from "../../routing/flexLayout/FlexLayoutContext";
import modulesMap, { PROJECT_KEY } from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarGraphCard from "./TitleBarGraphCard/TitleBarGraphCard";

const TopBar: React.FC = () => {
  const { activeTab } = useFlexLayoutContext();

  return activeTab === PROJECT_KEY ? null : <TitleBarGraphCard />;
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
