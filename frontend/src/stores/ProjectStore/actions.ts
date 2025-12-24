import { ProjectViewApi } from "./api/ProjectViewAPI";
import { ProjectDTO } from "./api/ProjectViewAPI";
import { RootDispatch } from "..";
import { projectsSlice } from "./ProjectStore";

export const {
  setAllProjects,
  addProject,
  setActiveProject,
  setShouldGoToProjectPage,
  setScanningProjects,
} = projectsSlice.actions;

export const fetchProjectsAndActive = () => async (dispatch: RootDispatch) => {
  const [projectsRes, activeNameRes] = await Promise.all([
    ProjectViewApi.fetchAllProjects(),
    ProjectViewApi.fetchActiveProjectName()
  ]);

  dispatch(setScanningProjects(true));
  if (projectsRes.isOk && projectsRes.result) {
    const fetchedProjects = projectsRes.result;

    dispatch(setAllProjects(fetchedProjects));
    if (activeNameRes.isOk && activeNameRes.result) {
      const fetchedActiveProject = fetchedProjects.find((p) => p.name === activeNameRes.result);

      dispatch(setActiveProject(fetchedActiveProject));
    } else if (!activeNameRes.isOk && activeNameRes.error) {
      console.error("Error fetching projects or active project:", activeNameRes.error);
    }
  } else {
    if (!projectsRes.isOk && projectsRes.error) {
      console.error("Error fetching projects or active project:", projectsRes.error);
    }
  }

  dispatch(setScanningProjects(false));
};

export const fetchShouldRedirectUserToProjectPage = () => async (dispatch: RootDispatch) => {
  const response = await ProjectViewApi.fetchShouldRedirectUserToProjectPage();

  if (response.isOk && response.result) {
    localStorage.setItem("backandWorking", "true");

    dispatch(setShouldGoToProjectPage(response.result.page === "project"));
  } else if (!response.isOk && response.error) {
    console.error("Error fetching should user be redirected to project page:", response.error);
  }
};

export const selectActiveProject = (project: ProjectDTO) => async (dispatch: RootDispatch) => {
  try {
    const { isOk, result } = await ProjectViewApi.selectActiveProject(project.name);

    if (isOk && result === project.name) {
      dispatch(setActiveProject(project));
      dispatch(setShouldGoToProjectPage(false));
    }
  } catch (err) {
    console.error("Failed to activate project:", err);
  }
};
