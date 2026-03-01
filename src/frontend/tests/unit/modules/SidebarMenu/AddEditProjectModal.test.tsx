import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddEditProjectModal, { AddEditDialogMode } from "../../../../src/modules/SidebarMenu/AddEditProjectModal/AddEditProjectModal";
import * as utils from "../../../../src/stores/ProjectStore/utils";
import { DatabaseDTO, ProjectViewApi } from "../../../../src/stores/ProjectStore";

// ---------------- MOCKS ----------------
vi.mock("@mui/material", () => ({
  Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
}));

const mockDispatch = vi.fn();
// ---------------- MOCKS ----------------
vi.mock("../../../../src/stores", () => ({
  useRootDispatch: () => mockDispatch,
}));

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<any>("react-redux");
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: () => vi.fn(),
  };
});

const mockEditProject = vi.fn((p) => ({ type: "editProject", payload: p }));
const mockAddProject = vi.fn((p) => ({ type: "addProject", payload: p }));
const mockUpdateProject = vi.fn((p) => ({ type: "updateProject", payload: p }));
const mockSelectActiveProject = vi.fn((p) => ({ type: "selectActiveProject", payload: p }));
const mockTestDatabase = vi.fn();

vi.mock("../../../stores/ProjectStore", () => ({
  editProject: (...args: any[]) => mockEditProject(...args),
  addProject: (...args: any[]) => mockAddProject(...args),
  updateProject: (...args: any[]) => mockUpdateProject(...args),
  selectActiveProject: (...args: any[]) => mockSelectActiveProject(...args),
  testDatabase: (...args: any[]) => mockTestDatabase(...args),
}));
const createProjectSpy = vi.spyOn(utils, "createProject");

vi.mock("../../../stores/SnapshotsStore", () => ({
  clearData: () => ({ type: "clearData" }),
  fetchGitgraphSnapshots: () => ({ type: "fetchGitgraphSnapshots" }),
}));

vi.mock("../../../stores/NavigationStore", () => ({
  setActivePage: () => ({ type: "setActivePage" }),
}));

vi.mock("./components", () => ({
  FormInputFieldWithLabel: ({ labelText, value, handleChange, inputType = "text" }: any) => (
    <div>
      <label>{labelText}</label>
      <input aria-label={labelText} type={inputType} value={value} onChange={handleChange} />
    </div>
  ),
  TestConnectionModal: ({ isVisible, isSuccessful }: any) =>
    isVisible ? <div data-testid="test-connection-modal">{isSuccessful ? "SUCCESS" : "ERROR"}</div> : null,
}));

// ---------------- Tests ----------------
describe("AddEditProjectModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders in ADD mode", () => {
    render(<AddEditProjectModal mode={AddEditDialogMode.ADD} isVisible={true} handleOnClose={vi.fn()} handleOnConfirm={vi.fn()} />);

    expect(screen.getByText("Create New Project")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  it("disables create button when project name is empty", () => {
    render(<AddEditProjectModal mode={AddEditDialogMode.ADD} isVisible={true} handleOnClose={vi.fn()} handleOnConfirm={vi.fn()} />);

    const button = screen.getByText("Create") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("creates project successfully", async () => {
    createProjectSpy.mockResolvedValue({
      isOk: true,
      result: { id: "1", name: "Test Project" } as any,
    });

    const handleConfirm = vi.fn();

    render(<AddEditProjectModal mode={AddEditDialogMode.ADD} isVisible={true} handleOnClose={vi.fn()} handleOnConfirm={handleConfirm} />);

    const input = screen.getByTestId("add-edit-project-modal-project-name-input");

    fireEvent.change(input, {
      target: { value: "Test Project" },
    });

    const submitButton = screen.getByTestId("add-edit-project-modal-confirm-button");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createProjectSpy).toHaveBeenCalled();
      expect(handleConfirm).toHaveBeenCalled();
    });
  });

  it("shows database fields when toggle is enabled", () => {
    render(<AddEditProjectModal mode={AddEditDialogMode.ADD} isVisible={true} handleOnClose={vi.fn()} handleOnConfirm={vi.fn()} />);

    const toggle = screen.getByRole("checkbox");
    fireEvent.click(toggle);

    expect(screen.getByTestId("add-edit-project-modal-database-host")).toBeInTheDocument();
  });

  it("tests database connection - success", async () => {
    const mockDatabaseInputData: DatabaseDTO = {
      host: "localhost",
      port: 5432,
      database: "db",
      username: "user",
      password: "pass",
    };

    const spy = vi.spyOn(ProjectViewApi, "testDatabase").mockResolvedValue({
      isOk: true,
      result: {
        project: "project_name",
        already_connected: true,
      },
    });

    render(<AddEditProjectModal mode={AddEditDialogMode.ADD} isVisible={true} handleOnClose={vi.fn()} handleOnConfirm={vi.fn()} />);

    fireEvent.click(screen.getByRole("checkbox"));

    fireEvent.change(screen.getByTestId("add-edit-project-modal-database-host-input"), {
      target: { value: mockDatabaseInputData.host },
    });
    fireEvent.change(screen.getByTestId("add-edit-project-modal-database-port-input"), {
      target: { value: mockDatabaseInputData.port },
    });
    fireEvent.change(screen.getByTestId("add-edit-project-modal-database-name-input"), {
      target: { value: mockDatabaseInputData.database },
    });
    fireEvent.change(screen.getByTestId("add-edit-project-modal-database-username-input"), {
      target: { value: mockDatabaseInputData.username },
    });
    fireEvent.change(screen.getByTestId("add-edit-project-modal-database-password-input"), {
      target: { value: mockDatabaseInputData.password },
    });

    await waitFor(() => {
      expect(screen.getByTestId("add-edit-project-modal-test-connection-button")).not.toBeDisabled();
    });

    fireEvent.click(screen.getByTestId("add-edit-project-modal-test-connection-button"));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          host: "localhost",
          port: 5432,
          database: "db",
          username: "user",
          password: "pass",
        })
      );
    });

    spy.mockRestore();
  });
});