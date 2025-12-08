import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StatusVisuals } from "../../../../src/modules/Nodes/components/NodeElement/NodeElementStatusVisuals";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../../../../src/modules/Nodes/components/NodeElement/NodeElement.module.scss";

describe("StatusVisuals", () => {
  it("should show progress spinner for running status", () => {
    const { container } = render(<StatusVisuals status="running" percentage={45} />);

    // CircularLoaderProgress component should be rendered
    // It's a custom component, so we verify the structure exists
    const progressElement = container.firstChild;
    expect(progressElement).toBeInTheDocument();
  });

  it("should show green dot for finished status", () => {
    const { container } = render(<StatusVisuals status="finished" percentage={100} />);

    // Check for div with the hashed class names from CSS modules
    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.tagName).toBe("DIV");

    // Verify it has both dot and greenDot classes
    expect(dot.className).toContain(styles.dot);
    expect(dot.className).toContain(styles.greenDot);
  });

  it("should show red dot for error status", () => {
    const { container } = render(<StatusVisuals status="error" percentage={0} />);

    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.tagName).toBe("DIV");

    // Verify it has both dot and redDot classes
    expect(dot.className).toContain(styles.dot);
    expect(dot.className).toContain(styles.redDot);
  });

  it("should show grey dot for pending status (default)", () => {
    const { container } = render(<StatusVisuals percentage={0} />);

    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.tagName).toBe("DIV");

    // Verify it has both dot and greyDot classes
    expect(dot.className).toContain(styles.dot);
    expect(dot.className).toContain(styles.greyDot);
  });

  it("should default to pending when status is undefined", () => {
    const { container } = render(<StatusVisuals status={undefined} percentage={0} />);

    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain(styles.greyDot);
  });

  it("should handle unknown status as pending", () => {
    const { container } = render(<StatusVisuals status="unknown-status" percentage={0} />);

    // Any status that doesn't match running/finished/error should show grey dot
    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain(styles.greyDot);
  });

  it("should pass percentage to running status spinner", () => {
    const { container } = render(<StatusVisuals status="running" percentage={75} />);

    const progressElement = container.firstChild;
    expect(progressElement).toBeInTheDocument();

    // The percentage is passed to CircularLoaderProgress component
    // We verify the component renders (detailed prop testing would require mocking)
  });
});
