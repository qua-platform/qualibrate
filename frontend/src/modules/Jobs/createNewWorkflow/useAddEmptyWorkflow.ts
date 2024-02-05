import { useCallback, useState } from "react";
import { useFlexLayoutContext } from "../../../routing/flexLayout/FlexLayoutContext";
import { RequestStatus } from "../../../types";
import { formRequestStatus, setPending } from "../../../utils/statusHelpers";
import { useActiveProjectContext } from "../../ActiveProject/ActiveProjectContext";
import { WorkflowApi } from "../../Experiments/api/WorkflowApi";
import { toast } from "react-toastify";

export default function useAddEmptyWorkflow(cb?: (isOk?: boolean) => void): [() => void, RequestStatus | undefined] {
  const { activeProject } = useActiveProjectContext();
  const { openTab } = useFlexLayoutContext();
  const [status, setStatus] = useState<RequestStatus | undefined>();
  const addEmptyWorkflow = useCallback(async () => {
    setStatus(setPending());
    const res = await WorkflowApi.createEmptyWorkflow(activeProject?.id || -1, 1);
    setStatus(formRequestStatus(res));
    if (res.isOk) {
      toast("Empty workflow was created");
      openTab("experiments");
    } else {
      toast.error("Failed to create empty workflow");
    }
    cb && cb(res.isOk);
  }, [setStatus]);

  return [addEmptyWorkflow, status];
}
