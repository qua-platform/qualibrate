import React from "react";

import Documentation from "./documentation/Documentation";
import HidePanel from "../../../../DEPRECATED_components/common/HidePanel";
import { NavigatedPanel } from "../../../../DEPRECATED_common/DEPRECATED_interfaces/NavigatedPanels";
import Parameters from "./parameters/Parameters";
import Statistics from "./statistics/Statistics";
import styles from "./NodeInfoPopup.module.scss";
import UseNavigatedPanels from "../../../../DEPRECATED_hooks/UseNavigatedPanels";
import cyKeys from "../../../../utils/cyKeys";
import { classNames } from "../../../../utils/classnames";
import { useNodeInfoContext } from "../utils/NodeInfoContext";
import Log from "./logs/Log";

const experimentInfoPanels: NavigatedPanel[] = [
  {
    nav: { name: "Parameters" },
    panel: <Parameters />,
  },
  {
    nav: { name: "Log" },
    panel: <Log />,
  },
  {
    nav: { name: "Statistics" },
    panel: <Statistics />,
  },
  {
    nav: { name: "Documentation" },
    panel: <Documentation />,
  },
];

const NodeInfoPopup = (): React.ReactElement => {
  const { selectNode, expanded } = useNodeInfoContext();

  const [Navigation, Panels] = UseNavigatedPanels(experimentInfoPanels);

  return (
    <div className={classNames(styles.experimentInfo, expanded && styles.extended)} data-cy={cyKeys.experiment.EXPERIMENT_INFO}>
      {Navigation}
      <div className={classNames(styles.panels)}>{Panels}</div>

      <HidePanel callback={() => selectNode(undefined)} />
    </div>
  );
};

export default NodeInfoPopup;
