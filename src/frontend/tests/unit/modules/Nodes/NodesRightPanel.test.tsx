import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useSelector } from "react-redux";
import { NodesRightPanel } from "../../../../src/modules/Nodes/components/NodesRightPanel/NodesRightPanel";
import { getRunStatusIsRunning } from "../../../../src/stores/WebSocketStore";
import { useRootDispatch } from "../../../../src/stores";
import "@testing-library/jest-dom";
import { getAllNodes, getResults, getRunningNodeInfo, getSelectedNode, getSelectedNodeId, handleRunNode } from "../../../../src/stores/NodesStore";
import * as NodesAPI from "../../../../src/stores/NodesStore/api/NodesAPI";
import { createTestProviders } from "../../utils/providers";
import { ParameterTypes } from "../../../../src/components/Parameters/Parameters";
import { getIsAuthorized } from "../../../../src/stores/AuthStore";

// ================= MOCK REDUX =================
vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

vi.mock("../../../../src/stores", async (importOriginal) => ({
  useRootDispatch: vi.fn(),
  rootReducer: vi.fn(),
}));

// ================= MOCK CHILD COMPONENTS =================
vi.mock("../../../../src/components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../../src/components")>();

  return {
    ...actual,
    VerticalResizableComponent: () => <div data-testid="vertical-component" />,
    JSONEditor: () => <div data-testid="json-editor" />,
    GraphView: () => <div data-testid="graph-view" />,
  };
});

vi.mock("../../../../src/modules/Data/components/NodesRightPanel/GraphView", () => ({
  default: () => <div data-testid="graph-view" />,
}));

const mockedNodes = {
  test_cal: {
    name: "test_cal",
    title: "Test Calibration",
    description: "Test node",
    parameters: {
      resonator: {
        default: "q1.resonator",
        value: "q1.resonator",
        title: "Resonator",
        type: "string" as ParameterTypes,
        is_targets: false,
      },
    },
  },
  qubit_spec: {
    name: "qubit_spec",
    title: "Qubit Spectroscopy",
    description: "Qubit node",
    parameters: {},
  },
};

// ================= TESTS =================
const dispatchMock = vi.fn();
describe("NodesRightPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useRootDispatch as any).mockReturnValue(dispatchMock);

    (useSelector as any).mockImplementation((selector: any) => {
      switch (selector) {
        case getIsAuthorized:
          return true;

        case getAllNodes:
          return mockedNodes;

        case getResults:
          return { value: 42 };

        case getRunningNodeInfo:
          return {
            lastRunNodeName: "test_cal",
            status: "finished",
            idx: "1",
          };

        case getSelectedNodeId:
          return "test_cal";

        case getSelectedNode:
          return mockedNodes.test_cal;

        case getRunStatusIsRunning:
          return false;

        default:
          return undefined;
      }
    });
  });

  it("renders VerticalResizableComponent", () => {
    render(<NodesRightPanel />);
    expect(screen.getByTestId("vertical-component")).toBeInTheDocument();
  });

  it("renders JSONEditor when result exists", () => {
    render(<NodesRightPanel />);
    expect(screen.getByTestId("json-editor")).toBeInTheDocument();
  });

  it("renders run button when node is selected", () => {
    render(<NodesRightPanel />);
    expect(screen.getByText("▶ Run")).toBeInTheDocument();
  });

  it("disables rerun button when node is running", () => {
    (useSelector as any).mockImplementation((selector: any) => {
      if (selector === getRunStatusIsRunning) return true;
      if (selector === getSelectedNode) return mockedNodes.test_cal;
      return undefined;
    });

    render(<NodesRightPanel />);
    expect(screen.queryByText("▶ Run")).not.toBeInTheDocument();
    expect(screen.getByText("⏹ STOP")).toBeInTheDocument();
  });

  it("should render parameters modal", async () => {
    const { Providers } = createTestProviders();
    // render(<NodesRightPanel />);
    render(<Providers>
      <NodesRightPanel />
    </Providers>);

    fireEvent.click(screen.getByText("▶ Run"));

    await waitFor(() => {
      expect(screen.getByTestId("parameters-modal")).toBeInTheDocument();
    });
  });

  // TODO: find a way to mock action dispatching
  // it("should submit node with correct parameters", async () => {
  //   const mockSubmit = vi.fn().mockResolvedValue({ isOk: true });
  //   vi.spyOn(NodesAPI.NodesApi, "submitNodeParameters").mockImplementation(mockSubmit);
  //   // const spyDispatch = vi.spyOn(redux, "useAppDispatch");

  //   render(<NodesRightPanel />);

  //   // Select node
  //   fireEvent.click(screen.getByText("▶ Run"));
  //   // fireEvent.click(screen.getByTestId("node-element-test_cal"));

  //   await waitFor(() => {
  //     expect(screen.getByTestId("parameters-modal")).toBeInTheDocument();
  //   });

  //   // Click run button
  //   console.log('screen.getByTestId("run-button")', screen.getByTestId("run-button"))
  //   fireEvent.click(screen.getByTestId("run-button"));

  //   // Verify API was called with correct parameters
  //   await waitFor(() => {
  //     expect(mockSubmit).toHaveBeenCalledWith("test_cal", {
  //       resonator: "q1.resonator",
  //     });
  //   });
  // });
});
