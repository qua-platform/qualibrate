import React from "react";
import { MeasurementParameter, useGraphStatusContext } from "../../context/GraphStatusContext";
import styles from "../MeasurementElementParameters/MeasurementElementParameters.module.scss";
import { ArrowIcon } from "../../../../../../ui-lib/Icons/ArrowIcon";

export const MeasurementElementParameters: React.FC<{
  title: string;
  parameters: MeasurementParameter;
}> = ({ title, parameters }) => {
  const { selectedMeasurement } = useGraphStatusContext();
  const [expanded, setExpanded] = React.useState<boolean>(true);
  // useEffect(() => {
  //   if (measurementId === (selectedMeasurement?.snapshot_idx?.toString() ?? selectedMeasurement?.name?.toString())) {
  //     setExpanded(true);
  //   } else {
  //     setExpanded(false);
  //   }
  // }, [selectedMeasurement]);

  return (
    <div>
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
            <div key={key}>
              {key}:&nbsp;{value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// export const MeasurementElementParameters: React.FC<IProps> = ({
//                                                                    parametersExpanded = false,
//                                                                    show = false,
//                                                                    showTitle = true,
//                                                                    title,
//                                                                    currentItem,
//                                                                }) => {
//     // const { selectedNodeNameInWorkflow } = useSelectionContext();
//     const [expanded, setExpanded] = React.useState<boolean>(true);
//     // const [expanded, setExpanded] = React.useState<boolean>(selectedNodeNameInWorkflow === title ?? parametersExpanded);
//
//     // useEffect(() => {
//     //   if (selectedNodeNameInWorkflow === title) {
//     //     setExpanded(true);
//     //   } else {
//     //     setExpanded(false);
//     //   }
//     // }, [selectedNodeNameInWorkflow]);
//
//     return (
//         <div className={classNames(styles.parametersWrapper, !show && styles.nodeNotSelected)}>
//             {showTitle && Object.entries(currentItem?.parameters ?? {}).length > 0 && (
//                 <div className={styles.parameterTitle}>
//                     <div
//                         className={styles.arrowIconWrapper}
//                         onClick={() => {
//                             setExpanded(!expanded);
//                         }}
//                     >
//                         <ArrowIcon options={{rotationDegree: expanded ? 0 : -90}}/>
//                     </div>
//                     {title ?? "Parameters"}
//                 </div>
//             )}
//             {expanded && (
//                 <div>
//                     <div>Status: Finished</div>
//                     <div>Run start: {currentItem.]}</div>
//                 </div>
//             )}
//             {Object.entries(currentItem?.parameters ?? {}).map(([key, parameter]) => (
//                 <div key={key} className={styles.parameterValues}>
//                     <div className={styles.parameterLabel}>{key}:</div>
//                     <div className={styles.parameterValue}>{getInputElement(key, parameter, currentItem)}</div>
//                 </div>
//             ))}
//         </div>
//     );
// };
