import React, { PropsWithChildren, useContext } from "react";
import { DiffApi } from "../api/diffApi";
import { JobDiffType } from "../types";
import { JobDTO } from "../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import { RequestStatus } from "../../../types";
import { setPending } from "../../../utils/statusHelpers";
import { AbstractContextWithProjectProvider, AProps } from "../../../utils/contexts/AbstractContextWithProject";
import { withActiveProjectContext } from "../../ActiveProject/ActiveProjectContext";

type JobDiffStatuses = {
  diffStatus?: RequestStatus;
};
interface JobDiffState {
  diffJobs: [JobDTO, JobDTO];
  diffObject?: JobDiffType | undefined;
}

interface JobDiffFuncs {
  loadDiff: () => void;
  setDiffJobs: (diffJobs: [JobDTO, JobDTO]) => void;
}

type IJobDiffContext = JobDiffState & JobDiffFuncs & JobDiffStatuses;

const JobDiffContext = React.createContext<IJobDiffContext | any>(null);
export const useJobDiffContext = (): IJobDiffContext => useContext<IJobDiffContext>(JobDiffContext);

type Props = PropsWithChildren<{ initJobs: [JobDTO, JobDTO] }>;
class JobDiffContextProvider extends AbstractContextWithProjectProvider<Props, JobDiffState, JobDiffStatuses, JobDiffFuncs> {
  Context = JobDiffContext;

  constructor(props: Readonly<AProps & Props>) {
    super(props);
    this.state = {
      diffJobs: props.initJobs,
    };
  }

  componentDidMount() {
    this.loadDiff();
  }

  loadDiff = async (): Promise<void> => {
    const { diffJobs } = this.state;
    this.setState({ diffStatus: setPending() });

    const { isOk, result } = await this._fetchWithStatus(
      ({ project_id }) =>
        DiffApi.diffByEUI({
          first_eui: diffJobs[0].eui.path,
          second_eui: diffJobs[1].eui.path,
          project_id,
        }),
      "diffStatus"
    );

    this.setState({ diffObject: isOk ? result : undefined });
  };
  setDiffJobs = (diffJobs: [JobDTO, JobDTO]): void => {
    this.setState({ diffJobs }, this.loadDiff);
  };

  protected funcs = {
    loadDiff: this.loadDiff,
    setDiffJobs: this.setDiffJobs,
  };

  render(): React.ReactNode {
    return <JobDiffContext.Provider value={{ ...this.state, ...this.funcs }}>{this.props.children}</JobDiffContext.Provider>;
  }
}

export default withActiveProjectContext(JobDiffContextProvider);
