import * as FlexLayout from "flexlayout-react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../../ui-lib/layouts/styles/Layout.module.scss";
import modulesMap from "../ModulesRegistry";

export const flexLayoutFactory = (node: FlexLayout.TabNode) => {
  const module = modulesMap[node.getName()];
  if (!module || !module.Component) {
    return <div>Module not found</div>;
  }
  return module.Component();
};

export const flexClassNameMapper = (defaultClassName: string): string => {
  console.log("defaultClassName", defaultClassName);
  switch (defaultClassName) {
    case "flexlayout__layout":
      return styles.layout;
    case "flexlayout__tabset_tabbar_outer":
      return `${styles.header} ${defaultClassName}`;
    case "flexlayout__tabset_tabbar_inner_tab_container":
      return `${styles.header_panel} ${defaultClassName}`;
    case "flexlayout__tab_button":
      return `${styles.header_panel_widget} ${defaultClassName}`;
    case "flexlayout__tab_button--selected":
      return `${styles.header_panel_widget_selected}`;
    case "flexlayout__tabset_sizer":
      return `${styles._tabset_header_sizer}`;
    default:
      return defaultClassName;
  }
};
