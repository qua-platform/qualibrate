import React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {afterEach, describe, expect, it, vi} from "vitest";
import AppliedFilterLabel from "../../../../src/components/AppliedFilterLabel/AppliedFilterLabel";

describe("AppliedFilterLabel", () => {
    const mockOnRemove = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders label and value when label is provided", () => {
        render(<AppliedFilterLabel label="Date" value="Last 7 days" onRemove={mockOnRemove} showDot/>);

        expect(screen.getByText("Date")).toBeInTheDocument();
        expect(screen.getByText("Last 7 days")).toBeInTheDocument();

        // Dot should also render because showDot is true
        expect(screen.getByTestId("filter-dot")).toBeInTheDocument();
    });

    it("renders dot when showDot is true", () => {
        render(<AppliedFilterLabel value="Today" onRemove={mockOnRemove} showDot/>);

        // Label should not be rendered
        expect(screen.queryByText("Date")).not.toBeInTheDocument();

        // Dot indicator should be rendered
        expect(screen.getByTestId("filter-dot")).toBeInTheDocument();

        // Value should still be rendered
        expect(screen.getByText("Today")).toBeInTheDocument();
    });

    it("renders remove button", () => {
        render(<AppliedFilterLabel label="Status" value="Active" onRemove={mockOnRemove}/>);

        const removeButton = screen.getByText("×");
        expect(removeButton).toBeInTheDocument();
    });

    it("calls onRemove when remove button is clicked", () => {
        render(<AppliedFilterLabel label="Type" value="Manual" onRemove={mockOnRemove}/>);

        const removeButton = screen.getByText("×");
        fireEvent.click(removeButton);

        expect(mockOnRemove).toHaveBeenCalledTimes(1);
    });

    it("applies custom dotColor", () => {
        render(
            <AppliedFilterLabel value="Custom Color" onRemove={mockOnRemove} showDot dotColor="#ABCDEF"/>
        );

        const dot = screen.getByTestId("filter-dot");
        expect(dot).toHaveStyle({backgroundColor: "#ABCDEF"});
    });
});
