/**
 * @fileoverview Unit tests for ConditionalEdge component.
 *
 * Tests:
 * - rendering of edge path
 * - rendering of condition label
 * - clicking the label opens BasicDialog
 * - closing the dialog resets state
 */
import "@testing-library/jest-dom";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import ConditionalEdge, {
  ConditionalEdgeProps
} from "../../../../src/modules/Graph/components/ConditionalEdge/ConditionalEdge";
import {Position, ReactFlow} from "@xyflow/react";
import React from "react";
import {ConditionalEdgePopUpProps} from "../../../../src/modules/Graph/components/EdgePopup/EdgePopUp";

// Mock ConditionalEdgePopUp to simplify
vi.mock("../ConditionalEdgePopUp", () => ({
  default: ({ source, target, open, label, description, onClose }: ConditionalEdgePopUpProps) =>
    open ? (
      <div data-testid="conditional-edge-pop-up-content">
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
vi.mock("@xyflow/react", () => ({
  BaseEdge: () => <div data-testid="base-edge" />,

  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <div className="react-flow__edgelabel-renderer">{children}</div>,

  getBezierPath: () => ["M0,0 C10,10 20,20 30,30", 50, 60],

  Position: {
    Left: "left",
    Right: "right",
  },

  ReactFlow: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const defaultProps: ConditionalEdgeProps = {
  animated: undefined,
  deletable: undefined,
  selectable: undefined,
  selected: undefined,
  id: "node1->node2",
  source: "node1",
  sourcePosition: Position.Left,
  target: "node2",
  targetPosition: Position.Right,
  type: undefined,
  data: {
    condition: {
      label: "test-condition",
      content: "Dialog text",
    },
  },
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

    expect(screen.getByText("test-condition")).toBeInTheDocument();
  });

  // it("when label is clicked calls onConditionClick to open ConditionalEdgePopUp", () => {
  //   const onConditionClick = vi.fn();
  //   render(
  //     <ReactFlow>
  //       <ConditionalEdge {...defaultProps} onConditionClick={onConditionClick} />
  //     </ReactFlow>
  //   );
  //   fireEvent.click(screen.getByTestId("conditional-edge-test-condition"));

  //   expect(onConditionClick).toHaveBeenCalledTimes(1);
  //   expect(onConditionClick).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       id: "node1->node2",
  //       source: "node1",
  //       target: "node2",
  //     })
  //   );
  // });

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
