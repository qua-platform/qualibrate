import React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {useSelector} from "react-redux";
import {useRootDispatch} from "../../../../src/stores";
import {ExecutionCard} from "../../../../src/modules/Data/components";
import "@testing-library/jest-dom";
import {SnapshotDTO} from "../../../../src/stores/SnapshotsStore";

// -------------------- MOCKS --------------------

// Mock redux
vi.mock("react-redux", async () => {
    const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
    return {...actual, useSelector: vi.fn()};
});

vi.mock("../../../../src/stores", () => ({
    useRootDispatch: vi.fn(),
}));

// Mock utils
vi.mock("../../../../utils/formatDateTime", () => ({
    formatDate: vi.fn(() => "2024-11-16 14:30"),
}));
vi.mock("../../../../utils/formatTimeDuration", () => ({
    formatTimeDuration: vi.fn(() => "2m 15s"),
}));

// Mock TagsList
vi.mock("../../../../src/modules/Data/components/ExecutionCard/components", () => ({
    TagsList: (_: any) => <div data-testid="tags-list"/>,
}));

describe("ExecutionCard", () => {
    const baseSnapshot: SnapshotDTO = {
        id: "exec-001",
        metadata: {
            name: "Test execution",
            status: "running",
            run_start: "2024-11-16T14:30:00Z",
            run_duration: 135,
            type_of_execution: "node",
        },
    } as any;

    const dispatchMock = vi.fn();

    beforeEach(() => {
        (useSelector as any).mockImplementation((selector: any) => {
            if (selector.name === "getSelectedNodeInWorkflowName") return null;
            if (selector.name === "getSelectedWorkflow") return null;
            return undefined;
        });
        (useRootDispatch as any).mockReturnValue(dispatchMock);
        dispatchMock.mockClear();
    });

    it("renders execution name, id and status", () => {
        render(<ExecutionCard snapshot={baseSnapshot} isSelected={false} handleOnClick={vi.fn()} handleOnAddTagClick={vi.fn()}/>);
        expect(screen.getByText("Test execution")).toBeInTheDocument();
        expect(screen.getByText("#exec-001")).toBeInTheDocument();
        expect(screen.getByText("running")).toBeInTheDocument();
    });

    it("renders formatted duration and start date", () => {
        render(<ExecutionCard snapshot={baseSnapshot} isSelected={false} handleOnClick={vi.fn()} handleOnAddTagClick={vi.fn()}/>);
        expect(screen.getByText("2m 15s")).toBeInTheDocument();
        expect(screen.getByText(`2024-11-16`)).toBeInTheDocument();
    });

    it("applies selected class when isSelected=true", () => {
        const {container} = render(<ExecutionCard snapshot={baseSnapshot} isSelected={true} handleOnClick={vi.fn()} handleOnAddTagClick={vi.fn()}/>);
        const card = container.firstChild as HTMLElement;
        expect(card.className).toContain("selected");
    });

    it("calls handleOnClick when card is clicked", () => {
        const onClick = vi.fn();
        render(<ExecutionCard snapshot={baseSnapshot} isSelected={false} handleOnClick={onClick} handleOnAddTagClick={vi.fn()}/>);
        fireEvent.click(screen.getByText("Test execution"));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it("falls back to completed status when metadata.status is finished or missing", () => {
        const snapshotFinished = {
            ...baseSnapshot,
            metadata: {...baseSnapshot.metadata, status: "finished"},
        };
        render(<ExecutionCard snapshot={snapshotFinished} isSelected={false} handleOnClick={vi.fn()} handleOnAddTagClick={vi.fn()}/>);
        expect(screen.getByText("completed")).toBeInTheDocument();
    });

    it("dispatches actions when GRAPH badge is clicked for workflow", () => {
        const workflowSnapshot = {
            ...baseSnapshot,
            metadata: {...baseSnapshot.metadata, type_of_execution: "workflow"},
        };
        render(<ExecutionCard snapshot={workflowSnapshot as SnapshotDTO} isSelected={false} handleOnClick={vi.fn()} handleOnAddTagClick={vi.fn()}/>);
        fireEvent.click(screen.getByText("GRAPH"));
        expect(dispatchMock).toHaveBeenCalled();
    });

    it("renders TagsList", () => {
        render(<ExecutionCard snapshot={baseSnapshot} isSelected={false} handleOnClick={vi.fn()} handleOnAddTagClick={vi.fn()}/>);
        expect(screen.getByTestId("tags-list")).toBeInTheDocument();
    });
});
