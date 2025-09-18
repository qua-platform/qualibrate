import React from "react";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./Project.module.scss";
import ProjectFolderIcon from "../../../ui-lib/Icons/ProjectFolderIcon";
import { extractInitials } from "../helpers";
import { formatDate } from "../../TopbarMenu/helpers";

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
        {date && <div className={styles.projectDate}>Last updated: {formatDate(date)}</div>}
      </div>
    </div>
  );
};

export default ProjectInfo;
