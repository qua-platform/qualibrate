import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import SortButton from "../../../../src/components/SortButton/SortButton";
import "@testing-library/jest-dom";

// ================= MOCK ICON =================
vi.mock("../../../../src/components/Icons", () => ({
    SortIcon: () => <svg data-testid="sort-icon"/>,
}));

// ================= MOCK HOOK =================
vi.mock("../../../../src/utils/hooks/useClickOutside", () => ({
    default: (_: () => void) => ({current: null}),
}));

// ================= TEST DATA =================
const options = [
    {label: "Date (Newest first)", value: "date"},
    {label: "Name (A-Z)", value: "name"},
    {label: "Result (Success First)", value: "result"},
];

// ================= TEST SUITE =================
describe("SortButton", () => {
    it("renders SortButton with default option", () => {
        const mockOnSelect = vi.fn();

        render(<SortButton options={options} onSelect={mockOnSelect}/>);

        // Check main button exists
        const button = screen.getByTestId("sort-button").firstChild!;
        expect(button).toBeInTheDocument();

        // Check SortIcon is rendered
        expect(screen.getByTestId("sort-icon")).toBeInTheDocument();

        // Check dropdown exists (but closed)
        const dropdown = screen.getByTestId("sort-button").querySelector("div:nth-child(2)")!;
        expect(dropdown).toBeInTheDocument();
        expect(dropdown.className).toContain("sortDropdown"); // works with CSS Modules
    });

    it("opens dropdown on button click", () => {
        const mockOnSelect = vi.fn();
        render(<SortButton options={options} onSelect={mockOnSelect}/>);

        const button = screen.getByTestId("sort-button").firstChild!;
        fireEvent.click(button);

        // Verify all options are displayed
        options.forEach((opt) => {
            expect(screen.getByText(opt.label)).toBeInTheDocument();
        });
    });

    it("selects an option and calls onSelect callback", () => {
        const mockOnSelect = vi.fn();
        render(<SortButton options={options} onSelect={mockOnSelect}/>);

        const button = screen.getByTestId("sort-button").firstChild!;
        fireEvent.click(button);

        // Click on the "Name (A-Z)" option
        const option = screen.getByText("Name (A-Z)");
        fireEvent.click(option);

        // onSelect called with correct value
        expect(mockOnSelect).toHaveBeenCalledWith("name");

        // Dropdown should close after selection
        const dropdown = screen.getByTestId("sort-button").querySelector("div:nth-child(2)")!;
        expect(dropdown.className).not.toContain("active");
    });

    it("updates selectedOption correctly when an option is clicked", () => {
        const mockOnSelect = vi.fn();
        render(<SortButton options={options} onSelect={mockOnSelect}/>);

        const button = screen.getByTestId("sort-button").firstChild!;
        fireEvent.click(button);

        const option = screen.getByText("Result (Success First)");
        fireEvent.click(option);

        // The clicked option should now be the selected one
        const selectedOptionDiv = screen.getByText("Result (Success First)");
        expect(selectedOptionDiv.className).toContain("selected");
    });
});
