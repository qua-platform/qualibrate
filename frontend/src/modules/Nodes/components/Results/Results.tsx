import React from "react";
import { JSONEditor } from "../../../Data";
import { useNodesContext } from "../../context/NodesContext";
import styles from "./Results.module.scss";

export const Results: React.FC = () => {
  const { results } = useNodesContext();

  return (
    <div className={styles.wrapper}>
      <JSONEditor title={"Results"} jsonDataProp={results ?? {}} height={"100%"} />
    </div>
  );
};
