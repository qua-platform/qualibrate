import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {VerticalResizableComponent} from "../../../../src/components";
import {Provider} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";
import {ReactElement} from "react";
import "@testing-library/jest-dom";
import {SnapshotComment} from "../../../../src/stores/SnapshotsStore/api/SnapshotsApi";


const mockComments: SnapshotComment[] = [{id: 1, value: "My comment", createdAt: ""}]
// 👇 MOCK for SnapshotComments selectors
vi.mock(
    "../../../../src/stores/snapshots/selectors",
    () => ({
        getSelectedSnapshotId: () => 1,
        getSelectedSnapshot: () => ({
            id: 1,
            comments: [],
        }),
    })
);

// 👇 helper for render with Redux
const renderWithStore = (ui: ReactElement) => {
    const store = configureStore({
        reducer: {
            snapshots: () => ({}),
        },
    });

    return render(<Provider store={store}>{ui}</Provider>);
};

describe("VerticalResizableComponent", () => {
    it("renders default tabs and content", () => {
        renderWithStore(<VerticalResizableComponent/>);

        expect(screen.getByText("Metadata")).toBeInTheDocument();
        expect(screen.getByText("Parameters")).toBeInTheDocument();
    });

    it("toggles sidebar collapse state", () => {
        const {container} = renderWithStore(
            <VerticalResizableComponent/>
        );

        const sidebar = container.querySelector("#contentSidebar")!;
        const toggleBtn = container.querySelector("#sidebarToggle")!;

        // expanded by default
        expect(sidebar.className).not.toContain("collapsed");

        fireEvent.click(toggleBtn);
        expect(sidebar.className).toContain("collapsed");

        fireEvent.click(toggleBtn);
        expect(sidebar.className).not.toContain("collapsed");
    });

    it("switches tabs and displays correct data", () => {
        renderWithStore(
            <VerticalResizableComponent
                tabNames={["Metadata", "Parameters"]}
                tabData={{
                    metadata: {
                        execution_id: "exec-001",
                        status: "running",
                    },
                    parameters: {
                        depth: 10,
                        qubits: ["Q1", "Q2"],
                    },
                }}
            />
        );

        // Metadata tab is active by default
        expect(screen.getByText("Execution Id")).toBeInTheDocument();
        expect(screen.getByText("exec-001")).toBeInTheDocument();

        // Switch to Parameters
        fireEvent.click(screen.getByText("Parameters"));

        expect(screen.getByText("Depth")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(
            screen.getByText(/\[\s*"Q1",\s*"Q2"\s*\]/)
        ).toBeInTheDocument();
    });

    it("renders dash for null or undefined values", () => {
        renderWithStore(
            <VerticalResizableComponent
                tabData={{
                    metadata: {
                        endTime: null,
                    },
                }}
            />
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });
});
