import Api from "../../utils/api";
import { PRes, Res } from "../../DEPRECATED_common/DEPRECATED_interfaces/Api";
import { RequestEntry } from "../../utils/api/types";
import { API_METHODS } from "../../DEPRECATED_common/DEPRECATED_enum/Api";
import { JobDTO } from "../../DEPRECATED_common/DEPRECATED_dtos/job.dto";

export const paths = {
  CHECKOUT_WORKFLOW: (id: number, runtimeId?: number): RequestEntry => [
    `runtime/${runtimeId || 1}/git/workflow/${id}/checkout`,
    API_METHODS.POST,
  ],
  CHECKOUT_JOB: (id: number, runtimeId: number): RequestEntry => [`runtime/${runtimeId || 1}/git/jobs/${id}/checkout`, API_METHODS.POST],
};

export class CheckoutApi extends Api {
  constructor() {
    super();
  }

  static checkoutWorkflow(workflow_id: number, project_id: number): Promise<Res> {
    return this.fetch(paths.CHECKOUT_WORKFLOW(workflow_id), {
      queryParams: { project_id },
    });
  }

  static checkoutJob(id: number, runtime_id: number, project_id: number): PRes<JobDTO> {
    return this.fetch(paths.CHECKOUT_JOB(id, runtime_id), {
      queryParams: { project_id },
    });
  }
}
