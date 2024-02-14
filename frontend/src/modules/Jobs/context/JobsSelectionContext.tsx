import React, { useContext } from "react";
import { RequestStatus } from "../../../types";
import { JobDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import { AbstractContextWithProjectProvider } from "../../../utils/contexts/AbstractContextWithProject";
// import { JobApi } from "../../../DEPRECATED_common/DEPRECATED_api/job";
import { withActiveProjectContext } from "../../ActiveProject/ActiveProjectContext";
// import imc from "../../../interModulesCommunicator/InterModulesCommunicator";
// import { withJobsListContext, WithJobsListProps } from "./JobsListContext";
import { toast } from "react-toastify";
import Api from "../../../utils/api";
import { H5_URL } from "../../../DEPRECATED_common/modules";

// export type JobDeleteOperationType = [boolean, string];

// export type JobDeleteOperation = Record<number, JobDeleteOperationType>;

type RequestsState = {
  listStatus?: RequestStatus;
};
type JobsSelectionState = {
  selectedJobs?: JobDTO[];
  isActive: boolean;
};

interface JobsSelectionFuncs {
  selectJob: (id: number) => void;
  unselectJob: (id: number) => void;
  selectJobsByWorkflow: (id: number) => void;
  unselectAllJobs: () => void;
  // deleteSelectedJobs: (ids: number[]) => void;
  setIsActive: (val: boolean) => void;
  exportSelected: () => void;
}

// type Props = WithJobsListProps;

type IJobsSelectionContext = JobsSelectionState & JobsSelectionFuncs & RequestsState;

const JobsSelectionContext = React.createContext<IJobsSelectionContext | any>(null);

export const useJobsSelectionContext = (): IJobsSelectionContext => useContext<IJobsSelectionContext>(JobsSelectionContext);

class JobsSelectionContextContainerComp extends AbstractContextWithProjectProvider<
  any,
  JobsSelectionState,
  RequestsState,
  JobsSelectionFuncs
> {
  Context = JobsSelectionContext;
  state: JobsSelectionState = {
    isActive: false,
  };

  selectJob = (id: number) => {
    const { selectedJobs } = this.state;
    const selectedJob = this.props.list?.find((x: any) => x.id === id);
    const alreadyExist = selectedJobs?.find((x) => x.id === id);

    if (!selectedJob || alreadyExist) {
      return;
    }

    this.setState({ selectedJobs: [...(selectedJobs || []), selectedJob] });
  };

  exportSelected = () => {
    const { selectedJobs } = this.state;
    selectedJobs?.forEach(async (job) => {
      const exportURL = `${H5_URL}/files/export?${new URLSearchParams({
        eui_path: job.eui.path,
      })}`;
      const { isOk } = await Api.downloadFile(exportURL, job.eui.path);
      if (!isOk) {
        toast.error(`Failed to export ${job.eui.path}`);
      }
    });
  };

  setIsActive = (isActive: boolean) => {
    this.setState({ isActive });
  };

  selectJobsByWorkflow = (id: number) => {
    const selectedJobs = this.props.list?.filter((x: any) => x.workflow_id === id);

    if (!selectedJobs) {
      return;
    }

    this.setState({ selectedJobs });
  };

  unselectJob = (id: number) => {
    const { selectedJobs } = this.state;
    this.setState({
      selectedJobs: selectedJobs?.filter((job) => job.id !== id) || [],
    });
  };

  unselectAllJobs = () => {
    this.setState({
      selectedJobs: [],
    });
  };

  // deleteSelectedJobs = async () => {
  //   const ids = this.state.selectedJobs?.map((j) => j.id);
  //
  //   if (!ids) {
  //     return;
  //   }
  //
  //   const { result, error }: any = await JobApi.deleteJobsByIds(ids);
  //
  //   if (error) {
  //     toast.error(error);
  //     return;
  //   }
  //
  //   const deletedJobs = Object.entries(result)
  //     .filter(([, record]) => (record as any)[0])
  //     .map(([id]) => +id);
  //
  //   toast(`${deletedJobs.length} /${this.state.selectedJobs?.length} jobs were deleted`);
  //
  //   this.unselectAllJobs();
  //   imc.emitJobsUpdate();
  //   this.setIsActive(false);
  // };

  protected funcs = {
    selectJob: this.selectJob,
    unselectJob: this.unselectJob,
    selectJobsByWorkflow: this.selectJobsByWorkflow,
    unselectAllJobs: this.unselectAllJobs,
    // deleteSelectedJobs: this.deleteSelectedJobs,
    setIsActive: this.setIsActive,
    exportSelected: this.exportSelected,
  };
}

const JobsSelectionContextContainer = withActiveProjectContext(JobsSelectionContextContainerComp);
// const JobsSelectionContextContainer = withActiveProjectContext(withJobsListContext(JobsSelectionContextContainerComp));
export default JobsSelectionContextContainer;
