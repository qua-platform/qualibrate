import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

import ProjectList from "../../../../src/modules/SidebarMenu/ProjectList/ProjectList";
import * as ProjectStore from "../../../../src/stores/ProjectStore";
import { useSelector } from "react-redux";

// ---------------- MOCK DATA ----------------
const mockProjects = [{ name: "project1" }, { name: "project2" }];
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
  };
});

vi.mock("../../../../src/stores/ProjectStore", async () => {
  const actual = await vi.importActual<any>("../../../../src/stores/ProjectStore");
  return {
    ...actual,
    selectActiveProject: vi.fn((p) => ({
      type: "select",
      payload: p,
    })),
  };
});

vi.mock("../../../../src/stores/SnapshotsStore", () => ({
  clearData: vi.fn(() => ({ type: "clear" })),
  fetchGitgraphSnapshots: vi.fn(() => ({ type: "snapshots" })),
}));

vi.mock("../../../../src/stores/NavigationStore", () => ({
  setActivePage: vi.fn(() => ({ type: "setPage" })),
}));

vi.mock("../../../../src/modules/AppRoutes", () => ({
  NODES_KEY: "nodes",
}));

vi.mock("../../../../src/utils/classnames", () => ({
  classNames: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

vi.mock("../../../../src/modules/Data/components/ExecutionCard/components/TagsList/helpers", () => ({
  stringToHexColor: () => "#000000",
}));

// ---------------- HELPER ----------------
const renderComponent = (activeProject: any) => {
  (useSelector as Mock).mockImplementation((selector: any) => {
    if (selector === ProjectStore.getAllProjects) return mockProjects;
    if (selector === ProjectStore.getActiveProject) return activeProject;
    return undefined;
  });

  return render(<ProjectList />);
};

// ---------------- TESTS ----------------
describe("ProjectList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all projects", () => {
    renderComponent({ name: "project1" });

    expect(screen.getByText("project1")).toBeInTheDocument();
    expect(screen.getByText("project2")).toBeInTheDocument();
  });

  it("marks active project as selected (CSS modules safe)", () => {
    renderComponent({ name: "project1" });

    const activeItem = screen.getByText("project1").closest("div");

    // CSS modules check for substring (because of hash)
    expect(activeItem?.className).toMatch(/selected/);
  });

  it("dispatches all actions when project is clicked", () => {
    renderComponent({ name: "project1" });

    fireEvent.click(screen.getByText("project2"));

    expect(mockDispatch).toHaveBeenCalledTimes(6);
  });
});