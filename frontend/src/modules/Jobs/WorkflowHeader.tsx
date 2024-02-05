import React, { useCallback, useMemo } from "react";

import DEPRECATEDButton from "../../DEPRECATED_components/DEPRECATED_Buttons/ButtonWrapper";
import { ButtonTypes } from "../../DEPRECATED_common/DEPRECATED_interfaces/ButtonTypes";
import Checkbox from "../../ui-lib/components/Checkbox/Checkbox";
import JobDate from "./components/jobPage/JobInformation/JobDate";
import JobId from "./components/jobPage/JobInformation/JobId";
import { SwitchToCodeEnvironmentIcon } from "../../ui-lib/Icons/SwitchToCodeEnvironmentIcon";
import styles from "./components/jobPage/Job.module.scss";
import { GroupType } from "../../DEPRECATED_common/DEPRECATED_enum/JobsSortTypes";
import { useCheckoutContext } from "../Checkout/CheckoutContext";
import { WorkflowDTO } from "../Experiments/types";
import { useJobsListContext } from "./context/JobsListContext";
import { useJobsSelectionContext } from "./context/JobsSelectionContext";
import { classNames } from "../../utils/classnames";

const CheckoutIcon = <SwitchToCodeEnvironmentIcon />;

interface Props {
  onClickCallback?: () => void;
  workflow: WorkflowDTO;
  showInfo?: boolean;
  headerName?: React.ReactElement | string;
}

const WorkflowHeader = ({ workflow, onClickCallback, showInfo, headerName }: Props) => {
  const { checkoutWorkflow } = useCheckoutContext();

  const { selectedJobs, selectJobsByWorkflow, unselectAllJobs, isActive: isSelectionActive } = useJobsSelectionContext();

  const { list: jobs } = useJobsListContext();

  const { group } = useJobsListContext();

  const handleCheckout = useCallback(() => checkoutWorkflow(workflow), [checkoutWorkflow, workflow]);

  const selectAllJobs = () => {
    workflow?.id && selectJobsByWorkflow(workflow?.id);
  };

  const currentWorkflowJobs = jobs?.filter((job) => job.workflow_id === workflow?.id);

  const workflowDate =
    group === GroupType.BY_WORKFLOW
      ? currentWorkflowJobs?.find((j) => j.id === Math.max(...currentWorkflowJobs.map((j) => j.id)))?.submit
      : workflow?.time_created;

  const WorkflowActionButton = useMemo(() => {
    const selectedJobsFromThisWorkflow = selectedJobs?.filter((job) => job.workflow_id === workflow?.id);

    const allJobsSelected = selectedJobsFromThisWorkflow?.length === currentWorkflowJobs?.length;

    const SelectAllJobsButton = (
      <Checkbox
        checked={Boolean(selectedJobsFromThisWorkflow?.length && allJobsSelected)}
        onChange={(val) => (val ? selectAllJobs() : unselectAllJobs())}
      />
    );

    const CheckoutButton = <DEPRECATEDButton icon={CheckoutIcon} onClickCallback={handleCheckout} type={ButtonTypes.PLAIN} />;

    return isSelectionActive ? SelectAllJobsButton : CheckoutButton;
  }, [isSelectionActive, selectedJobs]);

  const handleJobExpanding = () => {
    onClickCallback && onClickCallback();
  };

  return (
    <div className={styles.jobHeader}>
      <h3 className={classNames(styles.jobName, showInfo && styles.active)} onClick={handleJobExpanding}>
        {headerName || workflow.name}
      </h3>
      {showInfo && (
        <div className={styles.workflowInfo}>
          <JobId id={workflow?.eui?.path} />
          <JobDate start={workflowDate} />
          {WorkflowActionButton}
        </div>
      )}
    </div>
  );
};

export default WorkflowHeader;
