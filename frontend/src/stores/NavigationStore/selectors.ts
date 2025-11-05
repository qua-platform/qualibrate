import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";

export const getNavigationState = (state: RootState) => state.navigation

export const getActivePage = createSelector(
  getNavigationState,
  (navigationState) => navigationState.activePage
)

export const getOpenedOncePages = createSelector(
  getNavigationState,
  (navigationState) => navigationState.openedOncePages
)

export const getTopBarAdditionalComponents = createSelector(
  getNavigationState,
  (navigationState) => navigationState.topBarAdditionalComponents
)
