import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import TagOption from "../../../../../src/components/TagFilter/TagOption";
import "@testing-library/jest-dom";


// 🔹 mock helper
vi.mock(
    "../../../modules/Data/components/ExecutionCard/components/TagsList/helpers",
    () => ({
        stringToHexColor: () => "#ff0000",
    })
);

describe("TagOption", () => {
    const toggleMock = vi.fn();

    it("renders tag name", () => {
        render(
            <TagOption tag="test-tag" handleToggleTag={toggleMock}/>
        );

        expect(screen.getByText("test-tag")).toBeInTheDocument();
    });

    it("renders checkbox by default", () => {
        const {container} = render(
            <TagOption tag="test-tag" handleToggleTag={toggleMock}/>
        );

        expect(screen.getByTestId("tag-checkbox")).toBeInTheDocument();
        expect(screen.getByTestId("tag-checkbox").className).toContain("tagFilterCheckbox");
    });


    it("does not render checkbox when showCheckbox is false", () => {
        const {container} = render(
            <TagOption
                tag="test-tag"
                handleToggleTag={toggleMock}
                showCheckbox={false}
            />
        );

        expect(container.querySelector(".tagFilterCheckbox")).toBeFalsy();
    });

    it("applies selected class when isSelected is true", () => {
        const {container} = render(
            <TagOption
                tag="test-tag"
                handleToggleTag={toggleMock}
                isSelected
            />
        );

        expect(screen.getByTestId("tag-checkbox").className).toContain("selected");
    });

    it("calls handleToggleTag on click", () => {
        render(
            <TagOption tag="test-tag" handleToggleTag={toggleMock}/>
        );

        fireEvent.click(screen.getByText("test-tag"));

        expect(toggleMock).toHaveBeenCalledWith("test-tag");
    });
});
