import { SingleParameter } from "./Parameters";

export const getParameterType = (parameter: SingleParameter) => {
  return {
    type: parameter.type || (parameter.anyOf || []).find(({ type }) => type !== "null")?.type,
    allowEmpty: parameter.type === "null" || (parameter.anyOf || []).some(({ type }) => type === "null"),
  };
};

export const validate = (parameter: SingleParameter, value: unknown) => {
  const { type, allowEmpty } = getParameterType(parameter);

  if (!allowEmpty && (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0))) {
    return {
      isValid: false,
      error: "Must be not empty",
    };
  }

  const num = Number(value);

  switch (type) {
    case "number":
      if (!allowEmpty && isNaN(num)) {
        return {
          isValid: false,
          error: "Must be a number"
        };
      }
      return { isValid: true, error: undefined };

    case "integer":
      if (!allowEmpty && (isNaN(num) || !Number.isInteger(num))) {
        return {
          isValid: false,
          error: "Must be an integer"
        };
      }
      return { isValid: true, error: undefined };

    case "array":
    default:
      return { isValid: true, error: undefined };
  }
};
