export const GET_ALL_WORKFLOWS = "database/workflows/date_ordered";
export const GET_WORKFLOW_BY_ID = (id: number) => `database/workflows/${id}`;
export const GET_WORKFLOW_PATH = (runtimeId: number) => `runtime/${runtimeId || 1}/view`;

export const CREATE_WORKFLOW = (runtimeId: number) => `runtime/${runtimeId || 1}/git/create_new_workflow/empty`;
