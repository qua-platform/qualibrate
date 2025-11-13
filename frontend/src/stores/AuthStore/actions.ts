import { authSlice } from "./AuthStore";

export const {
  setAuthorize,
  setError,
  setTriedLoginWithEmptyString,
} = authSlice.actions;
