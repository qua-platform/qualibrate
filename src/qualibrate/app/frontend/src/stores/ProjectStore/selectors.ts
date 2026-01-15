import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "..";

export const getProjectsState = (state: RootState) => state.projects;

export const getIsScanningProjects = createSelector(
  getProjectsState,
  (state) => state.isScanningProjects
);

export const getAllProjects = createSelector(
  getProjectsState,
  (state) => state.allProjects
);

export const getActiveProject = createSelector(
  getProjectsState,
  (state) => state.activeProject
);

export const getShouldGoToProjectPage = createSelector(
  getProjectsState,
  (state) => state.shouldGoToProjectPage
);
