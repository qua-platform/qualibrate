import { useCallback, useMemo, useState } from "react";
import { ValidateFunc, ValidatorResponse } from "./ValidationUtils";

type ReturnType<V> = [errors: ValidatorResponse["errors"] | undefined, getResult: () => { isOk: boolean }];

export default function useValidation<V>(validateFunc: ValidateFunc<V>, deps: [V, ...any]): ReturnType<V> {
  const [needValidation, setNeedValidation] = useState<boolean>(false);
  const errors: ValidatorResponse["errors"] | undefined = useMemo(() => {
    if (needValidation) {
      return validateFunc(deps[0]).getResponse().errors;
    }
    return undefined;
  }, [...deps, needValidation]);

  const getResult = useCallback((): { isOk: boolean; data?: V } => {
    const { isOk } = validateFunc(deps[0]).getResponse();
    setNeedValidation(true);
    if (isOk) {
      return { isOk: true };
    }
    return { isOk: false };
  }, deps);

  return [errors, getResult];
}
