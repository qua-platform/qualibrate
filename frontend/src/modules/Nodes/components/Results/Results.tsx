import React from "react";
import { JSONEditor } from "../../../Data/components/JSONEditor";
import { useNodesContext } from "../../context/NodesContext";
import styles from "./Results.module.scss";

export const Results: React.FC<{ title?: string; jsonObject?: unknown; showSearch?: boolean }> = ({
  title,
  jsonObject,
  showSearch = true,
}) => {
  let jsonData = jsonObject;
  if (!jsonObject) {
    const { results } = useNodesContext();
    jsonData = results;
  }

  return (
    <div className={styles.wrapper} data-testid="results-wrapper">
      <JSONEditor title={title ?? "Results"} jsonDataProp={jsonData ?? {}} height={"100%"} showSearch={showSearch} />
    </div>
  );
};
