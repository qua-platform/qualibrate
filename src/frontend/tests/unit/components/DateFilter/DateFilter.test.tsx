import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DateFilter } from "../../../../src/components";

describe("DateFilter", () => {
  it("calls onSelect when preset is clicked", () => {
    const onSelect = vi.fn();

    render(<DateFilter onSelect={onSelect} />);

    // open dropdown
    fireEvent.click(screen.getByTestId("date-filter"));

    const option = screen.getByText("Today");
    fireEvent.click(option);

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith("Today");
  });

  it("calls setFrom and setTo on date change", () => {
    const setFrom = vi.fn();
    const setTo = vi.fn();

    render(<DateFilter from="" to="" setFrom={setFrom} setTo={setTo} />);

    fireEvent.click(screen.getByTestId("date-filter"));

    const fromInput = screen.getByTestId("execution-history-date-filter-input-from") as HTMLInputElement;
    const toInput = screen.getByTestId("execution-history-date-filter-input-to") as HTMLInputElement;

    fireEvent.change(fromInput, { target: { value: "2026-01-10" } });
    fireEvent.change(toInput, { target: { value: "2026-01-15" } });

    expect(setFrom).toHaveBeenCalledWith("2026-01-10");
    expect(setTo).toHaveBeenCalledWith("2026-01-15");
  });
});
