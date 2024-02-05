import Api from "../../utils/api";
import { ProjectUserState } from "./types";
import { RequestEntry } from "../../utils/api/types";
import { API_METHODS } from "../../DEPRECATED_common/DEPRECATED_enum/Api";

const activeJobsPath = {
  GET_CURRENT_STATE: (projectId: string | number): RequestEntry => [`database/project/${projectId}/current_state`, API_METHODS.GET],
};

export class ActiveProjectApi extends Api {
  constructor() {
    super();
  }

  static getCurrentState = this.fetchFunc<ProjectUserState, number>(activeJobsPath.GET_CURRENT_STATE);
}
