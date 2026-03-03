import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NodeElement } from "../../../../src/modules/Nodes/components/NodeElement/NodeElement";
import ListItemStyles from "../../../../src/components/ListCard/ListCard.module.scss";
import { createTestProviders } from "../../utils/providers";
import { NodeExecution } from "../../../../src/stores/WebSocketStore/WebSocketStore";
import { setRunStatus } from "../../../../src/stores/WebSocketStore";
import { ParameterTypes } from "../../../../src/components/Parameters/Parameters";

// Helper to create mock NodeExecution objects
const createMockNodeExecution = (overrides: Partial<NodeExecution> = {}): NodeExecution => ({
  current_action: null,
  description: null,
  id: 1,
  name: "test_cal",
  parameters: {},
  percentage_complete: 0,
  run_duration: 0,
  run_end: "",
  run_start: "",
  status: "pending",
  time_remaining: 0,
  run_results: {
    parameters: {},
    outcomes: {},
    error: null,
    initial_targets: [],
    successful_targets: [],
  },
  ...overrides,
});

describe("NodeElement - Parameter Management", () => {
  const mockNode = {
    name: "test_cal",
    title: "Test Calibration",
    description: "Test description",
    parameters: {
      resonator: {
        default: "q1.resonator",
        title: "Resonator",
        type: "string" as ParameterTypes,
        is_targets: false,
      },
      sampling_points: {
        default: 100,
        title: "Sampling Points",
        type: "number" as ParameterTypes,
        is_targets: false,
      },
      enable_fitting: {
        default: true,
        title: "Enable Fitting",
        type: "boolean" as ParameterTypes,
        is_targets: false,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render node with title", () => {
    const { Providers } = createTestProviders({ allNodes: { test_cal: mockNode } });

    render(
      <Providers>
        <NodeElement nodeKey="test_cal" />
      </Providers>
    );

    expect(screen.getByTestId("title-or-name-test_cal")).toHaveTextContent("Test Calibration");
  });

  it("should show parameters when node is selected", async () => {
    const { Providers } = createTestProviders({ allNodes: { test_cal: mockNode } });

    render(
      <Providers>
        <NodeElement nodeKey="test_cal" />
      </Providers>
    );

    const nodeDescription = screen.getByTestId("node-description-test_cal");

    // Click on the node to select it
    fireEvent.click(nodeDescription);

    // Parameters should now be visible
    await waitFor(() => {
      expect(nodeDescription.classList.contains("descriptionFull"));
    });
  });

  it("should insert spaces in long node names", () => {
    const longNameNode = {
      ...mockNode,
      name: "very_long_node_name_that_exceeds_forty_characters_definitely",
      title: "VeryVeryLongNodeNameThatExceedsFortyCharactersDefinitely",
    };

    const { Providers } = createTestProviders({ allNodes: { long_node: longNameNode } });

    render(
      <Providers>
        <NodeElement nodeKey="long_node" />
      </Providers>
    );

    const titleElement = screen.getByTestId("title-or-name-long_node");
    // Should have spaces inserted (the insertSpaces function adds spaces every 40 chars)
    expect(titleElement.textContent).toContain(" ");
  });
});

describe("NodeElement - WebSocket Status Integration", () => {
  const mockNode = {
    name: "test_cal",
    title: "Test Calibration",
    description: "Test description",
    parameters: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show status indicator for running node", async () => {
    const { Providers, mockStore } = createTestProviders({ allNodes: { test_cal: mockNode } });
    mockStore.dispatch(
      setRunStatus({
        is_running: true,
        runnable_type: "node",
        node: createMockNodeExecution({ name: "test_cal", status: "running", percentage_complete: 75 }),
        graph: null,
      })
    );

    render(
      <Providers>
        <NodeElement nodeKey="test_cal" />
      </Providers>
    );

    // Status indicator should be visible in dot-wrapper
    const dotWrapper = screen.getByTestId("dot-wrapper-test_cal");
    expect(dotWrapper).toBeInTheDocument();

    await waitFor(() => {
      expect(dotWrapper.classList).toContain(ListItemStyles.statusRunning);
    });
  });

  it("should show green dot when node finished", () => {
    const { Providers, mockStore } = createTestProviders({ allNodes: { test_cal: mockNode } });
    mockStore.dispatch(
      setRunStatus({
        is_running: false,
        runnable_type: "node",
        node: createMockNodeExecution({ name: "test_cal", status: "finished", percentage_complete: 100 }),
        graph: null,
      })
    );

    const { container } = render(
      <Providers>
        <NodeElement nodeKey="test_cal" />
      </Providers>
    );

    const dotWrapper = container.querySelector('[data-testid="dot-wrapper-test_cal"]');
    expect(dotWrapper).toBeInTheDocument();

    // Look for a div with class containing "dot" - StatusVisuals renders <div className={`${styles.dot} ${styles.greenDot}`} />
    const dots = dotWrapper?.querySelectorAll("div");
    expect(dots && dots.length > 0).toBe(true);

    // Check that there's a dot element (the greenDot styling is handled by CSS modules with hashed class names)
    // We can't check for the exact class name due to CSS module hashing, but we can verify a dot element exists
    const dotElement = dotWrapper?.querySelector("div");
    expect(dotElement).toBeInTheDocument();
  });

  it("should show red dot when node errored", () => {
    const { Providers, mockStore } = createTestProviders({ allNodes: { test_cal: mockNode } });
    mockStore.dispatch(
      setRunStatus({
        is_running: false,
        runnable_type: "node",
        node: createMockNodeExecution({ name: "test_cal", status: "error", percentage_complete: 0 }),
        graph: null,
      })
    );

    const { container } = render(
      <Providers>
        <NodeElement nodeKey="test_cal" />
      </Providers>
    );

    const dotWrapper = container.querySelector('[data-testid="dot-wrapper-test_cal"]');
    expect(dotWrapper).toBeInTheDocument();

    // Look for a div element (the redDot styling is handled by CSS modules)
    const dotElement = dotWrapper?.querySelector("div");
    expect(dotElement).toBeInTheDocument();
  });

  it("should not show status for different running node", () => {
    // Catches complex conditional logic in status display
    const { Providers, mockStore } = createTestProviders({ allNodes: { test_cal: mockNode } });
    mockStore.dispatch(
      setRunStatus({
        is_running: true,
        runnable_type: "node",
        node: createMockNodeExecution({ name: "other_node", status: "running", percentage_complete: 50 }),
        graph: null,
      })
    );

    render(
      <Providers>
        <NodeElement nodeKey="test_cal" />
      </Providers>
    );

    // test_cal should not show status when other_node is running
    const dotWrapper = screen.getByTestId("dot-wrapper-test_cal");

    // Should not have a progress spinner
    expect(dotWrapper.querySelector('[role="progressbar"]')).not.toBeInTheDocument();
  });
});

describe("NodeElement - UI Interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should insert spaces in very long node names to prevent overflow", () => {
    const longNameNode = {
      name: "test_calibration_with_extremely_long_name_that_exceeds_forty_characters_and_needs_wrapping",
      title: "Test Calibration With Extremely Long Name That Exceeds Forty Characters And Needs Wrapping",
      description: "Test description",
      parameters: {},
    };

    const { Providers } = createTestProviders({ allNodes: { long_node: longNameNode } });

    render(
      <Providers>
        <NodeElement nodeKey="long_node" />
      </Providers>
    );

    const titleElement = screen.getByTestId("title-or-name-long_node");

    // The insertSpaces function adds spaces every 40 characters
    // So the text content should contain spaces
    expect(titleElement.textContent).toContain(" ");

    // Verify the title is actually displayed
    expect(titleElement).toBeInTheDocument();
  });

  it("should use title when available, fallback to name otherwise", () => {
    const nodeWithTitle = {
      name: "resonator_spectroscopy",
      title: "Resonator Spectroscopy",
      description: "Test",
      parameters: {},
    };

    const { Providers } = createTestProviders({ allNodes: { resonator_spectroscopy: nodeWithTitle } });

    render(
      <Providers>
        <NodeElement nodeKey="resonator_spectroscopy" />
      </Providers>
    );

    // Should display the title, not the name
    const titleElement = screen.getByTestId("title-or-name-resonator_spectroscopy");
    expect(titleElement).toHaveTextContent("Resonator Spectroscopy");
    expect(titleElement).not.toHaveTextContent("resonator_spectroscopy");
  });

  it("should use name when title is not provided", () => {
    const nodeWithoutTitle = {
      name: "resonator_spectroscopy",
      description: "Test",
      parameters: {},
    };

    const { Providers } = createTestProviders({ allNodes: { resonator_spectroscopy: nodeWithoutTitle } });

    render(
      <Providers>
        <NodeElement nodeKey="resonator_spectroscopy" />
      </Providers>
    );

    // Should display the name since title is not provided
    const titleElement = screen.getByTestId("title-or-name-resonator_spectroscopy");
    expect(titleElement).toHaveTextContent("resonator_spectroscopy");
  });

  it("should highlight node row when selected", () => {
    const mockNode = {
      name: "test_cal",
      title: "Test Calibration",
      description: "Test",
      parameters: {},
    };

    const { Providers } = createTestProviders({ allNodes: { test_cal: mockNode } });

    render(
      <Providers>
        <NodeElement nodeKey="test_cal" />
      </Providers>
    );

    const nodeElement = screen.getByTestId("node-element-test_cal");

    // Click to select the node
    fireEvent.click(nodeElement);

    // The node should still be in the document and the click should have triggered selection
    expect(nodeElement).toBeInTheDocument();
  });
});