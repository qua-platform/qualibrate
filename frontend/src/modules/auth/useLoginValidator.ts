import { OK_RESPONSE, Validator, ValidatorResponse } from "../../utils/validators/ValidationUtils";
import { useCallback, useState } from "react";
import { LoginData } from "./types";

export default function useLoginValidation(): [
  response: ValidatorResponse,
  validate: (data: LoginData) => void,
  forceShowError: (showErrors: boolean) => void
] {
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [response, setResponse] = useState<ValidatorResponse>(OK_RESPONSE);

  const validate = useCallback(
    (data: LoginData) => {
      const validator = new Validator();
      validator.checkEmpty(data.username, "username");
      validator.checkMinLength(data.username, 3, "username");
      validator.checkMaxLength(data.username, 20, "username");

      validator.checkEmpty(data.password, "password");
      validator.checkMinLength(data.password, 3, "password");
      validator.checkMaxLength(data.password, 20, "password");
      setResponse(validator.getResponse());
    },
    [showErrors, setShowErrors, setResponse]
  );

  return [
    {
      isOk: response.isOk,
      errors: showErrors ? response.errors : {},
    },
    validate,
    setShowErrors,
  ];
}
