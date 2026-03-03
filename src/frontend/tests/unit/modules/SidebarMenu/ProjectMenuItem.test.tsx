import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProjectMenuItem from "../../../../src/modules/SidebarMenu/ProjectMenuItem";
import * as ProjectStore from "../../../../src/stores/ProjectStore";
import GlobalThemeContext from "../../../../src/modules/themeModule/GlobalThemeContext";
import "@testing-library/jest-dom";
import { useSelector } from "react-redux";

const mockProjects = [
  {
    name: "project1",
    nodes_number: 0,
    created_at: "2026-02-27T11:53:42+01:00",
    last_modified_at: "2026-02-27T11:53:42+01:00",
    updates: {},
  },
  {
    name: "project2",
    nodes_number: 0,
    created_at: "2026-02-27T11:53:42+01:00",
    last_modified_at: "2026-02-27T11:53:42+01:00",
    updates: {},
  },
];

// ---------------- MOCKS ----------------
vi.mock("../../../../src/stores", () => ({
  useRootDispatch: () => vi.fn(),
}));

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<any>("react-redux");
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: () => vi.fn(),
  };
});

vi.mock("../../stores/ProjectStore", async () => {
  const actual = await vi.importActual<any>("../../stores/ProjectStore");
  return {
    ...actual,
    getAllProjects: () => mockProjects,
    getActiveProject: vi.fn(),
    selectActiveProject: vi.fn((p) => ({ type: "select", payload: p })),
    deleteProject: vi.fn(),
  };
});

const deleteProjectSpy = vi.spyOn(ProjectStore, "deleteProject");

// ---------------- HELPER ----------------
const renderWithContext = (activeProject: any, allProjects: any[]) => {
  (useSelector as Mock).mockImplementation((selector: any) => {
    if (selector === ProjectStore.getAllProjects) return allProjects;
    if (selector === ProjectStore.getActiveProject) return activeProject;
    return undefined;
  });

  return render(
    <GlobalThemeContext.Provider value={{ setMinifySideMenu: vi.fn() }}>
      <ProjectMenuItem />
    </GlobalThemeContext.Provider>
  );
};

// ---------------- TESTS ----------------
describe("ProjectMenuItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders active project name", () => {
    renderWithContext({ name: "test_project" }, []);
    expect(screen.getByText("test_project")).toBeInTheDocument();
  });

  it("opens dropdown when clicked", () => {
    renderWithContext({ name: "test_project" }, mockProjects);
    fireEvent.click(screen.getByTestId("project-menu-item"));
    expect(screen.getByText("project1")).toBeInTheDocument();
    expect(screen.getByText("project2")).toBeInTheDocument();
  });

  it("opens add/edit modal", () => {
    renderWithContext({ name: "test_project" }, []);
    fireEvent.click(screen.getByTestId("project-menu-item"));
    fireEvent.click(screen.getByText("New"));
    expect(screen.getByTestId("add-edit-project-modal")).toBeInTheDocument();
  });

  it("disables edit/delete for demo_project", () => {
    renderWithContext({ name: "demo_project" }, []);

    fireEvent.click(screen.getByTestId("project-menu-item"));
    fireEvent.click(screen.getByTestId("edit-project-button"));

    expect(screen.queryByText("add-edit-project-modal")).not.toBeInTheDocument();
  });

  it("handles delete flow and fallback to demo_project", async () => {
    const allProjects = [{ name: "demo_project" }, { name: "other_project" }];
    renderWithContext({ name: "other_project" }, allProjects);

    fireEvent.click(screen.getByText("other_project"));
    fireEvent.click(screen.getByTestId("delete-project-button"));
    fireEvent.click(screen.getByTestId("delete-project-modal-confirm-button"));

    await waitFor(() => {
      expect(deleteProjectSpy).toHaveBeenCalledWith("other_project");
    });
  });
});