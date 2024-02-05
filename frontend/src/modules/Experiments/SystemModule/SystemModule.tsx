import React from "react";
import { EXPERIMENT_SYSTEM_URL } from "../../../DEPRECATED_common/modules";
import { useActiveProjectContext } from "../../ActiveProject/ActiveProjectContext";

type Props = { active?: boolean };

const SystemModule = ({ active }: Props) => {
  const { projectUserState } = useActiveProjectContext();

  if (!active) {
    return <></>;
  }

  return <iframe src={EXPERIMENT_SYSTEM_URL(projectUserState?.job_eui)} style={{ height: "100%", width: "100%" }} />;
};

export default SystemModule;
