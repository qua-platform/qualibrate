import { useContext, useEffect, useState } from "react";

import InterfaceContext from "../../../../DEPRECATED_context/InterfaceContext";
import JobDiffContextProvider from "../../context/JobDiffContext";
import WorkflowContext from "../../../Experiments/context/WorkflowContext";
import useModuleStyle from "../../../../ui-lib/hooks/useModuleStyle";
import cyKeys from "../../../../utils/cyKeys";
import JobDiffWindow from "../DiffModule";
// import JobList from "./JobList";
import JobHeader from "../jobList/JobHeader";
import { PopupTypes } from "../../../../DEPRECATED_common/DEPRECATED_enum/PopupTypes";
import { DiffVisibilityContextContainer, useDiffVisibilityContext } from "../../context/DiffVisibilityContext";
// import JobsListContext from "../../context/JobsListContext";
import { withContexts } from "../../../../ui-lib/hooks/withContexts";
import JobsSelectionContextContainer, { useJobsSelectionContext } from "../../context/JobsSelectionContext";
import { ShowFilterContextProvider, useShowFilterContext } from "./layoutContexts";
import FilterJobsPopup from "../../FilterJobsPopup";

export const DEFAULT_JOB_FILTER_TYPE = "By name";

const JobsWorkflow = () => {
  const {
    openedPopupIDs,
    actions: { getPopup },
  } = useContext(InterfaceContext);
  // const [ref, minify] = useModuleStyle();
  // @ts-ignore no-unused-variable
  const [ref, style, minify] = useModuleStyle();
  const { getWorkflows } = useContext(WorkflowContext);
  const { selectedJobs } = useJobsSelectionContext();
  const [showFilter] = useShowFilterContext();
  const [selectedFilterType, setSelectedFilterType] = useState<string>(DEFAULT_JOB_FILTER_TYPE);

  const { diffIsShown } = useDiffVisibilityContext();

  const [jobsPopups, setJobsPopups] = useState(null);

  useEffect(() => {
    setJobsPopups([getPopup(PopupTypes.DELETE_SELECTED_JOBS)] as any);
  }, [openedPopupIDs]);

  useEffect(() => {
    getWorkflows();
  }, []);

  return (
    <div data-cy={cyKeys.jobs.WRAPPER} style={{ height: "100%" }}>
      {jobsPopups}
      {showFilter && <FilterJobsPopup selectedFilterType={selectedFilterType} setSelectedFilterType={setSelectedFilterType} />}
      {diffIsShown && selectedJobs && selectedJobs.length > 1 ? (
        <JobDiffContextProvider initJobs={[selectedJobs[0], selectedJobs[1]]}>
          <JobDiffWindow />
        </JobDiffContextProvider>
      ) : (
        <>
          <JobHeader minify={minify} />
          {/*<JobList minify={minify} />*/}
        </>
      )}
    </div>
  );
};

export default withContexts(JobsWorkflow, [
  DiffVisibilityContextContainer,
  JobsSelectionContextContainer,
  // JobsListContext,
  ShowFilterContextProvider,
]);
