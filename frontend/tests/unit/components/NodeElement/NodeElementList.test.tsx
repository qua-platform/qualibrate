import "@testing-library/jest-dom"
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { NodeMap } from "../../../../src/modules/Nodes";
import { useRootDispatch } from "../../../../src/stores";
import { setAllNodes } from "../../../../src/stores/NodesStore";
import { createTestProviders } from "../../utils/providers";
import { NodeElementList } from "../../../../src/modules/Nodes/components/NodeElement/NodeElementList";
import { ParameterTypes } from "../../../../src/components/Parameters/Parameters";

// Helper component to set nodes in context
const NodesSetter: React.FC<{ nodes: NodeMap }> = ({ nodes }) => {
  const dispatch = useRootDispatch();

  // Set nodes immediately
  React.useEffect(() => {
    dispatch(setAllNodes(nodes));
  }, [nodes, setAllNodes]);

  return null;
};

// Test wrapper that sets up nodes via context
const TestWrapper: React.FC<{ children: React.ReactNode; nodes?: NodeMap }> = ({ children, nodes }) => {
  const { Providers } = createTestProviders();

  return <Providers>
    {nodes && <NodesSetter nodes={nodes} />}
    {children}
  </Providers>;
};

describe("NodeElementList", () => {
  it("should render list of nodes when allNodes is populated", () => {
    const mockNodes = {
      test_cal: {
        name: "test_cal",
        title: "Test Calibration",
        description: "Test node",
        parameters: {}
      },
      qubit_spec: {
        name: "qubit_spec",
        title: "Qubit Spectroscopy",
        description: "Qubit node",
        parameters: {}
      }
    };

    render(
      <TestWrapper nodes={mockNodes}>
        <NodeElementList />
      </TestWrapper>
    );

    // Verify the list wrapper is rendered
    expect(screen.getByTestId("node-list-wrapper")).toBeInTheDocument();

    // Verify both nodes are rendered
    expect(screen.getByTestId("node-element-test_cal")).toBeInTheDocument();
    expect(screen.getByTestId("node-element-qubit_spec")).toBeInTheDocument();
  });

  it("should render empty list when nodes object is empty", () => {
    const { Providers } = createTestProviders({ allNodes: {} });
    const { container } = render(
      <Providers>
        <NodeElementList />
      </Providers>
    );

    // List wrapper should still be rendered
    expect(screen.getByTestId("node-list-wrapper")).toBeInTheDocument();

    // No node elements should be present
    const nodeElements = container.querySelectorAll('[data-testid^="node-element-"]');
    expect(nodeElements.length).toBe(0);
  });

  it("should render single node correctly", () => {
    const mockNodes = {
      single_node: {
        name: "single_node",
        title: "Single Node",
        description: "A single test node",
        parameters: {
          param1: {
            default: "value1",
            title: "Parameter 1",
            type: "string" as ParameterTypes,
            is_targets: false
          }
        }
      }
    };

    render(
      <TestWrapper nodes={mockNodes}>
        <NodeElementList />
      </TestWrapper>
    );

    expect(screen.getByTestId("node-element-single_node")).toBeInTheDocument();
  });
});
