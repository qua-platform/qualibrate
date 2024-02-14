// import { COMPONENTS_VISIBLE, SHOW_NOT_IMPLEMENTED } from "../dev.config";

// import { ComponentsIcon } from "../ui-lib/Icons/ComponentsIcon";
// import Dashboard from "../modules/Dashboard";
// import { DashboardIcon } from "../ui-lib/Icons/DashboardIcon";
import Data from "../modules/Data";
import { DataIcon } from "../ui-lib/Icons/DataIcon";
// import Documentation from "../modules/DocsModule/Documentation";
// import { ExperimentsIcon } from "../ui-lib/Icons/ExperimentsIcon";
// import GettingStarted from "../modules/DocsModule/GettingStarted";
// import { HelpIcon } from "../ui-lib/Icons/HelpIcon";
import { IconProps } from "../DEPRECATED_common/DEPRECATED_interfaces/IconProps";
// import JobsWorkflow from "../modules/Jobs/components/jobPage/JobsModule";
// import Notebook from "../modules/Notebook";
// import { NotebookIcon } from "../ui-lib/Icons/NotebookIcon";
import React from "react";
// import { SearchIcon } from "../ui-lib/Icons/SearchIcon";
// import SearchPage from "../modules/Search/SearchPage";
// import WelcomePage from "../modules/WelcomePage/WelcomePage";
import cyKeys from "../utils/cyKeys";
// import ExperimentPage from "../modules/Experiments/ExperimentPage";
// import { JobsIcon } from "../ui-lib/Icons/JobsIcon";

// module keys
// const COMPONENTS_KEY: ModuleKey = "components";
// const NOTEBOOK_KEY: ModuleKey = "notebook";
// export const DASHBOARD_KEY: ModuleKey = "dashboard";
const DATA_KEY: ModuleKey = "data";
// const EXPERIMENTS_KEY: ModuleKey = "experiments";
// const JOBS_KEY: ModuleKey = "jobs";
// const SEARCH_KEY = "search";
// const DOCS_KEY = "docs";
// const DOCS_GETTING_STARTED_KEY = "getting-started";
// export const ADMIN_SETTINGS_KEY = "admin-settings";

export type ModuleKey =
  | "components"
  | "notebook"
  | "dashboard"
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
  // {
  //   keyId: COMPONENTS_KEY,
  //   path: "components",
  //   Component: WelcomePage,
  //   menuItem: COMPONENTS_VISIBLE
  //     ? {
  //         title: "Components",
  //         icon: ComponentsIcon,
  //         dataCy: cyKeys.COMPONENTS_TAB,
  //       }
  //     : undefined,
  // },
  // {
  //   keyId: EXPERIMENTS_KEY,
  //   path: "experiments",
  //   Component: ExperimentPage,
  //   menuItem: {
  //     title: "Experiments",
  //     icon: ExperimentsIcon,
  //     dataCy: cyKeys.EXPERIMENTS_TAB,
  //   },
  // },
  // todo: ask Sofia about it
  // {
  //   name: "Jobs",
  //   path: "jobs",
  //   Component: JobsWorkflow,
  //   menuItem: {
  //     title: "Jobs",
  //     icon: ComponentsIcon,
  //     dataCy: cyKeys.COMPONENTS_TAB,
  //   },
  // },
  // {
  //   keyId: JOBS_KEY,
  //   path: "jobs",
  //   Component: JobsWorkflow as any, // TODO FIx this
  //   menuItem: {
  //     title: "Jobs",
  //     icon: JobsIcon,
  //     dataCy: cyKeys.JOBS_TAB,
  //   },
  // },
  // {
  //   keyId: DASHBOARD_KEY,
  //   path: "dashboard",
  //   Component: Dashboard,
  //   menuItem: {
  //     title: "Dashboard",
  //     icon: DashboardIcon,
  //     dataCy: cyKeys.DASHBOARD_TAB,
  //   },
  // },
  {
    keyId: DATA_KEY,
    path: "data",
    Component: Data,
    menuItem: {
      title: "Data",
      icon: DataIcon,
      dataCy: cyKeys.DATA_TAB,
    },
    // onClick: () => {
    //   console.log("aaaaaaaaaaaaaa");
    // },
  },
  // {
  //   keyId: NOTEBOOK_KEY,
  //   path: "Notebook",
  //   Component: Notebook,
  //   menuItem: {
  //     title: "Notebook",
  //     icon: NotebookIcon,
  //     dataCy: cyKeys.NOTEBOOK_TAB,
  //   },
  // },
  // {
  //   keyId: SEARCH_KEY,
  //   path: "search",
  //   Component: SearchPage,
  //   menuItem: SHOW_NOT_IMPLEMENTED
  //     ? {
  //         atBottom: true,
  //         title: "Search",
  //         icon: SearchIcon,
  //         dataCy: cyKeys.SEARCH_TAB,
  //       }
  //     : undefined,
  // },
  // {
  //   keyId: DOCS_KEY,
  //   path: "docs",
  //   Component: Documentation,
  //   menuItem: {
  //     atBottom: true,
  //     title: "System docs",
  //     icon: HelpIcon,
  //     dataCy: cyKeys.DOCS_TAB,
  //   },
  // },
  // {
  //   keyId: DOCS_GETTING_STARTED_KEY,
  //   path: "getting-started",
  //   Component: GettingStarted,
  // },
];

const modulesMap: { [key: string]: Module } = {};
ModulesRegistry.map((el) => {
  modulesMap[el.keyId] = el;
});

export default modulesMap;

export const bottomMenuItems = ModulesRegistry.filter((m) => m.menuItem && m.menuItem.atBottom);

export const menuItems = ModulesRegistry.filter((m) => m.menuItem && !m.menuItem.atBottom);
