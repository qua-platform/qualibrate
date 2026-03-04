import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestConnectionModal } from "../../../../src/modules/SidebarMenu/AddEditProjectModal/components";

describe("TestConnectionModal", () => {
  const mockHandleOnClose = vi.fn();

  const mockDatabase = {
    is_connected: false,
    host: "localhost",
    port: 5432,
    database: "db",
    username: "user",
    password: "pass",
  };

  it("renders success message when isSuccessful=true", () => {
    render(<TestConnectionModal isVisible={true} isSuccessful={true} handleOnClose={mockHandleOnClose} database={mockDatabase} />);

    const modal = screen.getByTestId("test-connection-modal");
    expect(modal).toBeInTheDocument();

    expect(screen.getByText("Connection Successful")).toBeInTheDocument();

    expect(
      screen.getByText(`Successfully connected to database "${mockDatabase.database}" at ${mockDatabase.host}:${mockDatabase.port}`)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("OK"));
    expect(mockHandleOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders error message when isSuccessful=false", () => {
    render(<TestConnectionModal isVisible={true} isSuccessful={false} handleOnClose={mockHandleOnClose} />);

    const modal = screen.getByTestId("test-connection-modal");
    expect(modal).toBeInTheDocument();

    expect(screen.getByText("Connection Failed")).toBeInTheDocument();

    expect(
      screen.getByText("Unable to connect to database. Please check your credentials and ensure the database server is running.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("OK"));
    expect(mockHandleOnClose).toHaveBeenCalledTimes(1);
  });

  it("does not render modal when isVisible=false", () => {
    render(<TestConnectionModal isVisible={false} isSuccessful={true} handleOnClose={mockHandleOnClose} />);

    expect(screen.queryByTestId("test-connection-modal")).not.toBeInTheDocument();
  });
});