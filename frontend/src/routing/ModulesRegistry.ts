import Data from "../modules/Data";
import { DataIcon } from "../ui-lib/Icons/DataIcon";
import { IconProps } from "../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
import React from "react";
import cyKeys from "../utils/cyKeys";
import Project from "../modules/Project";
import { ProjectIcon } from "../ui-lib/Icons/ProjectIcon";
const DATA_KEY: ModuleKey = "data";
const PROJECT_TAB: ModuleKey = "project";

export type ModuleKey =
  | "components"
  | "notebook"
  | "dashboard"
  | "project"
  | "data"
  | "experiments"
  | "search"
  | "jobs"
  | "docs"
  | "getting-started"
  | "admin-settings";

export type Module = {
  keyId: ModuleKey;
  path?: string;
  Component?: () => React.ReactElement;
  menuItem?: {
    atBottom?: true;
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
      title: "Project",
      // icon: ProjectIcon,
      icon: ProjectIcon,
      dataCy: cyKeys.PROJECT_TAB,
    },
  },
  {
    keyId: DATA_KEY,
    path: "data",
    Component: Data,
    menuItem: {
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

export const bottomMenuItems = ModulesRegistry.filter((m) => m.menuItem && m.menuItem.atBottom);

export const menuItems = ModulesRegistry.filter((m) => m.menuItem && !m.menuItem.atBottom);
