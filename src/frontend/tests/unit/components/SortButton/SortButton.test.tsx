import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import SortButton from "../../../../src/components/SortButton/SortButton";

// ================= MOCK ICON =================
// Mock the SortIcon to avoid rendering actual SVG
vi.mock("../../../../src/components/Icons", () => ({
  SortIcon: () => <svg data-testid="sort-icon" />,
}));

// ================= MOCK HOOK =================
// Mock useClickOutside to avoid actual DOM event listeners
vi.mock("../../../../src/utils/hooks/useClickOutside", () => ({
  default: (callback: () => void) => ({
    current: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  }),
}));

// ================= TEST SUITE =================
describe("SortButton", () => {
  it("renders SortButton with default option", () => {
    const mockOnSelect = vi.fn();

    render(<SortButton onSelect={mockOnSelect} />);

    // Check that the main button container exists
    const button = screen.getByTestId("sort-button").firstChild!;
    expect(button).toBeInTheDocument();

    // Check that the SortIcon is rendered
    expect(screen.getByTestId("sort-icon")).toBeInTheDocument();

    // Check that the dropdown exists but is not active
    const dropdown = screen.getByText("Date (Newest first)").parentElement;
    expect(dropdown).toBeInTheDocument();
    expect(dropdown?.className).toContain("sortDropdown"); // works with CSS Modules
  });

  it("opens dropdown on click", () => {
    const mockOnSelect = vi.fn();
    render(<SortButton onSelect={mockOnSelect} />);

    // Click on the button to toggle the dropdown
    const button = screen.getByTestId("sort-button").firstChild!;
    fireEvent.click(button);

    // Verify that all default options are displayed
    expect(screen.getByText("Date (Newest first)")).toBeInTheDocument();
    expect(screen.getByText("Name (A-Z)")).toBeInTheDocument();
    expect(screen.getByText("Result (Success First)")).toBeInTheDocument();
  });

  it("selects an option and calls onSelect callback", () => {
    const mockOnSelect = vi.fn();
    render(<SortButton onSelect={mockOnSelect} />);

    // Open dropdown
    const button = screen.getByTestId("sort-button").firstChild!;
    fireEvent.click(button);

    // Click on the "Name (A-Z)" option
    const option = screen.getByText("Name (A-Z)");
    fireEvent.click(option);

    // onSelect should be called with the selected option
    expect(mockOnSelect).toHaveBeenCalledWith("Name (A-Z)");

    // Dropdown should close after selection
    expect(option.parentElement).not.toHaveClass("active");
  });
});
