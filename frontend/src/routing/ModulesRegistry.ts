import Data from "../modules/Data";
import { DataIcon } from "../ui-lib/Icons/DataIcon";
import { IconProps } from "../common/interfaces/IconProps";
import React from "react";
import cyKeys from "../utils/cyKeys";
import Project from "../modules/Project";
import { ProjectIcon } from "../ui-lib/Icons/ProjectIcon";
import Nodes from "../modules/Nodes";
import { ExperimentsIcon } from "../ui-lib/Icons/ExperimentsIcon";
import CalibrationGraph from "../modules/GraphLibrary";
import { CalibrationIcon } from "../ui-lib/Icons/CalibrationIcon";
import GraphStatus from "../modules/GraphLibrary/components/GraphStatus/GraphStatus";

const DATA_KEY: ModuleKey = "data";
const NODES_KEY: ModuleKey = "nodes";
const PROJECT_TAB: ModuleKey = "project";
const GRAPH_LIBRARY: ModuleKey = "graph-library";
const GRAPH_STATUS: ModuleKey = "graph-status";

export type ModuleKey =
  | "components"
  | "notebook"
  | "dashboard"
  | "project"
  | "data"
  | "nodes"
  | "experiments"
  | "search"
  | "jobs"
  | "docs"
  | "getting-started"
  | "admin-settings"
  | "graph-library"
  | "graph-status"
  | "help"
  | "toggle";

export type Module = {
  keyId: ModuleKey;
  path?: string;
  Component?: () => React.ReactElement;
  menuItem?: {
    atBottom?: true;
    sideBarTitle?: string;
    title?: string;
    icon?: React.FunctionComponent<IconProps>;
    customIcon?: React.FunctionComponent<IconProps>;
    path?: string;
    dataCy?: string;
  };
  // onClick?: () => void;
};

export const ModulesRegistry: Array<Module> = [
  {
    keyId: PROJECT_TAB,
    path: "projects",
    Component: Project,
    menuItem: {
      sideBarTitle: "Project",
      title: "Project",
      // icon: ProjectIcon,
      icon: ProjectIcon,
      dataCy: cyKeys.PROJECT_TAB,
    },
  },
  {
    keyId: NODES_KEY,
    path: "nodes",
    Component: Nodes,
    menuItem: {
      sideBarTitle: "Node library",
      title: "Run calibration node",
      icon: ExperimentsIcon,
      dataCy: cyKeys.NODES_TAB,
    },
  },

  {
    keyId: GRAPH_LIBRARY,
    path: "GRAPH_LIBRARY",
    Component: CalibrationGraph,
    menuItem: {
      sideBarTitle: "Graph library",
      title: "Run calibration graph",
      icon: CalibrationIcon,
      dataCy: cyKeys.CALIBRATION_TAB,
    },
  },
  {
    keyId: GRAPH_STATUS,
    path: "graph-status",
    Component: GraphStatus,
    menuItem: {
      sideBarTitle: "Graph Status",
      title: "Graph Status",
      icon: ExperimentsIcon,
      dataCy: cyKeys.NODES_TAB,
    },
  },
  {
    keyId: DATA_KEY,
    path: "data",
    Component: Data,
    menuItem: {
      sideBarTitle: "Data",
      title: "Data",
      icon: DataIcon,
      dataCy: cyKeys.DATA_TAB,
    },
  },
];

const modulesMap: { [key: string]: Module } = {};
ModulesRegistry.map((el) => {
  modulesMap[el.keyId] = el;
});

export default modulesMap;

// export const getSelectedTabName(key: string) => {
//   return modulesMap[key] ?? null;
// };

export const bottomMenuItems = ModulesRegistry.filter((m) => m.menuItem && m.menuItem.atBottom);

export const menuItems = ModulesRegistry.filter((m) => m.menuItem && !m.menuItem.atBottom);
