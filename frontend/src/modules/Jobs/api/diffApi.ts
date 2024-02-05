import Api from "../../../utils/api";
import { API_METHODS } from "../../../DEPRECATED_common/DEPRECATED_enum/Api";
import { Res } from "../../../DEPRECATED_common/DEPRECATED_interfaces/Api";
import { JobDiffType } from "../types";
import { RequestEntry } from "../../../utils/api/types";

const JOBS_DIFF: RequestEntry = ["git/diff", API_METHODS.GET];

export class DiffApi extends Api {
  constructor() {
    super();
  }

  static diffByEUI(data: { first_eui: string; second_eui: string; project_id: number }): Promise<Res<JobDiffType>> {
    return this.fetch(JOBS_DIFF, {
      queryParams: data,
    });
  }
}
