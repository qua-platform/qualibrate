import { useEffect } from "react";
import useDebounce from "../../../ui-lib/hooks/useDebounce";
import { ParameterValueType, ReferenceType } from "../types";
import { isJobPath, isParametersPath } from "../utils/referenceUtil";

type Props = string;

type ParsedValue = {
  startSymbols?: string;
  endSymbols?: string;
  value: string;
};

const getReferenceType = (ref: string): ParameterValueType => {
  if (isParametersPath(ref)) {
    return "PARAMETERS";
  }

  if (isJobPath(ref)) {
    return "JOBS_EUI";
  }

  return "NONE";
};

const cleanValue = (value: string) => {
  return value.replaceAll(/("|')/g, "");
};

const resolveEndSymbols = (value: string) => {
  switch (value) {
    case "[":
      return "]";
    case "{":
      return "}";
    case "(":
      return ")";
    default:
      return value;
  }
};

const parseValue = (ref: string): ParsedValue => {
  if (!ref) {
    return { value: "", startSymbols: "", endSymbols: "" };
  }

  const type = getReferenceType(ref);

  const data = ref.split("#/");

  const value = type !== "NONE" ? "#/" + data[1] : ref;

  return {
    value: cleanValue(value),
    startSymbols: data[0],
    endSymbols: resolveEndSymbols(data[0]),
  };
};

// const DEBOUNCE_TIMEOUT = 500;

// const useReferenceValue = (value: Props): ReferenceType => {
//   const debouncedValue = useDebounce(value, DEBOUNCE_TIMEOUT);
//
//   useEffect(() => {}, [debouncedValue]);
//
//   const printedValue = debouncedValue;
//
//   const { value: parsedValue, endSymbols, startSymbols } = parseValue(printedValue);
//
//   const context = { startSymbols, endSymbols };
//
//   const parsedType = getReferenceType(printedValue);
//
//   return { printedValue, parsedValue, context, parsedType };
// };
//
// export default useReferenceValue;
