import React from "react";
import ProjectSelection from "./ProjectSelection";

interface Props {
  showRuntime?: boolean;
  isActive?: boolean;
  onClick?: (name: string) => void;
  projectId?: number;
  name?: string;
  lastModifiedAt?: string;
}

const Project = (props: Props) => {
  return <ProjectSelection {...props} />;
};

export default Project;
