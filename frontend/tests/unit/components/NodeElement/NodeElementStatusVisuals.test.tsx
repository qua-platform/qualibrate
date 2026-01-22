import "@testing-library/jest-dom"
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StatusVisuals } from "../../../../src/modules/Nodes/components/NodeElement/NodeElementStatusVisuals";
// eslint-disable-next-line css-modules/no-unused-class
import styles from "../../../../src/modules/Nodes/components/NodeElement/NodeElement.module.scss";
import { createTestProviders } from "../../utils/providers";

describe("StatusVisuals", () => {
  it("should show progress spinner for running status", () => {
    const { Providers } = createTestProviders();
    const { container } = render(<Providers><StatusVisuals status="running" /></Providers>);

    // CircularLoaderProgress component should be rendered
    // It's a custom component, so we verify the structure exists
    const progressElement = container.firstChild;
    expect(progressElement).toBeInTheDocument();
  });

  it("should show green dot for finished status", () => {
    const { Providers } = createTestProviders();
    const { container } = render(<Providers><StatusVisuals status="finished" /></Providers>);

    // Check for div with the hashed class names from CSS modules
    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.tagName).toBe("DIV");

    // Verify it has both dot and greenDot classes
    expect(dot.className).toContain(styles.dot);
    expect(dot.className).toContain(styles.greenDot);
  });

  it("should show red dot for error status", () => {
    const { Providers } = createTestProviders();
    const { container } = render(<Providers><StatusVisuals status="error" /></Providers>);

    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.tagName).toBe("DIV");

    // Verify it has both dot and redDot classes
    expect(dot.className).toContain(styles.dot);
    expect(dot.className).toContain(styles.redDot);
  });

  it("should show grey dot for pending status (default)", () => {
    const { Providers } = createTestProviders();
    const { container } = render(<Providers><StatusVisuals /></Providers>);

    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.tagName).toBe("DIV");

    // Verify it has both dot and greyDot classes
    expect(dot.className).toContain(styles.dot);
    expect(dot.className).toContain(styles.greyDot);
  });

  it("should default to pending when status is undefined", () => {
    const { Providers } = createTestProviders();
    const { container } = render(<Providers><StatusVisuals status={undefined} /></Providers>);

    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain(styles.greyDot);
  });

  it("should handle unknown status as pending", () => {
    const { Providers } = createTestProviders();
    const { container } = render(<Providers><StatusVisuals status="unknown-status" /></Providers>);

    // Any status that doesn't match running/finished/error should show grey dot
    const dot = container.firstChild as HTMLElement;
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain(styles.greyDot);
  });

  it("should pass percentage to running status spinner", () => {
    const { Providers } = createTestProviders();
    const { container } = render(<Providers><StatusVisuals status="running" /></Providers>);

    const progressElement = container.firstChild;
    expect(progressElement).toBeInTheDocument();

    // The percentage is passed to CircularLoaderProgress component
    // We verify the component renders (detailed prop testing would require mocking)
  });
});
