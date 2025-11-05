import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles/TitleBarMenu.module.scss";
import modulesMap, { PROJECT_KEY } from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarGraphCard from "./TitleBarGraphCard/TitleBarGraphCard";
import { useSelector } from "react-redux";
import { getActivePage, getTopBarAdditionalComponents } from "../../stores/NavigationStore/selectors";

const TopBar: React.FC = () => {
  const activePage = useSelector(getActivePage);

  return activePage === PROJECT_KEY ? null : <TitleBarGraphCard />;
};

const TitleBarMenu: React.FC = () => {
  const activePage = useSelector(getActivePage);
  const topBarAdditionalComponents = useSelector(getTopBarAdditionalComponents);

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
