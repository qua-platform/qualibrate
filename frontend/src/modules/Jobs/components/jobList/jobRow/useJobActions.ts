import { IconButtonProps } from "../../../../../ui-lib/components/Button/IconButton";
import { JobDTO } from "../../../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";
import { useMemo } from "react";
import { useJobActionsContext } from "../../../context/JobActionsContext";
import { JobStatuses } from "../../../../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";
import { CancelIcon } from "../../../../../ui-lib/Icons/CancelIcon";
import { JobAction } from "../../../types";
import { RetryIcon } from "../../../../../ui-lib/Icons/RetryIcon";
import { useCheckoutContext } from "../../../../Checkout/CheckoutContext";
import CheckoutIcon from "../../../../../ui-lib/Icons/CheckoutIcon";
import { SHOW_NOT_IMPLEMENTED } from "../../../../../dev.config";
import { ListIcon } from "../../../../../ui-lib/Icons/ListIcon";
import UsedByIcon from "../../../../../ui-lib/Icons/UsedByIcon";
import { cancelStatusKey, rerunStatusKey } from "../../../utils/jobActionStatusHelpers";

export default function useJobActions(job: JobDTO): [commonActions: Array<IconButtonProps>, scheduleActionProps?: IconButtonProps] {
  const { checkoutJob, checkoutStatus } = useCheckoutContext();
  const scheduleActionProps = _useScheduleAction(job);

  const commonActions: Array<IconButtonProps> = useMemo(() => {
    const arr = [
      {
        icon: CheckoutIcon,
        status: checkoutStatus,
        title: "Checkout job",
        onClick: () => checkoutJob(job),
      },
    ];

    if (SHOW_NOT_IMPLEMENTED) {
      return [{ icon: ListIcon, title: "Notebook" }, { icon: UsedByIcon, title: "Used by ..." }, ...arr];
    }

    return arr;
  }, [job, checkoutJob, checkoutStatus]);

  return [commonActions, scheduleActionProps];
}

function _useScheduleAction(job: JobDTO): undefined | IconButtonProps {
  const jobActionCtx = useJobActionsContext();
  const rerunStatus = jobActionCtx[rerunStatusKey(job.id)];
  const cancelStatus = jobActionCtx[cancelStatusKey(job.id)];
  const { doActionOnJob } = jobActionCtx;

  return useMemo(() => {
    const action = getJobActionData(job.current_status);
    return (
      action && {
        icon: action.icon,
        title: action.text,
        status: action.action === JobAction.CANCEL ? cancelStatus : rerunStatus,
        onClick: () => doActionOnJob(job, action.action),
      }
    );
  }, [doActionOnJob, job, rerunStatus, cancelStatus]);
}

function getJobActionData(jobStatus: JobStatuses) {
  switch (jobStatus) {
    case JobStatuses.SCHEDULED:
    case JobStatuses.RUNNING:
    case JobStatuses.PENDING:
      return { text: "Cancel", icon: CancelIcon, action: JobAction.CANCEL };
    case JobStatuses.FAILURE:
    case JobStatuses.CANCELED:
    case JobStatuses.STOPPED:
    case JobStatuses.REVOKED:
      return { text: "Rerun", icon: RetryIcon, action: JobAction.RERUN };
    case JobStatuses.TERMINATED:
    default:
      return undefined;
  }
}
