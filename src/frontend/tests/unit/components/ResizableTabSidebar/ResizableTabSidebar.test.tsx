import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ResizableTabSidebar } from "../../../../src/components";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ReactElement } from "react";
import "@testing-library/jest-dom";
import { SnapshotComment } from "../../../../src/stores/SnapshotsStore/api/SnapshotsApi";

const mockComments: SnapshotComment[] = [{ id: 1, value: "My comment", createdAt: "" }];
// 👇 MOCK for SnapshotComments selectors
vi.mock("../../../../src/stores/snapshots/selectors", () => ({
  getSelectedSnapshotId: () => 1,
  getSelectedSnapshot: () => ({
    id: 1,
    comments: [],
  }),
}));

// 👇 helper for render with Redux
const renderWithStore = (ui: ReactElement) => {
  const store = configureStore({
    reducer: {
      snapshots: () => ({}),
    },
  });

  return render(<Provider store={store}>{ui}</Provider>);
};

const mockTabs = [
  {
    title: "tab1",
    render: <span>tab 1 content</span>,
  },
  {
    title: "tab2",
    render: <span>tab 2 content</span>,
  },
];

describe("ResizableTabSidebar", () => {
  it("renders default tabs and content", () => {
    renderWithStore(<ResizableTabSidebar tabs={mockTabs} />);

    expect(screen.getByText("tab1")).toBeInTheDocument();
    expect(screen.getByText("tab2")).toBeInTheDocument();
  });

  it("toggles sidebar collapse state", () => {
    const { container } = renderWithStore(<ResizableTabSidebar tabs={mockTabs} />);

    const sidebar = container.querySelector("#contentSidebar")!;
    const toggleBtn = container.querySelector("#sidebarToggle")!;

    // expanded by default
    expect(sidebar.className).not.toContain("collapsed");

    fireEvent.click(toggleBtn);
    expect(sidebar.className).toContain("collapsed");

    fireEvent.click(toggleBtn);
    expect(sidebar.className).not.toContain("collapsed");
  });

  it("switches tabs and displays correct data", () => {
    renderWithStore(<ResizableTabSidebar tabs={mockTabs} />);

    // Metadata tab is active by default
    expect(screen.getByText("tab 1 content")).toBeInTheDocument();

    // Switch to Parameters
    fireEvent.click(screen.getByText("tab2"));

    expect(screen.getByText("tab 2 content")).toBeInTheDocument();
  });
});
