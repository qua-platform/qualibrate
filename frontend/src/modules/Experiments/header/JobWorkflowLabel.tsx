import React, { useRef, useState } from "react";
import SingleDotIcon from "../../../ui-lib/Icons/SingleDotIcon";
import { useActiveProjectContext } from "../../ActiveProject/ActiveProjectContext";
import styles from "./JobWorkflowLabel.module.scss";
import { ParameterIcon } from "../../../ui-lib/Icons/ParameterIcon";
import { WorkflowCircleIcon } from "../../../ui-lib/Icons/WorkflowCircleIcon";
import { DriverIcon } from "../../../ui-lib/Icons/DriverIcon";
import { GREY_FONT } from "../../../utils/colors";
import useOnClickOutside from "../../../ui-lib/hooks/useOnClickOutside";
import { classNames } from "../../../utils/classnames";
import useJobData from "../../../utils/api/useJobData";
import { getStyleByStatus } from "../../../DEPRECATED_components/Status/JobStatus";
const JobWorkflowLabel: React.FC = () => {
  const { projectUserState } = useActiveProjectContext();
  const labelRef = useRef<HTMLDivElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const jobData = useJobData(projectUserState?.job);
  useOnClickOutside(labelRef, () => setShowPopup(false));

  const activeExperimentStateKey: string = projectUserState?.job_eui || projectUserState?.workflow_eui || "-";

  return (
    <div className={styles.wrapper} ref={labelRef}>
      <button className={classNames(styles.label)} onClick={() => setShowPopup((p) => !p)}>
        <SingleDotIcon color={getStyleByStatus("" + jobData?.current_status).color} />
        <span>{activeExperimentStateKey}</span>
      </button>
      {showPopup && (
        <div className={styles.popup}>
          <span className={styles.tableLabel}>
            <WorkflowCircleIcon color={GREY_FONT} />
            <span>Workflow</span>
          </span>
          <span>{projectUserState?.workflow_eui || "-"}</span>
          <span className={styles.tableLabel}>
            <DriverIcon color={GREY_FONT} />
            <span>Runtime</span>
          </span>
          <span>1</span>
          <span className={styles.tableLabel}>
            <ParameterIcon color={GREY_FONT} />
            <span>Parameters</span>
          </span>
          <span>{projectUserState?.parameters_eui || "-"}</span>
        </div>
      )}
    </div>
  );
};

export default JobWorkflowLabel;
