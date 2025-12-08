import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";
import { GRAPH_LIBRARY_KEY, NODES_KEY } from "../../modules/AppRoutes";

export const getNavigationState = (state: RootState) => state.navigation;

export const getActivePage = createSelector(
  getNavigationState,
  (navigationState) => navigationState.activePage
);

export const getOpenedOncePages = createSelector(
  getNavigationState,
  (navigationState) => navigationState.openedOncePages
);

export const getIsRefreshButtonShown = createSelector(
  getActivePage,
  (activePage) => activePage && [NODES_KEY, GRAPH_LIBRARY_KEY].includes(activePage)
);