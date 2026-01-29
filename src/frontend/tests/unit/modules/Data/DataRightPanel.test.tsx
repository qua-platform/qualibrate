import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import { DataRightPanel } from "../../../../src/modules/Data";
import { getResult, getSelectedSnapshot } from "../../../../src/stores/SnapshotsStore";

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return { ...actual, useSelector: vi.fn() };
});

describe("DataRightPanel", () => {
  beforeEach(() => {
    (useSelector as any).mockImplementation((selector: any) => {
      if (selector === getResult) {
        return { value: 42 };
      }
      if (selector === getSelectedSnapshot) {
        return {
          metadata: { status: "success" },
          data: { parameters: { model: { depth: 10 } } },
        };
      }
      return undefined;
    });
  });

  it("renders VerticalResizableComponent", () => {
    render(<DataRightPanel />);
    expect(screen.getByTestId("vertical-component")).toBeInTheDocument();
  });
  it("renders JSONEditor when result exists", () => {
    render(<DataRightPanel />);
    expect(screen.getByTestId("json-editor")).toBeInTheDocument();
  });
});
