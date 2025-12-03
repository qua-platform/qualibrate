import { SingleParameter } from "./Parameters";

export const validate = (parameter: SingleParameter, value: unknown) => {
  let result: {
    isValid: boolean,
    error: undefined | string
  } = {
    isValid: true,
    error: undefined
  };

  if (!value) {
    result = {
      isValid: false,
      error: "Must be not empty"
    };
  }

  switch (parameter.type) {
    case "number":
      if (isNaN(Number(value))) {
        result = {
          isValid: false,
          error: "Must be a number"
        };
      }
      break;
    case "integer":
      if (isNaN(Number(value)) || !Number.isInteger(Number(value))) {
        result = {
          isValid: false,
          error: "Must be an integer"
        };
      }
      break;
    case "array":
    default:
      break;
  }

  return result;
};
