import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NodeElement } from "./NodeElement";
import { createTestProviders } from "@/test-utils/providers";
import * as NodesAPI from "../../api/NodesAPI";

// Mock the NodesApi
vi.mock("../../api/NodesAPI");

describe("NodeElement - Parameter Management", () => {
  const mockNode = {
    name: "test_cal",
    title: "Test Calibration",
    description: "Test description",
    parameters: {
      resonator: {
        default: "q1.resonator",
        title: "Resonator",
        type: "string"
      },
      sampling_points: {
        default: 100,
        title: "Sampling Points",
        type: "number"
      },
      enable_fitting: {
        default: true,
        title: "Enable Fitting",
        type: "boolean"
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render node with title", () => {
    const Providers = createTestProviders();

    render(
      <Providers>
        <NodeElement nodeKey="test_cal" node={mockNode} />
      </Providers>
    );

    expect(screen.getByTestId("title-or-name-test_cal")).toHaveTextContent("Test Calibration");
  });

  it("should show parameters when node is selected", async () => {
    const Providers = createTestProviders();

    render(
      <Providers>
        <NodeElement nodeKey="test_cal" node={mockNode} />
      </Providers>
    );

    // Click on the node to select it
    fireEvent.click(screen.getByTestId("node-element-test_cal"));

    // Parameters should now be visible
    await waitFor(() => {
      expect(screen.getByTestId("node-parameters-wrapper")).toBeInTheDocument();
    });
  });

  it("should insert spaces in long node names", () => {
    const longNameNode = {
      ...mockNode,
      name: "very_long_node_name_that_exceeds_forty_characters_definitely",
      title: "Very Long Node Name That Exceeds Forty Characters Definitely"
    };

    const Providers = createTestProviders();

    render(
      <Providers>
        <NodeElement nodeKey="long_node" node={longNameNode} />
      </Providers>
    );

    const titleElement = screen.getByTestId("title-or-name-long_node");
    // Should have spaces inserted (the insertSpaces function adds spaces every 40 chars)
    expect(titleElement.textContent).toContain(" ");
  });
});

describe("NodeElement - Execution", () => {
  const mockNode = {
    name: "test_cal",
    title: "Test Calibration",
    description: "Test description",
    parameters: {
      resonator: {
        default: "q1.resonator",
        title: "Resonator",
        type: "string"
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show run button when node is selected and nothing is running", async () => {
    const Providers = createTestProviders({
      webSocket: {
        runStatus: {
          is_running: false,
          runnable_type: "node",
          node: null,
          graph: null
        }
      }
    });

    render(
      <Providers>
        <NodeElement nodeKey="test_cal" node={mockNode} />
      </Providers>
    );

    // Select the node
    fireEvent.click(screen.getByTestId("node-element-test_cal"));

    // Run button should be visible
    await waitFor(() => {
      expect(screen.getByTestId("run-button")).toBeInTheDocument();
    });
  });

  it("should display validation error from backend", async () => {
    const mockError = {
      detail: [
        {
          type: "value_error",
          msg: "Invalid resonator format"
        }
      ]
    };

    vi.spyOn(NodesAPI.NodesApi, "submitNodeParameters").mockResolvedValue({
      isOk: false,
      error: mockError
    });

    const Providers = createTestProviders({
      webSocket: {
        runStatus: {
          is_running: false,
          runnable_type: "node",
          node: null,
          graph: null
        }
      }
    });

    render(
      <Providers>
        <NodeElement nodeKey="test_cal" node={mockNode} />
      </Providers>
    );

    // Select node and wait for run button
    fireEvent.click(screen.getByTestId("node-element-test_cal"));
    await waitFor(() => {
      expect(screen.getByTestId("run-button")).toBeInTheDocument();
    });

    // Click run
    fireEvent.click(screen.getByTestId("run-button"));

    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid resonator format/i)).toBeInTheDocument();
    });
  });
});
