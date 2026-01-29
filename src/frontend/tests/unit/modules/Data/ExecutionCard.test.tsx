import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ExecutionCard from "../../../../src/modules/Data/components/ExecutionCard";

// mock utils
vi.mock("../../../../utils/formatDateTime", () => ({
  formatDateTime: vi.fn(() => "2024-11-16 14:30"),
}));

vi.mock("../../../../utils/formatTimeDuration", () => ({
  formatTimeDuration: vi.fn(() => "2m 15s"),
}));

describe("ExecutionCard", () => {
  const baseSnapshot = {
    id: "exec-001",
    metadata: {
      name: "Test execution",
      status: "running",
      run_start: "2024-11-16T14:30:00Z",
      run_duration: 135,
    },
  } as any;

  it("renders execution name, id and status", () => {
    render(<ExecutionCard snapshot={baseSnapshot} isSelected={false} handleOnClick={vi.fn()} />);

    expect(screen.getByText("Test execution")).toBeInTheDocument();
    expect(screen.getByText("#exec-001")).toBeInTheDocument();
    expect(screen.getByText("running")).toBeInTheDocument();
  });

  it("renders formatted duration and start time", () => {
    render(<ExecutionCard snapshot={baseSnapshot} isSelected={false} handleOnClick={vi.fn()} />);

    expect(screen.getByText("2m 15s")).toBeInTheDocument();
    expect(screen.getByText(/2024-11-16\s+14:30/)).toBeInTheDocument();
  });

  it("applies selected class when isSelected=true", () => {
    const { container } = render(<ExecutionCard snapshot={baseSnapshot} isSelected={true} handleOnClick={vi.fn()} />);

    const card = container.firstChild as HTMLElement;

    expect(card.className).toContain("selected");
  });

  it("calls handleOnClick when card is clicked", () => {
    const onClick = vi.fn();

    render(<ExecutionCard snapshot={baseSnapshot} isSelected={false} handleOnClick={onClick} />);

    fireEvent.click(screen.getByText("Test execution"));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("falls back to pending status when metadata.status is missing", () => {
    const snapshotWithoutStatus = {
      ...baseSnapshot,
      metadata: {
        ...baseSnapshot.metadata,
        status: undefined,
      },
    };

    render(<ExecutionCard snapshot={snapshotWithoutStatus} isSelected={false} handleOnClick={vi.fn()} />);

    expect(screen.getByText("pending")).toBeInTheDocument();
  });
});
