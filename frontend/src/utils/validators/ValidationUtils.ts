import isEmpty from "../isEmpty";

// export type ValidateFunc<V> = (val: V, validator?: Validator) => Validator;

export type ValidatorResponse = {
  isOk: boolean;
  errors: {
    [key: string]: string | undefined;
  };
};

export const OK_RESPONSE: ValidatorResponse = {
  isOk: true,
  errors: {},
};
export class Validator {
  private result: ValidatorResponse = { isOk: true, errors: {} };

  // checkTrue = (value: boolean, field: string, error?: string): void => {
  //   if (!value) {
  //     this.result.isOk = false;
  //     this.setError(field, error);
  //   }
  // };

  checkMinLength = (value: string | undefined, minLength: number, field: string): void => {
    if ((value?.length || 0) < minLength) {
      this.result.isOk = false;
      this.setError(`should be at least ${minLength} length`, field);
    }
  };

  checkMaxLength = (value: string | undefined, maxLength: number, field: string): void => {
    if ((value?.length || 0) > maxLength) {
      this.result.isOk = false;
      this.setError(field, `should be at least ${maxLength} length`);
    }
  };

  private setError = (field: string, err?: string): void => {
    if (!this.result.errors[field]) {
      this.result.errors[field] = err || "Validation error";
    }
  };

  // forceSetError = (field: string, err?: string): void => {
  //   this.result.errors[field] = err || "Error";
  // };

  checkEmpty = (value: string | undefined, field: string): void => {
    if (isEmpty(value)) {
      this.result.isOk = false;
      this.setError(field, "Shouldn`t be empty");
    }
  };

  // checkJsonSyntax = (value: string): void => {
  //   try {
  //     JSON.parse(value);
  //   } catch (err) {
  //     this.result.isOk = false;
  //     this.setError(value, "Incorrect JSON");
  //   }
  // };

  getResponse = (): ValidatorResponse => {
    return this.result;
  };
}
