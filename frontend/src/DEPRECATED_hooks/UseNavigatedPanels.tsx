import React, { useEffect, useState } from "react";

import NavSelect from "../DEPRECATED_components/common/NavSelect/NavSelect";
import { NavigatedPanel } from "../DEPRECATED_common/DEPRECATED_interfaces/NavigatedPanels";
import { useNodeInfoContext } from "../modules/Experiments/GraphModule/utils/NodeInfoContext";
// import { useMQTTContext } from "../modules/MQTT/MQTTContext";
import Status from "../modules/Experiments/GraphModule/nodeInfo/Status/Status";
import { NodeData } from "../modules/Experiments/types";

const statusPanel: NavigatedPanel = {
  nav: { name: "Status" },
  panel: <Status />,
};

const UseNavigatedPanels = (elements: NavigatedPanel[], className?: string, isAdminPage = false): [React.ReactElement, any] => {
  // TODO Fix this
  const [panels, setPanels] = useState<NavigatedPanel[]>(elements);
  const [activePanelIndex, setActivePanelIndex] = useState<number>(0);
  let _selectedNode: NodeData | undefined = undefined;
  if (!isAdminPage) {
    const { selectedNode } = useNodeInfoContext();
    _selectedNode = selectedNode;
  }
  // const { nodesStatus } = useMQTTContext();

  /***
   * Add status panel as a first tab
   */
  // useEffect(() => {
  //   if (!isAdminPage && nodesStatus[_selectedNode?.id || ""] && !panels.find((panel) => panel.nav.name === statusPanel.nav.name)) {
  //     setPanels([statusPanel, ...panels]);
  //   }
  // }, [nodesStatus]);

  const openPanel = (panelName: number | string) => {
    setPanels((panels) => {
      return panels.map((panel, index) => {
        if (panel.nav.name === panelName) {
          setActivePanelIndex(index);
          return {
            ...panel,
            active: true,
          };
        }

        return {
          ...panel,
          active: panel.nav.name === panelName,
        };
      });
    });
  };

  interface NavMenuPanel extends NavigatedPanel {
    active?: boolean;
    onClick: () => void;
  }

  const navMenu: NavMenuPanel[] = panels.map((panel) => ({
    ...panel,
    ...panel.nav,
    active: panel.active,
    onClick: openPanel.bind({}, panel.nav.name as string),
  }));

  const navMenuActions = navMenu[activePanelIndex].actions ?? undefined;

  return [
    <NavSelect items={navMenu} activeItemIndex={activePanelIndex} className={className} actions={[navMenuActions]} />,
    panels[activePanelIndex].panel,
  ];
};

export default UseNavigatedPanels;
