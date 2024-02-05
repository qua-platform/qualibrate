import { PROJECT_LAST_UPDATES_VISIBLE } from "../../../dev.config";
import React from "react";
import styles from "./Project.module.scss";

interface Props {
  date?: Date;
  name: string;
}

function extractAbr(text: string): string {
  const parts = [...text.split(" "), "", ""];
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

const ProjectInfo = ({ name, date }: Props) => {
  return (
    <div className={styles.projectInfo}>
      <div className={styles.projectThumbnail}>
        <div className={styles.projectThumbnailBackground}></div>
        <div className={styles.projectThumbnailText}>{extractAbr(name)}</div>
      </div>
      <div className={styles.projectDetails}>
        <div className={styles.projectName}>{name || ""}</div>
        {
          PROJECT_LAST_UPDATES_VISIBLE && <div className={styles.projectDate}>Last updates {(date as any) || "unknown"}</div> //TODO Fix this any
        }
      </div>
    </div>
  );
};

export default ProjectInfo;
