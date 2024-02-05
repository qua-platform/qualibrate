import { ParameterValueType } from "../../../../../types";
import { isJobPath, isParametersPath, removeQuotes } from "../../../../../utils/referenceUtil";

export function getValueType(value: string): ParameterValueType {
  const val = removeQuotes(value);
  if (isParametersPath(val)) {
    return "PARAMETERS";
  }

  if (isJobPath(val)) {
    return "JOBS_EUI";
  }

  return "NONE";
}

export function _tryJSONParse(value: any): Record<string, unknown> | Array<unknown> | string | number | boolean | null {
  try {
    return JSON.parse(value || "");
  } catch (error) {
    return value;
  }
}
