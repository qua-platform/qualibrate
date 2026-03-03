import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import ProjectMenuItemWrapper from "../../../../src/modules/SidebarMenu/ProjectMenuItemWrapper/ProjectMenuItemWrapper";

describe("ProjectMenuItemWrapper", () => {
  const renderComponent = (props = {}) => {
    const defaultProps = {
      dataTestId: "menu-item",
      title: "Test Title",
      isDisabled: false,
      classNames: "test-class",
      icon: <svg data-testid="icon" />,
      onClickHandler: vi.fn(),
    };

    return render(<ProjectMenuItemWrapper {...defaultProps} {...props} />);
  };

  it("renders title", () => {
    renderComponent();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders icon", () => {
    renderComponent();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies data-testid", () => {
    renderComponent();
    expect(screen.getByTestId("menu-item")).toBeInTheDocument();
  });

  it("applies classNames", () => {
    renderComponent();
    expect(screen.getByTestId("menu-item")).toHaveClass("test-class");
  });

  it("calls onClickHandler when clicked and not disabled", () => {
    const onClick = vi.fn();
    renderComponent({ onClickHandler: onClick });

    fireEvent.click(screen.getByTestId("menu-item"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClickHandler when disabled", () => {
    const onClick = vi.fn();
    renderComponent({ isDisabled: true, onClickHandler: onClick });

    fireEvent.click(screen.getByTestId("menu-item"));

    expect(onClick).not.toHaveBeenCalled();
  });
});