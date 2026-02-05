import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {DateFilter} from "../../../../src/components";
import {DateOption} from "../../../../src/components/DateFilter";

const options = [
    {label: "Today", value: DateOption.Today},
    {label: "Last week", value: DateOption.LastWeek},
    {label: "Last month", value: DateOption.LastMonth},
];

describe("DateFilter", () => {
    it("calls onSelect when preset is clicked", () => {
        const onSelect = vi.fn();

        render(<DateFilter options={options} onSelect={onSelect}/>);

        fireEvent.click(screen.getByTestId("date-filter"));
        fireEvent.click(screen.getByText("Today"));

        expect(onSelect).toHaveBeenCalledOnce();
        expect(onSelect).toHaveBeenCalledWith({
            label: "Today",
            value: DateOption.Today,
        });
    });

    it("calls setFrom and setTo on date change", () => {
        const setFrom = vi.fn();
        const setTo = vi.fn();

        render(
            <DateFilter
                options={options}
                from=""
                to=""
                setFrom={setFrom}
                setTo={setTo}
            />
        );

        fireEvent.click(screen.getByTestId("date-filter"));

        const fromInput = screen.getByTestId(
            "execution-history-date-filter-input-from"
        ) as HTMLInputElement;

        const toInput = screen.getByTestId(
            "execution-history-date-filter-input-to"
        ) as HTMLInputElement;

        fireEvent.change(fromInput, {target: {value: "2026-01-10"}});
        fireEvent.change(toInput, {target: {value: "2026-01-15"}});

        expect(setFrom).toHaveBeenCalledWith("2026-01-10");
        expect(setTo).toHaveBeenCalledWith("2026-01-15");
    });
});
