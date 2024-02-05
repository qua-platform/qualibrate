import { JobStatuses } from "../DEPRECATED_enum/JobStatuses";

export interface EUI {
  path: string;
}
interface AuthorDTO {
  id: number;
  username: string;
  name: string;
  surname?: string;
  email?: string;
}

export interface JobDTO {
  description: string;
  project_id: number;
  runtime_id: number;
  author_id: number;
  author?: AuthorDTO; // TODO When you check that API works, remove question mark
  submit: Date;
  current_status: JobStatuses;
  id: number;
  workflow_id: number;
  parameters_id: number;
  start: Date;
  end: Date;
  eui: EUI;
}
