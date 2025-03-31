import React from "react";
import { JSONEditor } from "../../../Data/components/JSONEditor";
import { useNodesContext } from "../../context/NodesContext";
import styles from "./Results.module.scss";
import { ModuleKey } from "../../../../routing/ModulesRegistry";

export const Results: React.FC<{
  title?: string;
  jsonObject?: unknown;
  showSearch?: boolean;
  toggleSwitch?: boolean;
  pageName?: ModuleKey;
  style?: React.CSSProperties;
}> = ({ title, jsonObject, showSearch = true, toggleSwitch = false, pageName, style }) => {
  let jsonData = jsonObject;
  if (!jsonObject) {
    const { results } = useNodesContext();
    jsonData = results;
  }

  return (
    <div className={styles.wrapper} style={style} data-testid="results-wrapper">
      <JSONEditor
        title={title ?? "Results"}
        jsonDataProp={jsonData ?? {}}
        height={"100%"}
        showSearch={showSearch}
        toggleSwitch={toggleSwitch}
        pageName={pageName}
      />
    </div>
  );
};
