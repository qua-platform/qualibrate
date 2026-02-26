import React, { useCallback, useEffect, useState } from "react";
import styles from "./AddEditProjectModal.module.scss";
import { Dialog } from "@mui/material";
import { classNames } from "../../../utils/classnames";
import { addProject, ProjectDTO, selectActiveProject } from "../../../stores/ProjectStore";
import { CreateEditProjectDTO, DatabaseDTO } from "../../../stores/ProjectStore/api/ProjectViewAPI";
import { createProject, editProject } from "../../../stores/ProjectStore/utils";
import { useRootDispatch } from "../../../stores";
import { updateProject } from "../../../stores/ProjectStore/actions";
import { clearData, fetchGitgraphSnapshots } from "../../../stores/SnapshotsStore";
import { setActivePage } from "../../../stores/NavigationStore";
import { NODES_KEY } from "../../AppRoutes";
import TestConnectionModal from "./components/TestConnectionModal/TestConnectionModal";

interface Props {
  mode: "add" | "edit" | "delete";
  isVisible: boolean;
  project?: ProjectDTO | null;
  handleOnClose: () => void;
  handleOnConfirm: () => void;
}

const emptyDatabase: DatabaseDTO = {
  isConnected: false,
  host: "",
  port: 5432,
  name: "",
  username: "",
  password: "",
};

const emptyForm: CreateEditProjectDTO = {
  projectName: "",
  dataPath: "",
  quamPath: "",
  calibrationPath: "",
  database: undefined,
};

const AddEditProjectModal = ({ isVisible, mode, project, handleOnClose, handleOnConfirm }: Props) => {
  const dispatch = useRootDispatch();

  const [dbTestSuccessful, setDbTestSuccessful] = useState(true);
  const [showDbTestModal, setShowDbTestModal] = useState(false);
  const [showDbSettings, setShowDbSettings] = useState(false);
  const [formData, setFormData] = useState<CreateEditProjectDTO>(emptyForm);

  const areDbFieldsPopulated = formData.database?.name!== "" && formData.database?.host !== "" && formData.database?.port && formData.database?.username !== "" && formData.database?.password !== "" ;
  const disableCreateAndSave = formData.projectName === "" || showDbSettings && !areDbFieldsPopulated;

  useEffect(() => {
    if (!isVisible) return;

    if (mode === "edit" && project) {
      setFormData({
        projectName: project.name ?? "",
        dataPath: project.updates?.qualibrate?.storage?.location ?? "",
        quamPath: project.updates?.quam?.state_path ?? "",
        calibrationPath: project.updates?.qualibrate?.calibration_library?.folder ?? "",
        database: project.database ?? undefined,
      });
      setShowDbSettings(!!project.database);
    }

    if (mode === "add") {
      setFormData(emptyForm);
      setShowDbSettings(false);
    }
  }, [mode, project, isVisible]);

  const handleChange = (field: keyof CreateEditProjectDTO, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDatabaseChange = (field: keyof DatabaseDTO, value: string) => {
    setFormData((prev) => ({
      ...prev,
      database: {
        ...(prev.database ?? emptyDatabase),
        [field]: value,
      },
    }));
  };

  const handleSetActiveProject = useCallback((selectedProject: ProjectDTO) => {
    dispatch(selectActiveProject(selectedProject));
    dispatch(clearData());
    dispatch(fetchGitgraphSnapshots(true));
    dispatch(setActivePage(NODES_KEY));
  }, []);

  const handleSubmit = async () => {
    try {
      const isEdit = mode === "edit" && project;
      const response = isEdit ? await editProject(project?.name, formData) : await createProject(formData);

      if (!response?.isOk || !response.result) {
        return;
      }

      dispatch(isEdit ? updateProject(response.result) : addProject(response.result));

      if (!isEdit) {
        handleSetActiveProject(response.result);
      }

      handleOnConfirm();
    } catch (err) {
      console.error("Project save failed:", err);
    }
  };

  const toggleDatabase = () => {
    setShowDbSettings((prev) => {
      const newValue = !prev;

      setFormData((form) => ({
        ...form,
        database: newValue ? emptyDatabase : undefined,
      }));

      return newValue;
    });
  };

  const handleOnCloseTestDbModal = () => setShowDbTestModal(false);
  const handleOnTestDbClicked = () => setShowDbTestModal(true);

  const title = mode === "add" ? "Create New Project" : `Project Settings: ${project?.name}`;

  return (
    <>
      <TestConnectionModal isVisible={showDbTestModal} isSuccessful={dbTestSuccessful} handleOnClose={handleOnCloseTestDbModal} />
      <Dialog classes={{ paper: styles.modalWrapper }} open={isVisible} onClose={handleOnClose}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button className={styles.closeBtn} onClick={handleOnClose}>
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            <form>
              <div className={classNames(styles.formGroup, mode === "edit" && styles.disabled)}>
                <label>
                  Project name
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  disabled={mode === "edit"}
                  onChange={(e) => handleChange("projectName", e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Data path</label>
                <input
                  type="text"
                  value={formData.dataPath ?? ""}
                  onChange={(e) => handleChange("dataPath", e.target.value)}
                  placeholder="C:\Projects\my_project\data"
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  QUAM state path <span className={styles.quamLabel}>(Quantum Abstract Machine)</span>
                </label>
                <input
                  type="text"
                  value={formData.quamPath ?? ""}
                  onChange={(e) => handleChange("quamPath", e.target.value)}
                  placeholder="C:\Projects\my_project\quam"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Calibration library path</label>
                <input
                  type="text"
                  value={formData.calibrationPath ?? ""}
                  onChange={(e) => handleChange("calibrationPath", e.target.value)}
                  placeholder="C:\Projects\my_project\calibration"
                />
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionHeader}>
                  <div className={styles.formSectionTitle}>Database Export</div>

                  <label className={styles.toggleSwitch}>
                    <input checked={showDbSettings} type="checkbox" onChange={toggleDatabase} />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>

                {showDbSettings && (
                    <div>
                        <div className={styles.formGroup}>
                            <label> Host (IP address/hostname)
                                <span className={styles.required}>*</span>
                            </label>
                            <input type="text" id="dbHost" placeholder="localhost or 192.168.1.100"
                                   onChange={(e) => handleDatabaseChange("host", e.target.value)}/>
                        </div>

                        <div className={styles.formGroup}>
                            <label> Port<span className={styles.required}>*</span>
                            </label>
                            <input type="number" id="dbPort" placeholder="5432" defaultValue="5432"
                                   onChange={(e) => handleDatabaseChange("port", e.target.value)}/>
                        </div>
                        <div className={styles.formGroup}>
                            <label> Name<span className={styles.required}>*</span>
                            </label>
                            <input type="text" id="dbName" placeholder="qualibrate_db"
                                   onChange={(e) => handleDatabaseChange("name", e.target.value)}/>
                        </div>
                        <div className={styles.formGroup}>
                            <label> Username<span className={styles.required}>*</span>
                            </label>
                            <input type="text" id="dbUsername" placeholder="postgres"
                                   onChange={(e) => handleDatabaseChange("username", e.target.value)}/>
                        </div>
                        <div className={styles.formGroup}>
                            <label> Password<span className={styles.required}>*</span> </label>
                            <input type="password" id="dbPassword" placeholder="••••••••"
                                   onChange={(e) => handleDatabaseChange("password", e.target.value)}/>
                        </div>
                    </div>
                )}
              </div>
            </form>
              {showDbSettings &&
              <button type="button" disabled={!areDbFieldsPopulated} className={classNames(styles.btnLink, !areDbFieldsPopulated && styles.disabled)} id="testConnectionBtn" onClick={handleOnTestDbClicked}>
                  Test Connection
              </button>
              }
          </div>
            <div className={styles.modalFooter}>
                <button className={classNames(styles.btn, styles.btnSecondary)} onClick={handleOnClose}>
                    Cancel
                </button>

                <button disabled={disableCreateAndSave} className={classNames(styles.btn, styles.btnPrimary, disableCreateAndSave && styles.disabled)} onClick={handleSubmit}>
                    {mode === "edit" ? "Save Changes" : "Create"}
                </button>
            </div>
        </div>
      </Dialog>
    </>
  );
};

export default AddEditProjectModal