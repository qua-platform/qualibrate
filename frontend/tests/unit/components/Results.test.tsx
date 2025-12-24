import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ErrorObject, ResultsError } from "../../../src/components";

describe("ResultsError - Collapsible Traceback", () => {
  const mockErrorWithTraceback: ErrorObject = {
    error_class: "ValueError",
    message: "Invalid parameter value provided",
    traceback: [
      'File "/path/to/file.py", line 42, in function_name',
      "    some_code_here()",
      'File "/another/file.py", line 123, in another_function',
      '    raise ValueError("Invalid parameter value provided")',
    ],
  };

  const mockErrorWithoutTraceback: ErrorObject = {
    error_class: "RuntimeError",
    message: "Something went wrong",
    traceback: undefined,
  };

  const mockErrorWithEmptyTraceback: ErrorObject = {
    error_class: "TypeError",
    message: "Type mismatch",
    traceback: [],
  };

  beforeEach(() => {
    // Clear any mocks between tests
  });

  describe("Default collapsed state", () => {
    it("should render error message without showing traceback initially", () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      // Error message should be visible
      expect(screen.getByText("ValueError occurred:")).toBeInTheDocument();
      expect(screen.getByText("Invalid parameter value provided")).toBeInTheDocument();

      // Traceback content should exist but be collapsed
      const tracebackContent = screen.getByTestId("traceback-content");
      expect(tracebackContent).toBeInTheDocument();

      // MUI Collapse wraps content - traverse up to find the root
      // Structure: content -> wrapperInner -> wrapper -> root
      const collapseRoot = tracebackContent.parentElement?.parentElement?.parentElement;
      expect(collapseRoot).toHaveClass("MuiCollapse-root");
    });

    it("should show chevron right icon when collapsed", () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      expect(screen.getByTestId("chevron-right-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("expand-more-icon")).not.toBeInTheDocument();
    });

    it("should display traceback toggle button", () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      const toggleButton = screen.getByTestId("traceback-toggle");
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute("role", "button");
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
      expect(toggleButton).toHaveAttribute("aria-label", "Toggle error traceback");
    });
  });

  describe("Expand on click", () => {
    it("should expand traceback when header is clicked", async () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      const toggleButton = screen.getByTestId("traceback-toggle");

      // Click to expand
      fireEvent.click(toggleButton);

      // Wait for MUI Collapse animation
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
      });

      // Traceback content should become visible
      const tracebackContent = screen.getByTestId("traceback-content");
      await waitFor(() => {
        // Verify the collapse root has entered state
        // Structure: content -> wrapperInner -> wrapper -> root
        const collapseRoot = tracebackContent.parentElement?.parentElement?.parentElement;
        expect(collapseRoot).toHaveClass("MuiCollapse-entered");
      });

      // Verify traceback lines are visible (using flexible text matcher)
      expect(screen.getByText(/File "\/path\/to\/file\.py", line 42, in function_name/)).toBeInTheDocument();
      expect(screen.getByText(/some_code_here\(\)/)).toBeInTheDocument();
    });

    it("should change icon to expand more when expanded", async () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      const toggleButton = screen.getByTestId("traceback-toggle");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId("expand-more-icon")).toBeInTheDocument();
        expect(screen.queryByTestId("chevron-right-icon")).not.toBeInTheDocument();
      });
    });
  });

  describe("Collapse on second click", () => {
    it("should collapse traceback when clicked again", async () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      const toggleButton = screen.getByTestId("traceback-toggle");

      // First click - expand
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
      });

      // Second click - collapse
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");
      });

      // Traceback should be hidden again
      const tracebackContent = screen.getByTestId("traceback-content");
      await waitFor(() => {
        // Verify the collapse root has exited state (no longer has entered class)
        // Structure: content -> wrapperInner -> wrapper -> root
        const collapseRoot = tracebackContent.parentElement?.parentElement?.parentElement;
        expect(collapseRoot).not.toHaveClass("MuiCollapse-entered");
      });
    });

    it("should change icon back to chevron right when collapsed", async () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      const toggleButton = screen.getByTestId("traceback-toggle");

      // Expand
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(screen.getByTestId("expand-more-icon")).toBeInTheDocument();
      });

      // Collapse
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(screen.getByTestId("chevron-right-icon")).toBeInTheDocument();
        expect(screen.queryByTestId("expand-more-icon")).not.toBeInTheDocument();
      });
    });
  });

  describe("Clickable area", () => {
    it("should toggle when clicking anywhere on the header", async () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      const toggleButton = screen.getByTestId("traceback-toggle");

      // Click on the toggle button (entire header area)
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("should toggle when clicking on the label text", async () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      const toggleButton = screen.getByTestId("traceback-toggle");
      const label = screen.getByText("Show error traceback:");

      // Click on the label (which is inside the toggle button)
      fireEvent.click(label);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
      });
    });
  });

  describe("No traceback scenarios", () => {
    it("should not render traceback section when traceback is undefined", () => {
      render(<ResultsError errorObject={mockErrorWithoutTraceback} />);

      // Error message should be visible
      expect(screen.getByText("RuntimeError occurred:")).toBeInTheDocument();
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Traceback toggle should not exist
      expect(screen.queryByTestId("traceback-toggle")).not.toBeInTheDocument();
      expect(screen.queryByTestId("traceback-content")).not.toBeInTheDocument();
    });

    it("should not render traceback section when traceback is empty array", () => {
      render(<ResultsError errorObject={mockErrorWithEmptyTraceback} />);

      // Error message should be visible
      expect(screen.getByText("TypeError occurred:")).toBeInTheDocument();
      expect(screen.getByText("Type mismatch")).toBeInTheDocument();

      // Traceback toggle should not exist
      expect(screen.queryByTestId("traceback-toggle")).not.toBeInTheDocument();
      expect(screen.queryByTestId("traceback-content")).not.toBeInTheDocument();
    });
  });

  describe("Multiple traceback lines", () => {
    it("should render all traceback lines when expanded", async () => {
      render(<ResultsError errorObject={mockErrorWithTraceback} />);

      const toggleButton = screen.getByTestId("traceback-toggle");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
      });

      // All traceback lines should be present (use flexible text matcher for lines with leading spaces)
      expect(screen.getByText(/File "\/path\/to\/file\.py", line 42, in function_name/)).toBeInTheDocument();
      expect(screen.getByText(/some_code_here\(\)/)).toBeInTheDocument();
      expect(screen.getByText(/File "\/another\/file\.py", line 123, in another_function/)).toBeInTheDocument();
      expect(screen.getByText(/raise ValueError\("Invalid parameter value provided"\)/)).toBeInTheDocument();
    });

    it("should handle single line traceback", async () => {
      const singleLineError: ErrorObject = {
        error_class: "Error",
        message: "Test error",
        traceback: ["Single line traceback"],
      };

      render(<ResultsError errorObject={singleLineError} />);

      const toggleButton = screen.getByTestId("traceback-toggle");
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText("Single line traceback")).toBeInTheDocument();
      });
    });
  });

});
