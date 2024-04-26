import { ProjectDTO } from "../Project/ProjectDTO";

const LS_KEYS = {
  activeProject: "activeProject",
};

class LSManager {
  get activeProject(): ProjectDTO | undefined {
    try {
      const data = localStorage.getItem(LS_KEYS.activeProject);
      return data && JSON.parse(data);
    } catch (e) {
      localStorage.removeItem(LS_KEYS.activeProject);
      return undefined;
    }
  }
  set activeProject(project: ProjectDTO | undefined) {
    if (!project) {
      localStorage.removeItem(LS_KEYS.activeProject);
    } else {
      localStorage.setItem(LS_KEYS.activeProject, JSON.stringify(project));
    }
  }
}

export default new LSManager();
