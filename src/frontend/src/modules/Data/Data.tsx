import React from "react"; // eslint-disable-next-line css-modules/no-unused-class
import styles from "../Data/Data.module.scss";
import { DataLeftPanel, DataRightPanel } from "./index";
import { TitleBarMenu } from "../TopbarMenu";
import { RightSidePanel } from "../RightSidebar";
import { useSelector } from "react-redux";
import { getSelectedSnapshot } from "../../stores/SnapshotsStore";

const Data = () => {
  const selectedSnapshot = useSelector(getSelectedSnapshot);

  return (
    <>
      <DataLeftPanel />
      <div className={styles.titlebarWrapper}>
        <TitleBarMenu customTitle={`${selectedSnapshot?.id ?? ""} ${selectedSnapshot?.metadata?.name ?? ""}`} />
        <div className={styles.rightsidePanelWrapper}>
          <div className={styles.contentWrapper}>
            <DataRightPanel />
          </div>
          <RightSidePanel />
        </div>
      </div>
    </>
  );
};
export default Data;
