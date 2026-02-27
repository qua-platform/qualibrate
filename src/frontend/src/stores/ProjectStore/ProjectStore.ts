import { ProjectDTO } from "./api/ProjectViewAPI";
import { asyncThunkCreator, buildCreateSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProjectsState {
  allProjects: ProjectDTO[];
  activeProject: ProjectDTO | null | undefined;
  isScanningProjects: boolean;
}

const initialState: ProjectsState = {
  allProjects: [],
  activeProject: undefined,
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
    updateProject: (state, action: PayloadAction<ProjectDTO>) => {
      state.allProjects = state.allProjects.map((project) => (project.name === action.payload.name ? action.payload : project));
    },
    removeProject: (state, action: PayloadAction<ProjectDTO>) => {
      state.allProjects = state.allProjects.filter((project) => project.name !== action.payload.name);
    },
    setActiveProject: (state, action: PayloadAction<ProjectDTO | undefined>) => {
      state.activeProject = action.payload;
    },
    setScanningProjects: (state, action: PayloadAction<boolean>) => {
      state.isScanningProjects = action.payload;
    },
  },
});

export default projectsSlice.reducer;
