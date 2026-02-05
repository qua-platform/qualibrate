import React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";

import {DataLeftPanel} from "../../../../src/modules/Data";

import {Provider} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";

// ================= MOCK STORE SELECTORS =================
const mockBreadCrumbs: string[] = [];
const mockSelectedWorkflow = undefined;
const mockTags: string[] = ["raby", "some random tag"];

vi.mock("../../../../src/stores/SnapshotsStore", () => ({
    getBreadCrumbs: () => mockBreadCrumbs,
    getSelectedWorkflow: () => mockSelectedWorkflow,
    goBackOneLevel: vi.fn(),
    getAllTags: () => mockTags,
    setSnapshotsFilters: vi.fn(),
}));

// ================= MOCK useRootDispatch =================
vi.mock("../../../../src/stores", () => ({
    useRootDispatch: () => vi.fn(),
}));

// ================= MOCK COMPONENTS =================
vi.mock("../../../../src/modules/Data/components", () => ({
    SearchField: ({placeholder}: any) => (
        <input data-testid="search-field" placeholder={placeholder}/>
    ),
    DateFilter: ({from, to}: any) => (
        <div data-testid="date-filter">{`${from}-${to}`}</div>
    ),
    SortButton: ({onSelect}: any) => (
        <button data-testid="sort-button" onClick={() => onSelect("asc")}>
            Sort
        </button>
    ),
    TagFilter: () => <div data-testid="tag-filter"/>,
    AppliedFilterLabel: ({value}: any) => (
        <div data-testid="applied-filter">{value}</div>
    ),
}));

vi.mock(
    "../../../../src/modules/Data/components/SnapshotsTimeline/SnapshotsTimeline",
    () => ({
        default: () => <div data-testid="snapshots-timeline"/>,
    })
);

vi.mock(
    "../../../../src/modules/Data/components/Pagination/PaginationWrapper",
    () => ({
        default: () => <div data-testid="pagination-wrapper"/>,
    })
);

// ================= HELPER =================
const renderWithStore = () => {
    const store = configureStore({
        reducer: {
            snapshots: () => ({}),
        },
    });

    return render(
        <Provider store={store}>
            <DataLeftPanel/>
        </Provider>
    );
};

// ================= TESTS =================
describe("DataLeftPanel", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders SearchField, DateFilter, SortButton", () => {
        renderWithStore();

        expect(screen.getByTestId("search-field")).toBeInTheDocument();
        expect(screen.getByTestId("date-filter")).toBeInTheDocument();
        expect(screen.getByTestId("sort-button")).toBeInTheDocument();
    });

    it("renders SnapshotsTimeline", () => {
        renderWithStore();
        expect(screen.getByTestId("snapshots-timeline")).toBeInTheDocument();
    });

    it("renders PaginationWrapper when no workflow is selected", () => {
        renderWithStore();
        expect(screen.getByTestId("pagination-wrapper")).toBeInTheDocument();
    });

    it("renders Execution History title when no workflow is selected", () => {
        renderWithStore();
        expect(screen.getByText("Execution History")).toBeInTheDocument();
    });
});
