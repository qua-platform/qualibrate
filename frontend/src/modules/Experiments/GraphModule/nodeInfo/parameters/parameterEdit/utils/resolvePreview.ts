import { ReferencePreview } from "../../../../../types";
import { useCallback, useEffect, useState } from "react";
import { ExperimentApi } from "../../../../../api/ExperimentApi";
import { RequestStatus } from "../../../../../../../types";
import { formRequestStatus, setPending } from "../../../../../../../utils/statusHelpers";
import { _tryJSONParse, getValueType } from "./common";

export default function useResolvedPreview(value: string): [preview: ReferencePreview | undefined, status: RequestStatus] {
  const [preview, setPreview] = useState<ReferencePreview | undefined>(undefined);
  const [status, setStatus] = useState<RequestStatus>(setPending());
  const formPreview = useCallback(async () => {
    setStatus(setPending());
    const valueType = getValueType(value);
    switch (valueType) {
      case "NONE":
        const preview = formPlainPreview(value);
        setPreview(preview);
        setStatus(formRequestStatus({ isOk: preview.type === "value" }));
        break;
      default:
        const preview2 = await resolvePreview(value);
        setPreview(preview2);
        setStatus(formRequestStatus({ isOk: preview2.type === "value" }));
        break;
    }
  }, [value, setPreview]);
  useEffect(() => {
    formPreview();
  }, [formPreview]);
  return [preview, status];
}

function formPlainPreview(value: string): ReferencePreview {
  try {
    const data = JSON.parse(value);
    return {
      type: "value",
      data,
    };
  } catch (error: any) {
    return {
      type: "error",
      data: {
        error: error.toString(),
      },
    };
  }
}

async function resolvePreview(value: string): Promise<ReferencePreview> {
  try {
    const { result, error, isOk } = await ExperimentApi.resolveByEUI(JSON.parse(value));
    if (!isOk || error) {
      return { data: { error }, type: "error" };
    }
    const data = _tryJSONParse(result);
    return {
      type: "value",
      data,
    };
  } catch (err) {
    const data = _tryJSONParse(err);

    return {
      type: "error",
      data,
    };
  }
}
