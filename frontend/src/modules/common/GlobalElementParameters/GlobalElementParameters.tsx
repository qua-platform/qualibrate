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
      <div className={styles.parameterTitle} data-testid="global-element-parameter-title">
        <div
          className={styles.arrowIconWrapper}
          data-testid="global-element-parameter-arrow"
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <ArrowIcon options={{ rotationDegree: expanded ? 0 : -90 }} data-testid="global-element-parameter-arrow-icon" />
        </div>
        <div className={styles.title} data-testid="global-element-parameter-title-text">{title}</div>
      </div>
      {expanded && (
        <div className={styles.sectionWrapper} data-testid="global-element-parameter-section">
          {Object.entries(parameters ?? {}).map(([key, value]) => (
            <div key={key} className={styles.textWrapper} data-testid={`global-element-parameter-${key}`}>
              {key}:&nbsp;{value}
            </div>
          ))}
        </div>
      )}
    </>
  );
};
