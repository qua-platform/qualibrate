import { ProjectDTO } from "./api/ProjectViewAPI";
import { buildCreateSlice, asyncThunkCreator, PayloadAction } from "@reduxjs/toolkit";

export interface ProjectsState {
  allProjects: ProjectDTO[],
  activeProject: ProjectDTO | null | undefined,
  shouldGoToProjectPage: boolean,
  isScanningProjects: boolean,
}

const initialState: ProjectsState = {
  allProjects: [],
  activeProject: undefined,
  shouldGoToProjectPage: true,
  isScanningProjects: false,
};

const createSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setAllProjects: (state, action: PayloadAction<ProjectDTO[]>) => {
      state.allProjects = action.payload;
    },
    addProject: (state, action: PayloadAction<ProjectDTO>) => {
      state.allProjects = [action.payload, ...state.allProjects];
    },
    setActiveProject: (state, action: PayloadAction<ProjectDTO | undefined>) => {
      state.activeProject = action.payload;
    },
    handleSelectActiveProject: (state, action: PayloadAction<ProjectDTO>) => {
      state.activeProject = action.payload;
    },
    setShouldGoToProjectPage: (state, action: PayloadAction<boolean>) => {
      state.shouldGoToProjectPage = action.payload;
    },
    setScanningProjects: (state, action: PayloadAction<boolean>) => {
      state.isScanningProjects = action.payload;
    }
  }
});

export default projectsSlice.reducer;
