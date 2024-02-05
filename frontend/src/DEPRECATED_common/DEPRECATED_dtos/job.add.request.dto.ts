export interface JobRunRequestDTO {
  workflow_eui: { path: string };
  params_eui: { path: string };
  description: string;
}
