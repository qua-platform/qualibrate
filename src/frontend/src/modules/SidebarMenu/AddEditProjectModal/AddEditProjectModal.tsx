import React, { useCallback, useEffect, useState } from "react";
import styles from "./AddEditProjectModal.module.scss";
import { Dialog } from "@mui/material";
import { classNames } from "../../../utils";
import {
  addProject,
  CreateEditProjectDTO,
  createProject,
  DatabaseDTO,
  editProject,
  ProjectDTO,
  selectActiveProject,
  testDatabase,
  updateProject,
} from "../../../stores/ProjectStore";
import { useRootDispatch } from "../../../stores";
import { clearData, fetchGitgraphSnapshots } from "../../../stores/SnapshotsStore";
import { setActivePage } from "../../../stores/NavigationStore";
import { NODES_KEY } from "../../AppRoutes";
import { FormInputFieldWithLabel, TestConnectionModal } from "./components";

export enum AddEditDialogMode {
  ADD = "add",
  EDIT = "edit",
}

enum TestDBConnectionStatusDialog {
  SUCCESS = "success",
  ERROR = "error",
}

interface Props {
  mode: AddEditDialogMode;
  isVisible: boolean;
  project?: ProjectDTO | null;
  handleOnClose: () => void;
  handleOnConfirm: () => void;
}

const emptyDatabase: DatabaseDTO = {
  is_connected: false,
  host: "",
  port: 5432,
  database: "",
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

  const [dbTestModalState, setDbTestModalState] = useState<{ open: boolean; type: TestDBConnectionStatusDialog }>({
    open: false,
    type: TestDBConnectionStatusDialog.SUCCESS,
  });
  const [showDbSettings, setShowDbSettings] = useState(false);
  const [formData, setFormData] = useState<CreateEditProjectDTO>(emptyForm);

  const areDbFieldsPopulated =
    formData.database?.database !== "" &&
    formData.database?.host !== "" &&
    formData.database?.port &&
    formData.database?.username !== "" &&
    formData.database?.password !== "";
  const disableCreateAndSave = formData.projectName === "" || (showDbSettings && !areDbFieldsPopulated);

  useEffect(() => {
    if (!isVisible) return;

    if (mode === "edit" && project) {
      setFormData({
        projectName: project.name ?? "",
        dataPath: project.updates?.qualibrate?.storage?.location ?? "",
        quamPath: project.updates?.quam?.state_path ?? "",
        calibrationPath: project.updates?.qualibrate?.calibration_library?.folder ?? "",
        database: project.updates?.qualibrate?.database ?? undefined,
      });
      console.log(project.updates?.qualibrate?.database);
      setShowDbSettings(!!project.updates?.qualibrate?.database_state?.is_connected);
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

  const handleDatabaseChange = (field: keyof DatabaseDTO, value: string | boolean | object) => {
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
      const response = isEdit ? await editProject(formData) : await createProject(formData);

      if (!response?.isOk || !response.result) {
        return;
      }

      dispatch(isEdit ? updateProject(response.result) : addProject(response.result));

      handleSetActiveProject(response.result);

      handleOnConfirm();
    } catch (err) {
      console.error("Project save failed:", err);
    }
  };

  const toggleDatabase = () => {
    const newValue = !showDbSettings;

    setShowDbSettings(newValue);

    handleDatabaseChange("is_connected", newValue);
  };

  const handleOnCloseTestDbModal = () => setDbTestModalState({ open: false, type: TestDBConnectionStatusDialog.SUCCESS });
  const handleOnTestDbClicked = async () => {
    if (formData.database) {
      const response = await testDatabase(formData.database);
      if (response?.isOk && response?.result) {
        setDbTestModalState({ open: true, type: TestDBConnectionStatusDialog.SUCCESS });
      } else {
        setDbTestModalState({ open: true, type: TestDBConnectionStatusDialog.SUCCESS });
      }
    }
  };

  const title = mode === "add" ? "Create New Project" : `Project Settings: ${project?.name}`;

  return (
    <>
      {dbTestModalState.open && (
        <TestConnectionModal
          database={formData.database}
          isVisible={dbTestModalState.open}
          isSuccessful={dbTestModalState.type === TestDBConnectionStatusDialog.SUCCESS}
          handleOnClose={handleOnCloseTestDbModal}
        />
      )}
      <Dialog
        classes={{ paper: styles.modalWrapper }}
        open={isVisible}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            return; // ignore click outside dialog
          }
          handleOnClose();
        }}
      >
        <div data-testid="add-edit-project-modal" className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button className={styles.closeBtn} onClick={handleOnClose}>
              ×
            </button>
          </div>

          <div className={styles.modalBody}>
            <FormInputFieldWithLabel
              dataTestId="add-edit-project-modal-project-name"
              classNames={classNames(styles.formGroup, mode === "edit" && styles.disabled)}
              labelText={"Project name"}
              placeholder={"Enter project name"}
              inputType={"text"}
              value={formData.projectName}
              isDisabled={mode === "edit"}
              isRequired={true}
              handleChange={(e) => handleChange("projectName", e.target.value)}
            />
            <FormInputFieldWithLabel
              dataTestId="add-edit-project-modal-data-path"
              classNames={styles.formGroup}
              labelText={"Data path"}
              placeholder={"C:\\Projects\\my_project\\data"}
              inputType={"text"}
              value={formData.dataPath ?? ""}
              isDisabled={false}
              isRequired={false}
              handleChange={(e) => handleChange("dataPath", e.target.value)}
            />
            <FormInputFieldWithLabel
              dataTestId="add-edit-project-modal-quam-path"
              classNames={styles.formGroup}
              labelText={"QUAM state path"}
              subLabelText={"(Quantum Abstract Machine)"}
              tooltipText={"store quantum machines state"}
              placeholder={"C:\\Projects\\my_project\\quam"}
              inputType={"text"}
              value={formData.quamPath ?? ""}
              isDisabled={false}
              isRequired={false}
              handleChange={(e) => handleChange("quamPath", e.target.value)}
            />
            <FormInputFieldWithLabel
              dataTestId="add-edit-project-modal-calibration-path"
              classNames={styles.formGroup}
              labelText={"Calibration library path"}
              placeholder={"C:\\Projects\\my_project\\calibration"}
              inputType={"text"}
              value={formData.calibrationPath ?? ""}
              isDisabled={false}
              isRequired={false}
              handleChange={(e) => handleChange("calibrationPath", e.target.value)}
            />

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
                  <FormInputFieldWithLabel
                    dataTestId="add-edit-project-modal-database-host"
                    classNames={styles.formGroup}
                    labelText={"Host (IP address/hostname)"}
                    placeholder={"localhost or 192.168.1.100"}
                    inputType={"text"}
                    value={formData.database?.host ?? ""}
                    isDisabled={false}
                    isRequired={true}
                    handleChange={(e) => handleDatabaseChange("host", e.target.value)}
                  />
                  <FormInputFieldWithLabel
                    dataTestId="add-edit-project-modal-database-port"
                    classNames={styles.formGroup}
                    labelText={"Port"}
                    placeholder={"5432"}
                    inputType={"number"}
                    value={formData.database?.port ?? "5432"}
                    isDisabled={false}
                    isRequired={true}
                    handleChange={(e) => handleDatabaseChange("port", e.target.value)}
                  />
                  <FormInputFieldWithLabel
                    dataTestId="add-edit-project-modal-database-name"
                    classNames={styles.formGroup}
                    labelText={"Name"}
                    placeholder={"qualibrate_db"}
                    inputType={"text"}
                    value={formData.database?.database ?? ""}
                    isDisabled={false}
                    isRequired={true}
                    handleChange={(e) => handleDatabaseChange("database", e.target.value)}
                  />
                  <FormInputFieldWithLabel
                    dataTestId="add-edit-project-modal-database-username"
                    classNames={styles.formGroup}
                    labelText={"Username"}
                    placeholder={"postgres"}
                    inputType={"text"}
                    value={formData.database?.username ?? ""}
                    isDisabled={false}
                    isRequired={true}
                    handleChange={(e) => handleDatabaseChange("username", e.target.value)}
                  />
                  <FormInputFieldWithLabel
                    dataTestId="add-edit-project-modal-database-password"
                    classNames={styles.formGroup}
                    labelText={"Password"}
                    placeholder={"••••••••"}
                    inputType={"password"}
                    value={formData.database?.password ?? ""}
                    isDisabled={false}
                    isRequired={true}
                    handleChange={(e) => handleDatabaseChange("password", e.target.value)}
                  />
                </div>
              )}
            </div>
            {showDbSettings && (
              <button
                data-testid="add-edit-project-modal-test-connection-button"
                type="button"
                disabled={!areDbFieldsPopulated}
                className={classNames(styles.btnLink, !areDbFieldsPopulated && styles.disabled)}
                id="testConnectionBtn"
                onClick={handleOnTestDbClicked}
              >
                Test Connection
              </button>
            )}
          </div>
          <div className={styles.modalFooter}>
            <button
              data-testid="add-edit-project-modal-cancel-button"
              className={classNames(styles.btn, styles.btnSecondary)}
              onClick={handleOnClose}
            >
              Cancel
            </button>
            <button
              data-testid="add-edit-project-modal-confirm-button"
              disabled={disableCreateAndSave}
              className={classNames(styles.btn, styles.btnPrimary, disableCreateAndSave && styles.disabled)}
              onClick={handleSubmit}
            >
              {mode === "edit" ? "Save Changes" : "Create"}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AddEditProjectModal;
