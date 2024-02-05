export const GET_PROJECTS_BY_USERNAME = (username = "admin") => `database/user/${username}/projects`;
export const GET_ALL_PROJECTS = () => "admin/projects/all";
export const ADD_USER_TO_PROJECT = (projectId: number) => `admin/projects/${projectId}/add_users`;
