import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {useSelector} from "react-redux";
import DataRightPanel from "../../../../src/modules/Data/components/DataRightPanel/DataRightPanel";
import {getBreadCrumbs, getJsonData, getResult, getSelectedSnapshot,} from "../../../../src/stores/SnapshotsStore";
import {getRunStatusIsRunning} from "../../../../src/stores/WebSocketStore";
import {useRootDispatch} from "../../../../src/stores";
import "@testing-library/jest-dom";

// ================= MOCK REDUX =================
vi.mock("react-redux", async () => {
    const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
    return {
        ...actual,
        useSelector: vi.fn(),
    };
});

vi.mock("../../../../src/stores", () => ({
    useRootDispatch: vi.fn(),
}));

// ================= MOCK CHILD COMPONENTS =================
vi.mock("../../../../src/components", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../../../src/components")>();

    return {
        ...actual,
        VerticalResizableComponent: () => <div data-testid="vertical-component"/>,
        JSONEditor: () => <div data-testid="json-editor"/>,
        GraphView: () => <div data-testid="graph-view"/>,
    };
});

vi.mock(
    "../../../../src/modules/Data/components/DataRightPanel/GraphView",
    () => ({
        default: () => <div data-testid="graph-view"/>,
    })
);

// ================= TESTS =================
describe("DataRightPanel", () => {
    const dispatchMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRootDispatch as any).mockReturnValue(dispatchMock);

        (useSelector as any).mockImplementation((selector: any) => {
            switch (selector) {
                case getResult:
                    return {value: 42};

                case getSelectedSnapshot:
                    return {
                        metadata: {type_of_execution: "node"},
                    };

                case getJsonData:
                    return {
                        parameters: {model: {depth: 10}},
                    };

                case getBreadCrumbs:
                    return [];

                case getRunStatusIsRunning:
                    return false;

                default:
                    return undefined;
            }
        });
    });

    it("renders VerticalResizableComponent", () => {
        render(<DataRightPanel/>);
        expect(screen.getByTestId("vertical-component")).toBeInTheDocument();
    });

    it("renders JSONEditor when result exists", () => {
        render(<DataRightPanel/>);
        expect(screen.getByTestId("json-editor")).toBeInTheDocument();
    });

    it("renders rerun button when snapshot is selected and breadcrumbs are empty", () => {
        render(<DataRightPanel/>);
        expect(screen.getByText("▶ Rerun")).toBeInTheDocument();
    });

    it("renders GraphView when execution type is workflow", () => {
        (useSelector as any).mockImplementation((selector: any) => {
            if (selector === getSelectedSnapshot) {
                return {metadata: {type_of_execution: "workflow"}};
            }
            if (selector === getBreadCrumbs) return [];
            if (selector === getRunStatusIsRunning) return false;
            return undefined;
        });

        render(<DataRightPanel/>);
        expect(screen.getByTestId("graph-view")).toBeInTheDocument();
    });

    it("disables rerun button when node is running", () => {
        (useSelector as any).mockImplementation((selector: any) => {
            if (selector === getRunStatusIsRunning) return true;
            if (selector === getSelectedSnapshot) return {metadata: {type_of_execution: "node"}};
            if (selector === getBreadCrumbs) return [];
            return undefined;
        });

        render(<DataRightPanel/>);
        expect(screen.getByText("▶ Rerun")).toBeDisabled();
    });
});
