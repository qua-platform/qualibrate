import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormInputFieldWithLabel } from "../../../../src/modules/SidebarMenu/AddEditProjectModal/components";

describe("FormInputFieldWithLabel", () => {
  const mockHandleChange = vi.fn();

  const defaultProps = {
    dataTestId: "input-field",
    labelText: "Username",
    placeholder: "Enter username",
    inputType: "text" as const,
    value: "",
    isDisabled: false,
    isRequired: true,
    handleChange: mockHandleChange,
  };

  it("renders label and input correctly", () => {
    render(<FormInputFieldWithLabel {...defaultProps} />);

    const wrapper = screen.getByTestId("input-field");
    expect(wrapper).toBeInTheDocument();

    // Label text
    expect(screen.getByText("Username")).toBeInTheDocument();

    // Required star
    expect(wrapper.querySelector("span")).toHaveTextContent("*");

    // Input field
    const input = screen.getByTestId("input-field-input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.placeholder).toBe("Enter username");
    expect(input.type).toBe("text");
    expect(input.disabled).toBe(false);
    expect(input.required).toBe(true);
  });

  it("renders subLabelText and tooltip if provided", () => {
    render(<FormInputFieldWithLabel {...defaultProps} subLabelText="Optional info" tooltipText="Tooltip info" />);

    expect(screen.getByText("Optional info")).toBeInTheDocument();

    const tooltip = screen.getByTitle("Tooltip info");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.querySelector("svg")).toBeInTheDocument();
  });

  it("calls handleChange with field name and value when input changes", () => {
    const mockHandleChange = vi.fn();

    render(
      <FormInputFieldWithLabel
        dataTestId="add-edit-project-modal-calibration-path"
        classNames=""
        labelText="Calibration library path"
        placeholder="C:\\Projects\\my_project\\calibration"
        inputType="text"
        value=""
        isDisabled={false}
        isRequired={false}
        handleChange={(e) => mockHandleChange("calibrationPath", e.target.value)}
      />
    );

    const input = screen.getByTestId("add-edit-project-modal-calibration-path-input");

    fireEvent.change(input, { target: { value: "new value" } });

    expect(mockHandleChange).toHaveBeenCalledTimes(1);
    expect(mockHandleChange).toHaveBeenCalledWith("calibrationPath", "new value");
  });
  it("renders input as disabled when isDisabled=true", () => {
    render(<FormInputFieldWithLabel {...defaultProps} isDisabled={true} />);

    const input = screen.getByTestId("input-field-input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});