import React, { useState } from "react";

import { BurgerMenuIcon } from "../../ui-lib/Icons/BurgerMenuIcon";
import ExperimentsList from "./components/JobsList";
import { DataViewContextProvider, useDataViewContext } from "./context/DataViewContext";
import HDF5Explorer from "./HDF5Explorer";
import styles from "./Data.module.scss";
import { ACCENT_COLOR_LIGHT, SECONDARY_BLUE_BUTTON } from "../../utils/colors";
import cyKeys from "../../utils/cyKeys";
import useModuleStyle from "../../ui-lib/hooks/useModuleStyle";
import { classNames } from "../../utils/classnames";
import PageHeader from "../../ui-lib/components/headers/PageHeader/PageHeader";
import DropdownSelect from "../../ui-lib/components/Button/DropdownSelect";
import { DATA_VIS_VIEWS, DataVizView } from "./consts";
import PlotlyDash from "./plotlyDash";
import DataView from "./DataView";

// const menuAction = <DropDownButton label="View with HDF5 Explorer" />;
const Data = () => {
  const { selectedJob, selectedView, changeView } = useDataViewContext();
  const [showJobsList, setShowJobsList] = useState<boolean>(!selectedJob);
  const [ref] = useModuleStyle<HTMLDivElement>();

  return (
    <div ref={ref} className={styles.wrapper}>
      <PageHeader
        preComponent={
          <button onClick={() => setShowJobsList((s) => !s)}>
            <BurgerMenuIcon color={showJobsList ? SECONDARY_BLUE_BUTTON : ACCENT_COLOR_LIGHT} data-cy={cyKeys.data.MENU_BUTTON} />
          </button>
        }
        title="Job results"
        subTitle={selectedJob?.eui?.path || "Select the job"}
      >
        <DropdownSelect
          list={DATA_VIS_VIEWS}
          onChange={({ key }) => changeView(key as DataVizView)}
          selected={DATA_VIS_VIEWS.find((v) => v.key === selectedView)}
        />
      </PageHeader>
      <div className={classNames(styles.explorer)}>
        {showJobsList && (
          <div className={classNames(styles.data)}>
            <ExperimentsList />
          </div>
        )}
        <div className={styles.viewer}>
          <DataVizContent />
        </div>
      </div>
    </div>
  );
};

function DataVizContent() {
  const { selectedView } = useDataViewContext();
  switch (selectedView) {
    case DataVizView.HDF5:
      return <HDF5Explorer />;
    case DataVizView.Dash:
      return <PlotlyDash />;
    case DataVizView.Data:
      return <DataView />;
    default:
      return <div>No view found</div>;
  }
}

export default () => (
  <DataViewContextProvider>
    <Data />
  </DataViewContextProvider>
);
