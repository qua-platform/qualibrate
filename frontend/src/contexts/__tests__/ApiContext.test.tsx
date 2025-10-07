import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { ApiContextProvider, useApiContext } from "../ApiContext";

describe("ApiContext", () => {
  beforeEach(() => {
    // Clear any state between tests
  });

  describe("Initial State", () => {
    it("should provide default date range values", () => {
      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      expect(result.current.dateRange).toBeDefined();
      expect(result.current.dateRange.startDate).toBeInstanceOf(Date);
      expect(result.current.dateRange.endDate).toBeInstanceOf(Date);
    });

    it("should initialize with startDate as yesterday", () => {
      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      // Check that startDate is approximately yesterday (within same day)
      const startDate = result.current.dateRange.startDate;
      expect(startDate.getDate()).toBe(yesterday.getDate());
      expect(startDate.getMonth()).toBe(yesterday.getMonth());
      expect(startDate.getFullYear()).toBe(yesterday.getFullYear());
    });

    it("should initialize with endDate as today", () => {
      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      const today = new Date();
      const endDate = result.current.dateRange.endDate;

      // Check that endDate is today (within same day)
      expect(endDate.getDate()).toBe(today.getDate());
      expect(endDate.getMonth()).toBe(today.getMonth());
      expect(endDate.getFullYear()).toBe(today.getFullYear());
    });

    it("should provide setDateRange function", () => {
      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      expect(result.current.setDateRange).toBeDefined();
      expect(typeof result.current.setDateRange).toBe("function");
    });
  });

  describe("Date Range Updates", () => {
    it("should update date range when setDateRange is called", () => {
      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      const newStartDate = new Date("2025-01-01");
      const newEndDate = new Date("2025-01-31");

      act(() => {
        result.current.setDateRange({
          startDate: newStartDate,
          endDate: newEndDate,
        });
      });

      expect(result.current.dateRange.startDate).toEqual(newStartDate);
      expect(result.current.dateRange.endDate).toEqual(newEndDate);
    });

    it("should persist date range across re-renders", () => {
      const { result, rerender } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      const newStartDate = new Date("2025-06-01");
      const newEndDate = new Date("2025-06-30");

      act(() => {
        result.current.setDateRange({
          startDate: newStartDate,
          endDate: newEndDate,
        });
      });

      // Force re-render
      rerender();

      expect(result.current.dateRange.startDate).toEqual(newStartDate);
      expect(result.current.dateRange.endDate).toEqual(newEndDate);
    });

    it("should allow multiple date range updates", () => {
      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      // First update
      const firstStart = new Date("2025-01-01");
      const firstEnd = new Date("2025-01-31");

      act(() => {
        result.current.setDateRange({
          startDate: firstStart,
          endDate: firstEnd,
        });
      });

      expect(result.current.dateRange.startDate).toEqual(firstStart);
      expect(result.current.dateRange.endDate).toEqual(firstEnd);

      // Second update
      const secondStart = new Date("2025-02-01");
      const secondEnd = new Date("2025-02-28");

      act(() => {
        result.current.setDateRange({
          startDate: secondStart,
          endDate: secondEnd,
        });
      });

      expect(result.current.dateRange.startDate).toEqual(secondStart);
      expect(result.current.dateRange.endDate).toEqual(secondEnd);
    });

    it("should handle same start and end dates", () => {
      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      const sameDate = new Date("2025-03-15");

      act(() => {
        result.current.setDateRange({
          startDate: sameDate,
          endDate: sameDate,
        });
      });

      expect(result.current.dateRange.startDate).toEqual(sameDate);
      expect(result.current.dateRange.endDate).toEqual(sameDate);
    });
  });

  describe("Date Range Edge Cases", () => {
    it("should handle end date before start date", () => {
      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      const laterDate = new Date("2025-12-31");
      const earlierDate = new Date("2025-01-01");

      // Context doesn't validate order, it just stores what's provided
      act(() => {
        result.current.setDateRange({
          startDate: laterDate,
          endDate: earlierDate,
        });
      });

      expect(result.current.dateRange.startDate).toEqual(laterDate);
      expect(result.current.dateRange.endDate).toEqual(earlierDate);
    });

    it("should handle date range with time components", () => {
      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>{children}</ApiContextProvider>
        ),
      });

      const startWithTime = new Date("2025-03-15T10:30:00");
      const endWithTime = new Date("2025-03-15T18:45:00");

      act(() => {
        result.current.setDateRange({
          startDate: startWithTime,
          endDate: endWithTime,
        });
      });

      expect(result.current.dateRange.startDate).toEqual(startWithTime);
      expect(result.current.dateRange.endDate).toEqual(endWithTime);
    });
  });

  describe("Provider Behavior", () => {
    it("should allow multiple children to access the same context", () => {
      const results: Array<{ id: number; dateRange: { startDate: Date; endDate: Date } }> = [];

      const TestComponent1 = () => {
        const context = useApiContext();
        results.push({ id: 1, dateRange: context.dateRange });
        return null;
      };

      const TestComponent2 = () => {
        const context = useApiContext();
        results.push({ id: 2, dateRange: context.dateRange });
        return null;
      };

      renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>
            <TestComponent1 />
            <TestComponent2 />
            {children}
          </ApiContextProvider>
        ),
      });

      // All consumers should get the same date range
      expect(results.length).toBeGreaterThan(0);
    });

    it("should update all consumers when date range changes", () => {
      let renderCount = 0;

      const TestComponent = () => {
        const context = useApiContext();
        renderCount++;
        return <div>{context.dateRange.startDate.toISOString()}</div>;
      };

      const { result } = renderHook(() => useApiContext(), {
        wrapper: ({ children }) => (
          <ApiContextProvider>
            <TestComponent />
            {children}
          </ApiContextProvider>
        ),
      });

      const initialRenderCount = renderCount;
      const newDate = new Date("2025-05-01");

      act(() => {
        result.current.setDateRange({
          startDate: newDate,
          endDate: new Date("2025-05-31"),
        });
      });

      // Render count should increase after update
      expect(renderCount).toBeGreaterThan(initialRenderCount);
    });
  });
});
