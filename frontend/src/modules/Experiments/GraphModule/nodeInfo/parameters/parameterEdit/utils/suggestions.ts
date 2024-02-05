import { SuggestedItem } from "../../../../../types";
import { RequestStatus } from "../../../../../../../types";
import { useCallback, useEffect, useState } from "react";
import { formRequestStatus, setOk, setPending } from "../../../../../../../utils/statusHelpers";
import { JobApi } from "../../../../../../../DEPRECATED_common/DEPRECATED_api/job";
import { JobStatuses } from "../../../../../../../DEPRECATED_common/DEPRECATED_enum/JobStatuses";
import { getValueType } from "./common";
import { PRes } from "../../../../../../../DEPRECATED_common/DEPRECATED_interfaces/Api";
import { ExperimentApi } from "../../../../../api/ExperimentApi";
import { JobDTO } from "../../../../../../../DEPRECATED_common/DEPRECATED_dtos/job.dto";

export default function useSuggestions(value: string): [suggestions: SuggestedItem[] | undefined, status: RequestStatus] {
  const [suggestions, setSuggestions] = useState<SuggestedItem[] | undefined>(undefined);
  const [status, setStatus] = useState<RequestStatus>(setPending());
  const formSuggestions = useCallback(async () => {
    setStatus(setPending());
    const valueType = getValueType(value);
    switch (valueType) {
      case "NONE":
        setSuggestions(undefined);
        setStatus(setOk());
        break;
      case "JOBS_EUI":
        const { isOk, result } = await autocompleteJobs(value);
        setStatus(formRequestStatus({ isOk }));
        if (isOk) {
          setSuggestions(result);
        }
        break;
      default:
        const { isOk: isOk2, result: result2 } = await autocompleteParameters(value);
        setStatus(formRequestStatus({ isOk: isOk2 }));
        if (isOk2) {
          setSuggestions(result2);
        }
        break;
    }
  }, [value, setStatus, setSuggestions]);
  useEffect(() => {
    formSuggestions();
  }, [formSuggestions]);
  return [suggestions, status];
}

const autocompleteJobs = async (value: string): PRes<SuggestedItem[]> => {
  const { isOk, result } = await JobApi.getFilteredJobs({
    statuses: [JobStatuses.SUCCESSFULLY],
    limit: 20,
    date_order: "descending",
  });
  if (!isOk || !result) {
    return { isOk };
  }

  const parsed = value.replace(/"$/, "");
  const references = (result.items as JobDTO[])
    .map((job) => JSON.stringify(job.eui.path + "/"))
    .filter((original) => original.indexOf(parsed) !== -1 && original.length >= parsed.length && original !== value)
    .map((original) => ({
      matched: parsed,
      different: original.substring(parsed.length),
      original: original,
    }));

  return {
    isOk: true,
    result: references,
  };
};

const autocompleteParameters = async (value: string): PRes<SuggestedItem[]> => {
  const parsed = value.replace(/"$/, "");
  const eui = parsed.split("/")[1];
  const { isOk, result } = await ExperimentApi.getAutoCompleteByEUI("#/" + eui + "/");
  if (!isOk || !result) {
    return { isOk };
  }
  const references = result
    .map((o) => JSON.stringify(o))
    .filter((original) => original.indexOf(parsed) !== -1 && original.length >= parsed.length && original !== value)
    .map((original) => ({
      matched: parsed,
      different: original.substring(parsed.length),
      original,
    }));

  return {
    isOk: true,
    result: references,
  };
};
