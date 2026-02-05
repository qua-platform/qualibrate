import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchField } from "../../../../src/components";

describe("SearchField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders input with placeholder and value", () => {
    render(<SearchField placeholder="Search..." value="test" onChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;

    expect(input).toBeInTheDocument();
    expect(input.value).toBe("test");
  });

  it("calls onChange after debounce delay", () => {
    const onChange = vi.fn();

    render(<SearchField placeholder="Search..." value="" onChange={onChange} debounceMs={300} />);

    const input = screen.getByPlaceholderText("Search...");

    fireEvent.change(input, { target: { value: "abc" } });

    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("resets debounce timer on rapid typing", () => {
    const onChange = vi.fn();

    render(<SearchField placeholder="Search..." value="" onChange={onChange} debounceMs={300} />);

    const input = screen.getByPlaceholderText("Search...");

    fireEvent.change(input, { target: { value: "a" } });
    vi.advanceTimersByTime(200);

    fireEvent.change(input, { target: { value: "ab" } });
    vi.advanceTimersByTime(200);

    fireEvent.change(input, { target: { value: "abc" } });

    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("updates internal value when external value changes", () => {
    const onChange = vi.fn();

    const { rerender } = render(<SearchField placeholder="Search..." value="initial" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    expect(input.value).toBe("initial");

    rerender(<SearchField placeholder="Search..." value="updated" onChange={onChange} />);

    expect(input.value).toBe("updated");
  });
});
