import React from "react";
import styles from "../GlobalElementParameters/GlobalElementParameters.module.scss";
import { ArrowIcon } from "../../../ui-lib/Icons/ArrowIcon";
import { GlobalParameterStructure } from "../../GraphLibrary/components/GraphStatus/context/GraphStatusContext";

export const GlobalElementParameters: React.FC<{
  title: string;
  parameters: GlobalParameterStructure;
}> = ({ title, parameters }) => {
  const [expanded, setExpanded] = React.useState<boolean>(true);

  return (
    <>
      <div className={styles.parameterTitle}>
        <div
          className={styles.arrowIconWrapper}
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <ArrowIcon options={{ rotationDegree: expanded ? 0 : -90 }} />
        </div>
        <div className={styles.title}>{title}</div>
      </div>
      {expanded && (
        <div className={styles.sectionWrapper}>
          {Object.entries(parameters ?? {}).map(([key, value]) => (
            <div key={key} className={styles.textWrapper}>
              {key}:&nbsp;{value}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
