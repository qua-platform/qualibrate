import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./styles/TitleBarMenu.module.scss";
import modulesMap, { PROJECT_KEY } from "../../routing/ModulesRegistry";
import PageName from "../../common/ui-components/common/Page/PageName";
import TitleBarGraphCard from "./TitleBarGraphCard/TitleBarGraphCard";
import { useSelector } from "react-redux";
import { getActivePage, getIsRefreshButtonShown } from "../../stores/NavigationStore/selectors";
import BlueButton from "../../ui-lib/components/Button/BlueButton";
import { useRootDispatch } from "../../stores";
import { refreshPage } from "../../stores/NavigationStore/actions";

const TopBar: React.FC = () => {
  const activePage = useSelector(getActivePage);

  return activePage === PROJECT_KEY ? null : <TitleBarGraphCard />;
};

const TitleBarMenu: React.FC = () => {
  const dispatch = useRootDispatch();
  const activePage = useSelector(getActivePage);
  const IsRefreshButtonShown = useSelector(getIsRefreshButtonShown);

  return (
    <div className={styles.wrapper}>
      <PageName>{modulesMap[activePage ?? ""]?.menuItem?.title ?? ""}</PageName>
      {IsRefreshButtonShown && <div className={styles.refreshButtonWrapper} data-testid="refresh-button">
        <BlueButton onClick={() => dispatch(refreshPage())}>Refresh</BlueButton>
      </div>}
      <div className={styles.menuCardsWrapper}>
        <TopBar />
      </div>
    </div>
  );
};

export default TitleBarMenu;
