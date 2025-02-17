import styles from "./MeasurementElementInfoSection.module.scss";
import { classNames } from "../../../../../../utils/classnames";

interface MeasurementElementStatusInfoAndParametersProps {
  title?: string;
  data: Record<string, string | number | string[]>;
  filterEmpty?: boolean;
  className: string;
  evenlySpaced?: boolean;
}

/**
 * Reusable Component for Run Info and Parameters Sections.
 */
export const MeasurementElementStatusInfoAndParameters: React.FC<MeasurementElementStatusInfoAndParametersProps> = ({ 
  title, data, filterEmpty = false, className, evenlySpaced = false 
}) => {
  const filteredData = filterEmpty
    ? Object.entries(data).filter(([, value]) => value != null && value !== "")
    : Object.entries(data);

  if (filteredData.length === 0) return null;

  return (
    <div className={className}>
      {title && <div className={styles.sectionTitle}>{title}</div>}
      {/* allowing the runInfo section to evenly space its rows while keeping the parameters section with a normal layout */}
      <div className={styles.infoContent} style={evenlySpaced ? { height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-evenly" } : {}}>
        {filteredData.map(([key, value]) => (
          <div className={styles.infoItem} key={key}>
            <div className={styles.label}>{key}:</div>
            <div className={styles.value}>
              {Array.isArray(value) ? value.join(", ") : value?.toString() || "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


interface MeasurementElementOutcomesProps {
    outcomes: Record<string, string>;
  }
  
/**
 * Reusable Component for Outcomes Section.
 */
export const MeasurementElementOutcomes: React.FC<MeasurementElementOutcomesProps> = ({ outcomes }) => {
    return (
      <div className={styles.outcomes}>
        <h4>Outcomes</h4>
        <div className={styles.outcomeContainer}>
          {Object.entries(outcomes).map(([qubit, result]) => {
            const isSuccess = result === "successful";
            return (
              <span
                key={qubit}
                className={classNames(styles.outcomeBubble, isSuccess ? styles.success : styles.failure)}
              >
                <span className={classNames(styles.qubitLabel, isSuccess ? styles.success : styles.failure)}>
                  {qubit || "N/A"}
                </span>
                <span className={styles.outcomeStatus}>{result}</span>
              </span>
            );
          })}
        </div>
      </div>
    );
};
  



// actual DOM structure of MeasurementElement html 
{/*
...
<div>clasName={styles.rowWrapper}
    div>className={styles.row}
        <div>className={styles.dot}</div>
        <div>className={styles.titleOrName}</div>
        <div>className={styles.description}</div> <--- Included but not used at the moment 
    </div>
    <div>className={styles.expandedContent}
----------------------------------------------
        <div className={styles.runInfoAndParameters}>
            <div className={styles.runInfo}>
                <div>className={styles.infoContent}
                    <div>className={styles.infoItem}
                        <div className={styles.Label}>{key}:</div>   
                        <div className={styles.Value}></div>
                    </div>
                    <div>className={styles.infoItem}
                        <div className={styles.Label}>{key}:</div>   
                        <div className={styles.Value}></div>
                    </div>
                    <div>className={styles.infoItem}
                        <div className={styles.Label}>{key}:</div>   
                        <div className={styles.Value}></div>
                    </div>
                </div>
            </div>
            <div className={syles.parameters}>
                div>sectionTitle</div>
                <div>className={styles.infoContent}
                    <div>className={styles.infoItem}
                        <div className={styles.Label}>{key}:</div>   
                        <div className={styles.Value}></div>
                    </div>
                    <div>className={styles.infoItem}
                        <div className={styles.Label}>{key}:</div>   
                        <div className={styles.Value}></div>
                    </div>
                    <div>className={styles.infoItem}
                        <div className={styles.Label}>{key}:</div>   
                        <div className={styles.Value}></div>
                    </div>
                </div>
            </div>
        </div>
---------------------------------------------- 
        <div className={outcomes}>
            <div>Outcomes</div>
            **Can be zero to multiple outcomes of failure or success for outcomeStatuses**
            <div>className={outcomeContainer}
                <span>className={outcomeBubble}
                    <span>className={qubitLabel}</span>
                    <span>className={outcomeStatus}</span>
                </span>
                <span>className={outcomeBubble}
                    <span>className={qubitLabel}</span>
                    <span>className={outcomeStatus}</span>
                </span>
            </div>
        </div>
----------------------------------------------
    </div>
</div>
*/}
