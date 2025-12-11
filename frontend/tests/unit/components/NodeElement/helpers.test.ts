import { describe, it, expect } from "vitest";
import { getNodeRowClass } from "../../../../src/modules/Nodes/components/NodeElement/helpers";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../../../../src/modules/Nodes/components/NodeElement/NodeElement.module.scss";

describe("getNodeRowClass", () => {
  it("should highlight running node with animation", () => {
    const result = getNodeRowClass({
      isSelected: true,
      isLastRun: true,
      runStatus: "running"
    });

    expect(result).toContain(styles.nodeSelectedRunning);
    expect(result).toContain(styles.highlightRunningRow);
    expect(result).toContain(styles.rowWrapper);
  });

  it("should show error state for failed node", () => {
    const result = getNodeRowClass({
      isSelected: true,
      isLastRun: true,
      runStatus: "error"
    });

    expect(result).toContain(styles.nodeSelectedError);
    expect(result).toContain(styles.rowWrapper);
  });

  it("should show finished state with success styling", () => {
    const result = getNodeRowClass({
      isSelected: true,
      isLastRun: true,
      runStatus: "finished"
    });

    expect(result).toContain(styles.nodeSelectedFinished);
    expect(result).toContain(styles.rowWrapper);
  });

  it("should show pending state for selected node without execution", () => {
    const result = getNodeRowClass({
      isSelected: true,
      isLastRun: true,
      runStatus: undefined
    });

    expect(result).toContain(styles.nodeSelectedPending);
    expect(result).toContain(styles.rowWrapper);
  });

  it("should return only base class when not selected and no status", () => {
    const result = getNodeRowClass({
      isSelected: false,
      isLastRun: true,
      runStatus: undefined
    });

    expect(result).toBe(styles.rowWrapper);
  });

  it("should prioritize running status when node is running", () => {
    // Even if selected, running status takes priority
    const result = getNodeRowClass({
      isSelected: true,
      isLastRun: true,
      runStatus: "running"
    });

    expect(result).toContain(styles.nodeSelectedRunning);
    expect(result).not.toContain(styles.nodeSelectedPending);
  });

  it("should handle undefined status in runStatus", () => {
    const result = getNodeRowClass({
      isSelected: true,
      isLastRun: true,
      runStatus: undefined
    });

    // When status is undefined, treated as pending since isLastRun is true
    expect(result).toContain(styles.rowWrapper);
  });
});
