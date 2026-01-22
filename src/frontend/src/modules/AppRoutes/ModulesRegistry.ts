import { DataIcon, IconProps, ProjectIcon, NodeLibraryIcon, GraphLibraryIcon, GraphStatusIcon, HelpIcon } from "../../components";
import React from "react";
import cyKeys from "../../utils/cyKeys";
import { Project } from "../Project";
import { Nodes } from "../Nodes";
import { GraphLibrary } from "../GraphLibrary";
import { GraphStatus } from "../GraphStatus";
import { Data } from "../Data";

export const DATA_KEY: ModuleKey = "data";
export const NODES_KEY: ModuleKey = "nodes";
export const PROJECT_KEY: ModuleKey = "project";
export const GRAPH_LIBRARY_KEY: ModuleKey = "graph-library";
export const GRAPH_STATUS_KEY: ModuleKey = "graph-status";
export const HELP_KEY: ModuleKey = "help";
export const TOGGLE_SIDEBAR_KEY: ModuleKey = "toggle";

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

const ModulesRegistry: Array<Module> = [
  {
    keyId: NODES_KEY,
    path: "nodes",
    Component: Nodes,
    menuItem: {
      sideBarTitle: "Node Library",
      title: "Run calibration node",
      icon: NodeLibraryIcon,
      dataCy: cyKeys.NODES_TAB,
    },
  },
  {
    keyId: GRAPH_LIBRARY_KEY,
    path: "GRAPH_LIBRARY",
    Component: GraphLibrary,
    menuItem: {
      sideBarTitle: "Graph Library",
      title: "Run calibration graph",
      icon: GraphLibraryIcon,
      dataCy: cyKeys.CALIBRATION_TAB,
    },
  },
  {
    keyId: GRAPH_STATUS_KEY,
    path: "graph-status",
    Component: GraphStatus,
    menuItem: {
      sideBarTitle: "Graph Status",
      title: "Graph Status",
      icon: GraphStatusIcon,
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
  {
    keyId: PROJECT_KEY,
    path: "projects",
    Component: Project,
    menuItem: {
      sideBarTitle: "Projects",
      title: "Projects",
      icon: ProjectIcon,
      dataCy: cyKeys.PROJECT_TAB,
      atBottom: true,
    },
  },
  {
    keyId: HELP_KEY,
    path: "help",
    Component: Data,
    menuItem: {
      sideBarTitle: "Help",
      icon: HelpIcon,
      title: "Help",
      dataCy: cyKeys.HELP_TAB,
      atBottom: true,
    },
  },
  {
    keyId: TOGGLE_SIDEBAR_KEY,
    path: "toggle",
    Component: Data,
    menuItem: {
      dataCy: cyKeys.TOGGLE_SIDEBAR,
      atBottom: true,
    },
  },
];

const modulesMap: { [key: string]: Module } = {};
ModulesRegistry.map((el) => {
  modulesMap[el.keyId] = el;
});

export default modulesMap;
export const bottomMenuItems = ModulesRegistry.filter((m) => m.menuItem && m.menuItem.atBottom);
export const menuItems = ModulesRegistry.filter((m) => m.menuItem && !m.menuItem.atBottom);
