import { PROJECT_LAST_UPDATES_VISIBLE } from "../../../dev.config";
import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";
import ProjectFolderIcon from "../../../ui-lib/Icons/ProjectFolderIcon";
import { extractInitials } from "../helpers";

interface Props {
  date?: Date;
  name: string;
  colorIcon: string;
}

const ProjectInfo = ({ name, date, colorIcon }: Props) => {
  return (
    <div className={styles.projectInfo}>
      <div className={styles.projectThumbnail}>
        <ProjectFolderIcon initials={extractInitials(name)} fillColor={colorIcon} />
      </div>
      <div className={styles.projectDetails}>
        <div className={styles.projectName}>{name || ""}</div>
        {PROJECT_LAST_UPDATES_VISIBLE && <div className={styles.projectDate}>Last updates {date?.toLocaleDateString() || "unknown"}</div>}
      </div>
    </div>
  );
};

export default ProjectInfo;
