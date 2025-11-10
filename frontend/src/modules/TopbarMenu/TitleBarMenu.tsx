import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles/TitleBarMenu.module.scss";
import { useMainPageContext } from "../../routing/MainPageContext";
import modulesMap, { PROJECT_KEY } from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarGraphCard from "./TitleBarGraphCard/TitleBarGraphCard";

const TopBar: React.FC = () => {
  const { activePage } = useMainPageContext();

  return activePage === PROJECT_KEY ? null : <TitleBarGraphCard />;
};

const TitleBarMenu: React.FC = () => {
  const { activePage, topBarAdditionalComponents } = useMainPageContext();

  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activePage ?? ""]?.menuItem?.title ?? ""}</PageName>
      {topBarAdditionalComponents && topBarAdditionalComponents[activePage ?? ""]}
      <div className={styles.menuCardsWrapper}>
        <TopBar />
      </div>
    </div>
  );
};

export default TitleBarMenu;
