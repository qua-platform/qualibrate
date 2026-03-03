import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import DeleteProjectModal from "../../../../src/modules/SidebarMenu/DeleteProjectModal/DeleteProjectModal";

// ---------------- MOCKS ----------------
// Mock MUI Dialog like simple div
vi.mock("@mui/material", () => ({
  Dialog: ({ open, children }: any) => (open ? <div data-testid="mui-dialog">{children}</div> : null),
}));

// Mock classNames
vi.mock("../../../../src/utils", () => ({
  classNames: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

// Mock CSS module (for avoiding css hashes)
vi.mock("../../../../src/modules/SidebarMenu/DeleteProjectModal/DeleteProjectModal.module.scss", () => ({
  default: new Proxy(
    {},
    {
      get: (_, key) => key,
    }
  ),
}));

// ---------------- TESTS ----------------

describe("DeleteProjectModal", () => {
  const mockClose = vi.fn();
  const mockConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modal when visible", () => {
    render(<DeleteProjectModal isVisible={true} projectName="test_project" handleOnClose={mockClose} handleOnConfirm={mockConfirm} />);

    expect(screen.getByTestId("delete-project-modal")).toBeInTheDocument();
    expect(screen.getByText("Delete Project?")).toBeInTheDocument();
    expect(screen.getByText("test_project")).toBeInTheDocument();
  });

  it("does not render when not visible", () => {
    render(<DeleteProjectModal isVisible={false} projectName="test_project" handleOnClose={mockClose} handleOnConfirm={mockConfirm} />);

    expect(screen.queryByTestId("delete-project-modal")).not.toBeInTheDocument();
  });

  it("calls handleOnClose when Cancel is clicked", () => {
    render(<DeleteProjectModal isVisible={true} projectName="test_project" handleOnClose={mockClose} handleOnConfirm={mockConfirm} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("calls handleOnConfirm when Delete is clicked", () => {
    render(<DeleteProjectModal isVisible={true} projectName="test_project" handleOnClose={mockClose} handleOnConfirm={mockConfirm} />);

    fireEvent.click(screen.getByTestId("delete-project-modal-confirm-button"));

    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });
});