import React, { useContext } from "react";
import { RequestStatus } from "../../../types";
import { JobDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import { AbstractContextWithProjectProvider } from "../../../utils/contexts/AbstractContextWithProject";
import { JobApi } from "../../../DEPRECATED_common/DEPRECATED_api/job";
import { withActiveProjectContext } from "../../ActiveProject/ActiveProjectContext";
import { JobAction } from "../types";
import { JobRunRequestDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/job.add.request.dto";
import imc from "../../../interModulesCommunicator/InterModulesCommunicator";
import { toast } from "react-toastify";
import { rerunStatusKey } from "../utils/jobActionStatusHelpers";

type RequestsState = {
  [key: string]: RequestStatus;
};
// eslint-disable-next-line @typescript-eslint/ban-types
type JobActionsState = {};

interface JobActionsFuncs {
  runJob: (data: JobRunRequestDTO) => void;
  doActionOnJob: (job: JobDTO, action: JobAction) => void;
}

type Props = any;

type IJobActionsContext = JobActionsState & JobActionsFuncs & RequestsState;

const JobActionsContext = React.createContext<IJobActionsContext | any>(null);

export const useJobActionsContext = (): IJobActionsContext => useContext<IJobActionsContext>(JobActionsContext);

class JobActionsContextContainerComp extends AbstractContextWithProjectProvider<Props, JobActionsState, RequestsState, JobActionsFuncs> {
  Context = JobActionsContext;

  runJob = async (data: JobRunRequestDTO) => {
    const { isOk } = await this._fetchWithStatus(({ project_id }) => JobApi.runJob({ ...data }, 1, project_id || -1), "runStatus");
    if (isOk) {
      toast("Job was successfully added");
    } else {
      toast.error("Failed to run job");
    }

    if (isOk) {
      imc.emitJobsUpdate();
      // this.props.fetchProjectState();
    }
  };

  doActionOnJob = (job: JobDTO, action: JobAction) => {
    if (!job) return;

    switch (action) {
      case JobAction.CANCEL:
        return this._terminateJob(job.id);
      case JobAction.RERUN:
        return this._rerunJob(job.id);
    }
  };

  _rerunJob = async (id: number) => {
    const { isOk } = await this._fetchWithStatus(
      ({ project_id }) =>
        JobApi.rerunJobById({
          id,
          runtime_id: 1,
          project_id: project_id || -1,
        }),
      rerunStatusKey(id)
    );
    if (isOk) {
      toast("Job added to queue");
    } else {
      toast.error("Something went wrong.");
    }

    imc.emitJobsUpdate();
  };

  _terminateJob = async (id: number) => {
    const { isOk } = await JobApi.terminateJobById({
      id,
      body: { terminate: true },
      runtime_id: 1,
      project_id: this.props.activeProject?.id || -1,
    });

    if (isOk) {
      toast("Job was terminated");
    } else {
      toast.error("Something went wrong. Job wasn't terminated");
    }

    imc.emitJobsUpdate();
  };

  protected funcs = {
    runJob: this.runJob,
    doActionOnJob: this.doActionOnJob,
  };
}

const JobActionsContextContainer = withActiveProjectContext(JobActionsContextContainerComp);
export default JobActionsContextContainer;
