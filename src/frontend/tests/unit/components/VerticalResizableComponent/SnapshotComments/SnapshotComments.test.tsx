import {beforeEach, describe, expect, it, Mock, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

import SnapshotComments from "../../../../../src/components/VerticalResizableComponent/SnapshotComments/SnapshotComments";
import * as SnapshotUtils from "../../../../../src/stores/SnapshotsStore/utils";

// 👇 Redux
import {Provider} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";

// =====================
// MOCK SELECTORS
// =====================
const mockSnapshot = {id: 1};
vi.mock(
    "../../../../../src/stores/SnapshotsStore",
    () => ({
        getSelectedSnapshotId: () => 1,
        getSelectedSnapshot: () => (mockSnapshot),
    })
);

// =====================
// MOCK API UTILS
// =====================
vi.mock(
    "../../../../../src/stores/SnapshotsStore/utils",
    () => ({
        fetchAllCommentsForSnapshot: vi.fn(),
        addCommentToSnapshot: vi.fn(),
        updateSnapshotComment: vi.fn(),
        removeCommentFromSnapshot: vi.fn(),
    })
);

// =====================
// MOCK MODAL
// =====================
vi.mock(
    "../../../../../src/components/VerticalResizableComponent/CommentModal",
    () => ({
        default: ({handleOnSave}: any) => (
            <button
                data-testid="mock-save-btn"
                onClick={() =>
                    handleOnSave({
                        mode: "add",
                        commentText: "New comment",
                    })
                }
            >
                Save
            </button>
        ),
    })
);

// =====================
// HELPER
// =====================
const renderWithStore = () => {
    const store = configureStore({
        reducer: {
            snapshots: () => ({}),
        },
    });

    return render(
        <Provider store={store}>
            <SnapshotComments/>
        </Provider>
    );
};

describe("SnapshotComments", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SnapshotUtils.fetchAllCommentsForSnapshot as Mock).mockResolvedValue({
            isOk: true,
            result: [],
        });
    });

    it("renders empty state when there are no comments", async () => {
        (SnapshotUtils.fetchAllCommentsForSnapshot as Mock).mockResolvedValue({
            isOk: true,
            result: [],
        });

        renderWithStore();

        await waitFor(() => {
            expect(screen.getByText("No comments yet")).toBeInTheDocument();
        });
    });

    it("renders comments fetched from API", async () => {
        (SnapshotUtils.fetchAllCommentsForSnapshot as Mock).mockResolvedValue({
            isOk: true,
            result: [
                {
                    id: 1,
                    value: "First comment",
                    createdAt: "2024-11-16T14:30:00Z",
                },
            ],
        });

        renderWithStore();

        await waitFor(() => {
            expect(screen.getByText("First comment")).toBeInTheDocument();
        });
    });

    it("opens modal and adds a new comment", async () => {
        (SnapshotUtils.fetchAllCommentsForSnapshot as Mock).mockResolvedValue({
            isOk: true,
            result: [],
        });

        (SnapshotUtils.addCommentToSnapshot as Mock).mockResolvedValue({
            isOk: true,
            result: {
                id: 2,
                value: "New comment",
                createdAt: "2024-11-16T14:30:00Z",
            },
        });

        renderWithStore();

        fireEvent.click(screen.getByTestId("add-comment-btn"));

        fireEvent.click(screen.getByTestId("mock-save-btn"));

        await waitFor(() => {
            expect(screen.getByText("New comment")).toBeInTheDocument();
        });
    });
});
