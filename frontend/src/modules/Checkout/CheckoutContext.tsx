import React, { useContext } from "react";
import { JobDTO } from "../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import { RequestStatus } from "../../types";
import { WorkflowDTO } from "../Experiments/types";
import { AbstractContextWithProjectProvider } from "../../utils/contexts/AbstractContextWithProject";
import { withActiveProjectContext } from "../ActiveProject/ActiveProjectContext";
import { CheckoutApi } from "./CheckoutApi";
import { toast } from "react-toastify";

type RequestsState = {
  checkoutStatus?: RequestStatus;
  checkoutWorkflowStatus?: RequestStatus;
};
type CheckoutState = {
  //
};

interface CheckoutFuncs {
  checkoutJob: (job: JobDTO) => void;
  checkoutWorkflow: (workflow: WorkflowDTO) => void;
}

type ICheckoutContext = CheckoutState & CheckoutFuncs & RequestsState;

const CheckoutContext = React.createContext<ICheckoutContext | any>(null);
export const useCheckoutContext = (): ICheckoutContext => useContext<ICheckoutContext>(CheckoutContext);

class CheckoutContextProvider extends AbstractContextWithProjectProvider<any, CheckoutState, RequestsState, CheckoutFuncs> {
  Context = CheckoutContext;

  _refreshProject = (isOk?: boolean) => {
    // _refreshProject = (isOk: boolean) => {
    // const { fetchProjectState } = this.props;
    // if (isOk) {
    //   fetchProjectState();
    // }
  };
  checkoutJob = async (job: JobDTO) => {
    const { isOk } = await this._fetchWithStatus(
      ({ project_id }) => CheckoutApi.checkoutJob(job.id, job.runtime_id, project_id),
      "checkoutStatus"
    );

    toast(isOk ? `Checkout to job ${job.eui.path}` : `Failed to checkout ${job.eui.path}`);

    this._refreshProject(isOk);
  };

  checkoutWorkflow = async (workflow: WorkflowDTO): Promise<void> => {
    const { isOk } = await this._fetchWithStatus(
      ({ project_id }) => CheckoutApi.checkoutWorkflow(workflow.id, project_id),
      "checkoutWorkflowStatus"
    );

    this._refreshProject(isOk);
  };

  protected funcs = {
    checkoutJob: this.checkoutJob,
    checkoutWorkflow: this.checkoutWorkflow,
  };
}

export default withActiveProjectContext(CheckoutContextProvider);
