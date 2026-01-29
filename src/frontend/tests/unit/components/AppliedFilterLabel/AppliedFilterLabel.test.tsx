import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppliedFilterLabel } from "../../../../src/components";

describe("AppliedFilterLabel", () => {
  const mockOnRemove = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders label and value when label is provided", () => {
    render(<AppliedFilterLabel label="Date" value="Last 7 days" onRemove={mockOnRemove} />);

    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });

  it("renders dot when label is not provided", () => {
    render(<AppliedFilterLabel value="Today" onRemove={mockOnRemove} />);

    // Label should not be rendered
    expect(screen.queryByText("Date")).not.toBeInTheDocument();

    // Dot indicator should be rendered instead of label
    expect(screen.getByTestId("filter-dot")).toBeInTheDocument();
  });

  it("renders remove button", () => {
    render(<AppliedFilterLabel label="Status" value="Active" onRemove={mockOnRemove} />);
    expect(screen.getByText("×")).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", () => {
    render(<AppliedFilterLabel label="Type" value="Manual" onRemove={mockOnRemove} />);

    fireEvent.click(screen.getByText("×"));

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });
});
