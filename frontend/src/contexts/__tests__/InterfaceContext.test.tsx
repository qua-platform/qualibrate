import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { InterfaceContextProvider, useInterfaceContext } from "../InterfaceContext";

// Mock FlexLayoutContext since InterfaceContext depends on it
vi.mock("../../routing/flexLayout/FlexLayoutContext", () => ({
  useFlexLayoutContext: () => ({
    activeTabsetName: "test-tabset",
    activeTab: "test-tab",
  }),
}));

describe("InterfaceContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should provide default values", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(result.current.values.registeredPopups).toEqual([]);
      expect(result.current.values.systemInfoVisible).toBe(false);
      expect(result.current.openedPopupIDs).toBeUndefined();
    });

    it("should provide all action functions", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(result.current.actions.openPopup).toBeDefined();
      expect(typeof result.current.actions.openPopup).toBe("function");
      expect(result.current.actions.closeCurrentPopup).toBeDefined();
      expect(typeof result.current.actions.closeCurrentPopup).toBe("function");
      expect(result.current.actions.toggleSystemInfoVisibility).toBeDefined();
      expect(
        typeof result.current.actions.toggleSystemInfoVisibility
      ).toBe("function");
      expect(result.current.actions.getPopup).toBeDefined();
      expect(typeof result.current.actions.getPopup).toBe("function");
      expect(result.current.actions.getActivePopup).toBeDefined();
      expect(typeof result.current.actions.getActivePopup).toBe("function");
    });
  });

  describe("System Info Visibility", () => {
    it("should start with systemInfoVisible as false", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(result.current.values.systemInfoVisible).toBe(false);
    });

    it("should toggle systemInfoVisible to true", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(result.current.values.systemInfoVisible).toBe(false);

      act(() => {
        result.current.actions.toggleSystemInfoVisibility();
      });

      expect(result.current.values.systemInfoVisible).toBe(true);
    });

    it("should toggle systemInfoVisible back to false", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      act(() => {
        result.current.actions.toggleSystemInfoVisibility();
      });

      expect(result.current.values.systemInfoVisible).toBe(true);

      act(() => {
        result.current.actions.toggleSystemInfoVisibility();
      });

      expect(result.current.values.systemInfoVisible).toBe(false);
    });

    it("should toggle multiple times", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      // Start at false
      expect(result.current.values.systemInfoVisible).toBe(false);

      // Toggle to true
      act(() => {
        result.current.actions.toggleSystemInfoVisibility();
      });
      expect(result.current.values.systemInfoVisible).toBe(true);

      // Toggle back to false
      act(() => {
        result.current.actions.toggleSystemInfoVisibility();
      });
      expect(result.current.values.systemInfoVisible).toBe(false);

      // Toggle to true again
      act(() => {
        result.current.actions.toggleSystemInfoVisibility();
      });
      expect(result.current.values.systemInfoVisible).toBe(true);
    });
  });

  describe("Popup Management", () => {
    it("should have empty registeredPopups initially", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(result.current.values.registeredPopups).toEqual([]);
    });

    it("should call openPopup without errors", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(() => {
        act(() => {
          result.current.actions.openPopup("test-popup");
        });
      }).not.toThrow();
    });

    it("should call closeCurrentPopup without errors", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(() => {
        act(() => {
          result.current.actions.closeCurrentPopup("test-popup");
        });
      }).not.toThrow();
    });

    it("should return null from getPopup when no popups registered", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      let popup;
      act(() => {
        popup = result.current.actions.getPopup("non-existent");
      });

      expect(popup).toBeNull();
    });

    it("should return null from getActivePopup when no popup is active", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      let activePopup;
      act(() => {
        activePopup = result.current.actions.getActivePopup();
      });

      expect(activePopup).toBeNull();
    });

    it("should handle numeric popup IDs", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(() => {
        act(() => {
          result.current.actions.openPopup(123);
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.actions.closeCurrentPopup(123);
        });
      }).not.toThrow();
    });
  });

  describe("Integration with FlexLayoutContext", () => {
    it("should integrate with FlexLayoutContext for active tab tracking", () => {
      // This test verifies that the context uses FlexLayoutContext
      // The actual behavior is mocked, but we ensure no errors occur
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      // Should not throw when FlexLayoutContext is properly mocked
      expect(result.current).toBeDefined();
      expect(result.current.values).toBeDefined();
      expect(result.current.actions).toBeDefined();
    });
  });

  describe("State Persistence", () => {
    it("should persist systemInfoVisible state across re-renders", () => {
      const { result, rerender } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      act(() => {
        result.current.actions.toggleSystemInfoVisibility();
      });

      expect(result.current.values.systemInfoVisible).toBe(true);

      // Force re-render
      rerender();

      expect(result.current.values.systemInfoVisible).toBe(true);
    });

    it("should maintain state through multiple operations", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      act(() => {
        result.current.actions.openPopup("popup-1");
        result.current.actions.toggleSystemInfoVisibility();
        result.current.actions.openPopup("popup-2");
        result.current.actions.closeCurrentPopup("popup-1");
      });

      // After all operations, systemInfoVisible should still be true
      expect(result.current.values.systemInfoVisible).toBe(true);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle rapid open and close operations", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(() => {
        act(() => {
          for (let i = 0; i < 10; i++) {
            result.current.actions.openPopup(`popup-${i}`);
            result.current.actions.closeCurrentPopup(`popup-${i}`);
          }
        });
      }).not.toThrow();
    });

    it("should handle mixed string and number popup IDs", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(() => {
        act(() => {
          result.current.actions.openPopup("string-id");
          result.current.actions.openPopup(123);
          result.current.actions.closeCurrentPopup("string-id");
          result.current.actions.closeCurrentPopup(456);
        });
      }).not.toThrow();
    });

    it("should handle concurrent state updates", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      act(() => {
        result.current.actions.toggleSystemInfoVisibility();
      });

      act(() => {
        result.current.actions.openPopup("concurrent-1");
      });

      act(() => {
        result.current.actions.toggleSystemInfoVisibility();
      });

      act(() => {
        result.current.actions.openPopup("concurrent-2");
      });

      // After two toggles, should be back to false
      expect(result.current.values.systemInfoVisible).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string as popup ID", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(() => {
        act(() => {
          result.current.actions.openPopup("");
        });
      }).not.toThrow();
    });

    it("should handle zero as popup ID", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      expect(() => {
        act(() => {
          result.current.actions.openPopup(0);
        });
      }).not.toThrow();
    });

    it("should maintain registered popups as empty array", () => {
      const { result } = renderHook(() => useInterfaceContext(), {
        wrapper: ({ children }) => (
          <InterfaceContextProvider>{children}</InterfaceContextProvider>
        ),
      });

      // registeredPopups is hardcoded as empty array in implementation
      expect(result.current.values.registeredPopups).toEqual([]);
      expect(Array.isArray(result.current.values.registeredPopups)).toBe(true);
    });
  });
});
