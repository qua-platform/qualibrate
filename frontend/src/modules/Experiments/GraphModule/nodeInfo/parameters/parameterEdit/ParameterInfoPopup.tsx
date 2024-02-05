import React from "react";
import styles from "./ParameterInfoPopup.module.scss";
import { InfoIcon } from "../../../../../../ui-lib/Icons/InfoIcon";

const EXAMPLES_DATA = [
  {
    name: "Json",
    examples: [123, '"word"', '[1, 2, "word"]', '{"q": "some", "b": [1,2,"word"]}'],
  },
  { name: "Job reference", examples: ['"#/j12/qwe/qwe"'] },
  {
    name: "Parameter reference",
    examples: ['"#/p12/qwe/qwe"', '"#p12/qwe/qwe"'],
  },
];
const ParameterInfoPopup = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>You can use the following formats here:</div>
      {EXAMPLES_DATA.map(({ name, examples }) => (
        <div className={styles.row}>
          <span>{name}</span>
          <span className={styles.grey}>Example:</span>
          <span className={styles.examples}>
            {examples.map((ex) => (
              <span className={styles.label}>{ex}</span>
            ))}
          </span>
        </div>
      ))}
      <div className={styles.warningBox}>
        <InfoIcon color={"var(--warning"} />
        Only successful jobs can be referenced
      </div>
    </div>
  );
};

export default React.memo(ParameterInfoPopup);
