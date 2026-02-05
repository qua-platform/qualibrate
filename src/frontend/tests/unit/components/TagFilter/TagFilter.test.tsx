import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, Mock, vi} from "vitest";
import TagFilter from "../../../../src/components/TagFilter";
import "@testing-library/jest-dom";
import {useSelector} from "react-redux";

// 🔹 Mock react-redux
vi.mock("react-redux", async (importOriginal) => {
    const actual = await importOriginal() as typeof importOriginal;
    return {
        ...actual,
        useSelector: vi.fn().mockImplementation((selector) => selector()),
        useDispatch: Object.assign(() => vi.fn(), {
            withTypes: () => () => vi.fn(),
        }),
    };
});

// 🔹 Mock SnapshotsStore
vi.mock("../../stores/SnapshotsStore", () => ({
    getAllTags: vi.fn(() => ["tag1", "tag2"]),
}));

// 🔹 Mock useClickOutside hook
vi.mock("../../utils/hooks/useClickOutside", () => ({
    default: (_: () => void) => ({current: null}),
}));

// 🔹 Mock TagOption
vi.mock("./TagOption", () => ({
    default: ({tag, handleToggleTag, isSelected}: any) => (
        <div
            data-testid={`tag-option-${tag}`}
            data-selected={isSelected}
            onClick={() => handleToggleTag(tag)}
        >
            {tag}
        </div>
    ),
}));

describe("TagFilter", () => {
    const mockToggle = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // override useSelector for each test
        (useSelector as unknown as Mock).mockReturnValue(["tag1", "tag2"]);
    });

    it("renders filter button and icon", () => {
        render(<TagFilter selectedTags={[]} handleToggleTag={mockToggle}/>);

        expect(screen.getByTestId("tag-filter")).toBeInTheDocument();
        expect(screen.getByTestId("tag-filter-icon-button")).toBeInTheDocument();
    });

    it("toggles dropdown on filter button click", () => {
        render(<TagFilter selectedTags={[]} handleToggleTag={mockToggle}/>);

        const button = screen.getByTestId("tag-filter").firstChild!;
        const dropdown = screen.getByTestId("tag-dropdown");

        fireEvent.click(button);
        expect(dropdown.className).toContain("active");

        fireEvent.click(button);
        expect(dropdown.className).not.toContain("active");
    });

    it("renders all tags from redux", () => {
        render(<TagFilter selectedTags={[]} handleToggleTag={mockToggle}/>);

        expect(screen.getByTestId("tag-option-tag1")).toBeInTheDocument();
        expect(screen.getByTestId("tag-option-tag2")).toBeInTheDocument();
    });

    it("marks selected tags correctly", () => {
        render(<TagFilter selectedTags={["tag2"]} handleToggleTag={mockToggle}/>);

        const tag1Checkbox = screen.getAllByTestId("tag-checkbox")[0];
        const tag2Checkbox = screen.getAllByTestId("tag-checkbox")[1];

        expect(tag2Checkbox.className).toContain("selected");
        expect(tag1Checkbox.className).not.toContain("selected");
    });

    it("calls handleToggleTag when tag is clicked", () => {
        render(<TagFilter selectedTags={[]} handleToggleTag={mockToggle}/>);

        fireEvent.click(screen.getByTestId("tag-option-tag1"));

        expect(mockToggle).toHaveBeenCalledWith("tag1");
    });
});
