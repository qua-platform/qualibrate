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
import { EdgeProps, Position, ReactFlow } from "@xyflow/react";
import { BasicDialogProps } from "../../../../../../common/ui-components/common/BasicDialog/BasicDialog";
import React from "react";

// Mock BasicDialog to simplify
vi.mock("../../../../../common/ui-components/common/BasicDialog/BasicDialog", () => ({
  BasicDialog: ({ open, description, onClose }: BasicDialogProps) =>
    open ? (
      <div data-testid="dialog">
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
  source: "",
  sourcePosition: Position.Left,
  target: "",
  targetPosition: Position.Right,
  type: undefined,
  id: "edge1",
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

    const dialogContentElement = screen.getByTestId("dialog-content-text");
    expect(dialogContentElement).toBeInTheDocument();
    expect(dialogContentElement).toHaveTextContent("Dialog text");
  });

  it("uses default label text when missing", () => {
    const props = { ...defaultProps, data: {} };
    render(<ConditionalEdge {...props} />);

    expect(screen.getByText("Condition")).toBeInTheDocument();
  });
});
