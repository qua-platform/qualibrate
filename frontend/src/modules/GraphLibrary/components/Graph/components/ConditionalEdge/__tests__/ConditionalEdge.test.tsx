/**
 * @fileoverview Unit tests for ConditionalEdge component.
 *
 * Tests:
 * - rendering of edge path
 * - rendering of condition label
 * - clicking the label opens BasicDialog
 * - closing the dialog resets state
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ConditionalEdge from "../ConditionalEdge";
import { ConditionalEdgePopUpProps } from "../ConditionalEdgePopUp";
import { EdgeProps, Position, ReactFlow } from "@xyflow/react";
import React from "react";

// Mock ConditionalEdgePopUp to simplify
vi.mock(".../ConditionalEdgePopUp", () => ({
  ConditionalEdgePopUp: ({ id, source, target, open, label, description, onClose }: ConditionalEdgePopUpProps) =>
    open ? (
      <div data-testid="dialog">
        <div>{id}</div>
        <div>{source}</div>
        <div>{target}</div>
        <div>{label}</div>
        <div>{description}</div>
        <button data-testid="close-dialog" onClick={onClose}>
          close
        </button>
      </div>
    ) : null,
}));

// Mock ReactFlow's useReactFlow hook
const mockFitView = vi.fn();
const mockBezierFn = vi.fn(() => ["M0,0 C10,10 20,20 30,30", 50, 60]);
vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual("@xyflow/react");

  return {
    ...actual,
    useReactFlow: () => ({
      fitView: mockFitView,
      getBezierPath: mockBezierFn,
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      setViewport: vi.fn(),
    }),
  };
});

const defaultProps: EdgeProps = {
  animated: undefined,
  deletable: undefined,
  selectable: undefined,
  selected: undefined,
  source: "1",
  sourcePosition: Position.Left,
  target: "2",
  targetPosition: Position.Right,
  type: undefined,
  id: "node1->node2",
  data: { connect: true, condition_label: "Test Condition", condition_description: "Dialog text" },
  sourceX: 0,
  sourceY: 0,
  targetX: 10,
  targetY: 10,
  markerEnd: undefined,
  style: { stroke: "red" },
};

describe("ConditionalEdge - Unit Tests", () => {
  beforeEach(() => {
    mockFitView.mockClear();
    mockBezierFn.mockClear();
  });

  it("renders ConditionalEdge ", () => {
    const { container } = render(
      <ReactFlow>
        <ConditionalEdge {...defaultProps} />
      </ReactFlow>
    );
    const renderer = container.querySelector(".react-flow__edgelabel-renderer");
    expect(renderer).not.toBeNull();
    expect(renderer?.children.length).toBeGreaterThan(0);
  });

  it("renders ConditionalEdge with condition label", () => {
    render(
      <ReactFlow>
        <ConditionalEdge {...defaultProps} />
      </ReactFlow>
    );

    expect(screen.getByText("Test Condition")).toBeInTheDocument();
  });

  it("opens BasicDialog when label is clicked", () => {
    render(
      <ReactFlow>
        <ConditionalEdge {...defaultProps} />
      </ReactFlow>
    );
    fireEvent.click(screen.getByText("Test Condition"));
    const sourceName = "node1";
    const targetName = "node2";
    const dialogContentElement = screen.getByTestId("conditional-edge-pop-up-content");
    // const sourceNodeElement = screen.getByText(sourceName);
    // const targetNodeElement = screen.getByText(targetName);
    expect(dialogContentElement).toBeInTheDocument();
    expect(dialogContentElement).toHaveTextContent("Dialog text");
    expect(dialogContentElement).toHaveTextContent(sourceName);
    expect(dialogContentElement).toHaveTextContent(targetName);
  });

  it("uses default label text when missing", () => {
    const props = { ...defaultProps, data: {} };
    render(
      <ReactFlow>
        <ConditionalEdge {...props} />
      </ReactFlow>
    );

    expect(screen.getByText("Condition")).toBeInTheDocument();
  });
});
