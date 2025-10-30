import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";

export const getAuthState = (state: RootState) => state.auth;

export const getIsAuthorized = createSelector(
  getAuthState,
  (state) => state.isAuthorized
);

export const getAuthError = createSelector(
  getAuthState,
  (state) => state.authError
);

export const getIsTriedLoginWithEmptyString = createSelector(
  getAuthState,
  (state) => state.triedLoginWithEmptyString
);
