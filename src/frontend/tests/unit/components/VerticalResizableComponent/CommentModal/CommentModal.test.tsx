import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

import CommentModal from "../../../../../src/components/VerticalResizableComponent/CommentModal/CommentModal";

import {Provider} from "react-redux";
import {configureStore} from "@reduxjs/toolkit";

const mockSelectedSnapshot = {id: 1};
vi.mock(
    "../../../../../src/stores/SnapshotsStore",
    () => ({
        getSelectedSnapshot: () => (mockSelectedSnapshot),
    })
);

// =====================
// MOCK MUI DIALOG (without portal)
// =====================
vi.mock("@mui/material", () => ({
    Dialog: ({children}: any) => <div>{children}</div>,
}));

// =====================
// HELPER
// =====================
const renderWithStore = (props: any) => {
    const store = configureStore({
        reducer: {
            snapshots: () => ({}),
        },
    });

    return render(
        <Provider store={store}>
            <CommentModal {...props} />
        </Provider>
    );
};

describe("CommentModal", () => {
    const handleOnClose = vi.fn();
    const handleOnSave = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders add mode correctly", () => {
        renderWithStore({
            mode: "add",
            handleOnClose,
            handleOnSave,
        });

        expect(screen.getByRole("heading", {name: "Add comment"})).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Add your notes...")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("renders edit mode with prefilled text", () => {
        renderWithStore({
            mode: "edit",
            comment: {
                id: 1,
                value: "Existing comment",
                createdAt: "2024-11-16 14:30:00",
            },
            handleOnClose,
            handleOnSave,
        });

        expect(screen.getByRole("heading", {name: "Edit comment"})).toBeInTheDocument();
        expect(screen.getByDisplayValue("Existing comment")).toBeInTheDocument();
    });

    it("renders delete mode correctly", () => {
        renderWithStore({
            mode: "delete",
            comment: {
                id: 1,
                value: "Comment",
                createdAt: "2024-11-16 14:30:00",
            },
            handleOnClose,
            handleOnSave,
        });

        expect(screen.getByRole("heading", {name: "Delete comment"})).toBeInTheDocument();
        expect(
            screen.getByText(
                "Are you sure you want to delete this comment? This action cannot be undone."
            )
        ).toBeInTheDocument();
        expect(screen.getByText("Yes, Delete")).toBeInTheDocument();
    });

    it("calls handleOnSave with correct payload on save", () => {
        renderWithStore({
            mode: "add",
            handleOnClose,
            handleOnSave,
        });

        fireEvent.change(screen.getByPlaceholderText("Add your notes..."), {
            target: {value: "New comment"},
        });

        fireEvent.click(screen.getByText("Save"));

        expect(handleOnSave).toHaveBeenCalledWith({
            mode: "add",
            comment: undefined,
            commentText: "New comment",
        });
    });

    it("calls handleOnClose when cancel is clicked", () => {
        renderWithStore({
            mode: "add",
            handleOnClose,
            handleOnSave,
        });

        fireEvent.click(screen.getByText("Cancel"));

        expect(handleOnClose).toHaveBeenCalled();
    });
});
