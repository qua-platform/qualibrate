import { CodeBracketsIcon } from "../../../../ui-lib/Icons/CodeBracketsIcon";
import JobMetricsTable from "./Panels/JobMetricsTable";
import JobParametersPanel from "./Panels/JobParametersPanel";
import { LongListIcon } from "../../../../ui-lib/Icons/LongListIcon";
import { NavigatedPanel } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/NavigatedPanels";
import { PlotIcon } from "../../../../ui-lib/Icons/PlotIcon";
import React from "react";
import styles from "../styles/SystemInfo.module.scss";
import UseNavigatedPanels from "../../../../DEPRECATED_hooks/UseNavigatedPanels";

const experimentInfoPanels: NavigatedPanel[] = [
  {
    nav: { name: <LongListIcon /> },
    panel: <JobMetricsTable />,
  },
  {
    nav: { name: <CodeBracketsIcon /> },
    panel: <JobParametersPanel />,
  },
  {
    nav: { name: <PlotIcon /> },
    panel: "Graph",
  },
];

const NavigationPanel = (): React.ReactElement => {
  const [Navigation, Panels] = UseNavigatedPanels(experimentInfoPanels, styles.navigation);

  return (
    <div className={styles.navigationPanel}>
      {Navigation}
      {Panels}
    </div>
  );
};

export default NavigationPanel;
