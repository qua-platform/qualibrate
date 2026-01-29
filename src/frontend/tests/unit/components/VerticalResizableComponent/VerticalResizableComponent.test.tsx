import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { VerticalResizableComponent } from "../../../../src/components";

describe("VerticalResizableComponent", () => {
  it("renders default tabs and content", () => {
    render(<VerticalResizableComponent />);

    expect(screen.getByText("Metadata")).toBeInTheDocument();
    expect(screen.getByText("Parameters")).toBeInTheDocument();
  });

  it("toggles sidebar collapse state", () => {
    const { container } = render(<VerticalResizableComponent />);

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
    render(
      <VerticalResizableComponent
        tabNames={["Metadata", "Parameters"]}
        tabData={{
          metadata: {
            execution_id: "exec-001",
            status: "running",
          },
          parameters: {
            depth: 10,
            qubits: ["Q1", "Q2"],
          },
        }}
      />
    );

    // Metadata tab is active by default
    expect(screen.getByText("Execution Id")).toBeInTheDocument();
    expect(screen.getByText("exec-001")).toBeInTheDocument();

    // Switch to Parameters
    fireEvent.click(screen.getByText("Parameters"));

    expect(screen.getByText("Depth")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText(/\[\s*"Q1",\s*"Q2"\s*\]/)).toBeInTheDocument();
  });

  it("renders dash for null or undefined values", () => {
    render(
      <VerticalResizableComponent
        tabData={{
          metadata: {
            endTime: null,
          },
        }}
      />
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
