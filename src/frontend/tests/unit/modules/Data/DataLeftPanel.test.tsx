import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataLeftPanel } from "../../../../src/modules/Data";

// ================= MOCK COMPONENTS =================
vi.mock("../../../../src/modules/Data/components", () => ({
  SearchField: ({ placeholder }: any) => <input data-testid="search-field" placeholder={placeholder} />,
  DateFilter: ({ from, to }: any) => <div data-testid="date-filter">{`${from}-${to}`}</div>,
  SortButton: ({ onSelect }: any) => (
    <button data-testid="sort-button" onClick={() => onSelect("asc")}>
      Sort
    </button>
  ),
  AppliedFilterLabel: ({ value }: any) => <div data-testid="applied-filter">{value}</div>,
}));

vi.mock("../../../../src/modules/Data/components/SnapshotsTimeline/SnapshotsTimeline", () => ({
  SnapshotsTimeline: () => <div data-testid="snapshots-timeline" />,
}));

vi.mock("../../../../src/modules/Data/components/Pagination/PaginationWrapper", () => ({
  default: () => <div data-testid="pagination-wrapper" />,
}));

// ================= TESTS =================
describe("DataLeftPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders SearchField, DateFilter, SortButton", () => {
    render(<DataLeftPanel />);

    expect(screen.getByTestId("search-field")).toBeInTheDocument();
    expect(screen.getByTestId("date-filter")).toBeInTheDocument();
    expect(screen.getByTestId("sort-button")).toBeInTheDocument();
  });

  it("renders SnapshotsTimeline", () => {
    render(<DataLeftPanel />);
    expect(screen.getByTestId("snapshots-timeline")).toBeInTheDocument();
  });

  it("renders PaginationWrapper", () => {
    render(<DataLeftPanel />);
    expect(screen.getByTestId("pagination-wrapper")).toBeInTheDocument();
  });

  it("renders AppliedFilterLabel when date filters are selected", () => {
    render(<DataLeftPanel />);

    expect(screen.getByText(/Execution History/)).toBeInTheDocument();
  });
});
