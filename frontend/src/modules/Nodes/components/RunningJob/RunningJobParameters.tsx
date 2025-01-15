import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./RunningJob.module.scss";
import { useNodesContext } from "../../context/NodesContext";

export const RunningJobParameters: React.FC = () => {
  const { runningNode } = useNodesContext();
  return (
    <div className={styles.parametersWrapper}>
      {/*{Object.entries(runningNode?.parameters ?? {}).length > 0 && (*/}
      <>
        <div className={styles.parameterTitleWrapper}>Parameters</div>
        <div>
          {
            // expanded &&
            Object.entries(runningNode?.parameters ?? {}).map(([key, parameter]) => (
              <div key={key} className={styles.parameterValues}>
                <div className={styles.parameterLabel}>{parameter.title}:</div>
                <div className={styles.parameterValue}>{parameter.default?.toString()}</div>
              </div>
            ))
          }
        </div>
      </>
      {/*)}*/}
    </div>
  );
};
