import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./TitleBarMenu.module.scss";
import { modulesMap, PROJECT_KEY } from "../AppRoutes";
import TitleBarGraphCard from "./components/TitleBarGraphCard/TitleBarGraphCard";
import { useSelector } from "react-redux";
import { BlueButton } from "../../components";
import { useRootDispatch } from "../../stores";
import { getActivePage, getIsRefreshButtonShown, refreshPage } from "../../stores/NavigationStore";

const TopBar: React.FC = () => {
  const activePage = useSelector(getActivePage);

  return activePage === PROJECT_KEY ? null : <TitleBarGraphCard />;
};

type Props = {
  customTitle?: string;
};

const TitleBarMenu: React.FC<Props> = ({ customTitle }) => {
  const dispatch = useRootDispatch();
  const activePage = useSelector(getActivePage);
  const IsRefreshButtonShown = useSelector(getIsRefreshButtonShown);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageName}>{modulesMap[activePage ?? ""]?.menuItem?.title}</h1>
      <h2>{customTitle}</h2>
      {IsRefreshButtonShown && (
        <div className={styles.refreshButtonWrapper} data-testid="refresh-button">
          <BlueButton onClick={() => dispatch(refreshPage())}>Refresh</BlueButton>
        </div>
      )}
      <div className={styles.menuCardsWrapper}>
        <TopBar />
      </div>
    </div>
  );
};

export default TitleBarMenu;
