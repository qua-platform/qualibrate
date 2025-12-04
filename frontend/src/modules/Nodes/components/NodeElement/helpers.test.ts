import { describe, it, expect } from "vitest";
import { getNodeRowClass } from "./helpers";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "./NodeElement.module.scss";

describe("getNodeRowClass", () => {
  it("should highlight running node with animation", () => {
    const result = getNodeRowClass({
      nodeName: "test_cal",
      selectedItemName: "other_node",
      runStatus: { name: "test_cal", status: "running" }
    });

    expect(result).toContain(styles.nodeSelectedRunning);
    expect(result).toContain(styles.highlightRunningRow);
    expect(result).toContain(styles.rowWrapper);
  });

  it("should show error state for failed node", () => {
    const result = getNodeRowClass({
      nodeName: "test_cal",
      selectedItemName: "test_cal",
      runStatus: { name: "test_cal", status: "error" }
    });

    expect(result).toContain(styles.nodeSelectedError);
    expect(result).toContain(styles.rowWrapper);
  });

  it("should show finished state with success styling", () => {
    const result = getNodeRowClass({
      nodeName: "test_cal",
      selectedItemName: "test_cal",
      runStatus: { name: "test_cal", status: "finished" }
    });

    expect(result).toContain(styles.nodeSelectedFinished);
    expect(result).toContain(styles.rowWrapper);
  });

  it("should show pending state for selected node without execution", () => {
    const result = getNodeRowClass({
      nodeName: "test_cal",
      selectedItemName: "test_cal",
      runStatus: null
    });

    expect(result).toContain(styles.nodeSelectedPending);
    expect(result).toContain(styles.rowWrapper);
  });

  it("should return only base class when not selected and no status", () => {
    const result = getNodeRowClass({
      nodeName: "test_cal",
      selectedItemName: "other_node",
      runStatus: null
    });

    expect(result).toBe(styles.rowWrapper);
  });

  it("should prioritize running status when node is running", () => {
    // Even if selected, running status takes priority
    const result = getNodeRowClass({
      nodeName: "test_cal",
      selectedItemName: "test_cal",
      runStatus: { name: "test_cal", status: "running" }
    });

    expect(result).toContain(styles.nodeSelectedRunning);
    expect(result).not.toContain(styles.nodeSelectedPending);
  });

  it("should handle undefined status in runStatus", () => {
    const result = getNodeRowClass({
      nodeName: "test_cal",
      selectedItemName: "test_cal",
      runStatus: { name: "test_cal", status: undefined }
    });

    // When status is undefined, treated as pending since isLastRun is true
    expect(result).toContain(styles.rowWrapper);
  });

  it("should return base class when runStatus is for different node", () => {
    const result = getNodeRowClass({
      nodeName: "test_cal",
      selectedItemName: "test_cal",
      runStatus: { name: "other_node", status: "running" }
    });

    // Not the last run node, but is selected, so should be pending
    expect(result).toContain(styles.nodeSelectedPending);
  });
});
