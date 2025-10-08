import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import {
  TitleBarContextProvider,
  useTitleBarContextProvider,
  MenuCard,
} from "../TitleBarMenuContext";

describe("TitleBarMenuContext", () => {
  beforeEach(() => {
    // Clear any state between tests
  });

  describe("Initial State", () => {
    it("should provide empty menuCards array initially", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      expect(result.current.values.menuCards).toEqual([]);
    });

    it("should provide addMenuCard and removeMenuCard actions", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      expect(result.current.actions.addMenuCard).toBeDefined();
      expect(typeof result.current.actions.addMenuCard).toBe("function");
      expect(result.current.actions.removeMenuCard).toBeDefined();
      expect(typeof result.current.actions.removeMenuCard).toBe("function");
    });

    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useTitleBarContextProvider());
      }).toThrow("useTitleBarContextProvider must be used within a TitleBarContextProvider");

      console.error = originalError;
    });
  });

  describe("Adding Menu Cards", () => {
    it("should add a menu card to the end by default", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const menuCard: MenuCard = {
        id: "card-1",
        label: "Test Card",
        value: "test-value",
      };

      act(() => {
        result.current.actions.addMenuCard(menuCard);
      });

      expect(result.current.values.menuCards).toHaveLength(1);
      expect(result.current.values.menuCards[0]).toEqual(menuCard);
    });

    it("should add multiple menu cards", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const card1: MenuCard = {
        id: "card-1",
        label: "Card 1",
        value: "value-1",
      };

      const card2: MenuCard = {
        id: "card-2",
        label: "Card 2",
        value: "value-2",
      };

      act(() => {
        result.current.actions.addMenuCard(card1);
      });

      act(() => {
        result.current.actions.addMenuCard(card2);
      });

      expect(result.current.values.menuCards).toHaveLength(2);
      expect(result.current.values.menuCards[0]).toEqual(card1);
      expect(result.current.values.menuCards[1]).toEqual(card2);
    });

    it("should add menu card at specific position", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const card1: MenuCard = { id: "card-1", label: "Card 1", value: "v1" };
      const card2: MenuCard = { id: "card-2", label: "Card 2", value: "v2" };
      const card3: MenuCard = { id: "card-3", label: "Card 3", value: "v3" };

      act(() => {
        result.current.actions.addMenuCard(card1);
      });

      act(() => {
        result.current.actions.addMenuCard(card2);
      });

      // Insert card3 at position 1 (between card1 and card2)
      act(() => {
        result.current.actions.addMenuCard(card3, 1);
      });

      expect(result.current.values.menuCards).toHaveLength(3);
      expect(result.current.values.menuCards[0]).toEqual(card1);
      expect(result.current.values.menuCards[1]).toEqual(card3);
      expect(result.current.values.menuCards[2]).toEqual(card2);
    });

    it("should add menu card at position 0", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const card1: MenuCard = { id: "card-1", label: "Card 1", value: "v1" };
      const card2: MenuCard = { id: "card-2", label: "Card 2", value: "v2" };

      act(() => {
        result.current.actions.addMenuCard(card1);
      });

      // Insert card2 at position 0 (before card1)
      act(() => {
        result.current.actions.addMenuCard(card2, 0);
      });

      expect(result.current.values.menuCards).toHaveLength(2);
      expect(result.current.values.menuCards[0]).toEqual(card2);
      expect(result.current.values.menuCards[1]).toEqual(card1);
    });

    it("should handle menu card with all optional properties", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const complexCard: MenuCard = {
        id: "complex-card",
        label: "Complex Card",
        value: "complex-value",
        tooltipIcon: <div>Tooltip</div>,
        spinnerIcon: <div>Spinner</div>,
        spinnerIconText: "Loading...",
        dot: true,
        percentage: 75,
        timeRemaining: "5 minutes",
      };

      act(() => {
        result.current.actions.addMenuCard(complexCard);
      });

      expect(result.current.values.menuCards).toHaveLength(1);
      expect(result.current.values.menuCards[0]).toEqual(complexCard);
    });
  });

  describe("Removing Menu Cards", () => {
    it("should remove a menu card by id", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const card1: MenuCard = { id: "card-1", label: "Card 1", value: "v1" };
      const card2: MenuCard = { id: "card-2", label: "Card 2", value: "v2" };

      act(() => {
        result.current.actions.addMenuCard(card1);
      });

      act(() => {
        result.current.actions.addMenuCard(card2);
      });

      expect(result.current.values.menuCards).toHaveLength(2);

      act(() => {
        result.current.actions.removeMenuCard("card-1");
      });

      expect(result.current.values.menuCards).toHaveLength(1);
      expect(result.current.values.menuCards[0]).toEqual(card2);
    });

    it("should remove the correct card when multiple cards exist", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const cards: MenuCard[] = [
        { id: "card-1", label: "Card 1", value: "v1" },
        { id: "card-2", label: "Card 2", value: "v2" },
        { id: "card-3", label: "Card 3", value: "v3" },
      ];

      cards.forEach((card) => {
        act(() => {
          result.current.actions.addMenuCard(card);
        });
      });

      // Remove middle card
      act(() => {
        result.current.actions.removeMenuCard("card-2");
      });

      expect(result.current.values.menuCards).toHaveLength(2);
      expect(result.current.values.menuCards[0]).toEqual(cards[0]);
      expect(result.current.values.menuCards[1]).toEqual(cards[2]);
    });

    it("should handle removing non-existent card gracefully", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const card: MenuCard = { id: "card-1", label: "Card 1", value: "v1" };

      act(() => {
        result.current.actions.addMenuCard(card);
      });

      expect(result.current.values.menuCards).toHaveLength(1);

      // Try to remove non-existent card
      act(() => {
        result.current.actions.removeMenuCard("non-existent-id");
      });

      // Should still have the original card
      expect(result.current.values.menuCards).toHaveLength(1);
      expect(result.current.values.menuCards[0]).toEqual(card);
    });

    it("should remove all cards one by one", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const cards: MenuCard[] = [
        { id: "card-1", label: "Card 1", value: "v1" },
        { id: "card-2", label: "Card 2", value: "v2" },
      ];

      cards.forEach((card) => {
        act(() => {
          result.current.actions.addMenuCard(card);
        });
      });

      expect(result.current.values.menuCards).toHaveLength(2);

      act(() => {
        result.current.actions.removeMenuCard("card-1");
      });

      expect(result.current.values.menuCards).toHaveLength(1);

      act(() => {
        result.current.actions.removeMenuCard("card-2");
      });

      expect(result.current.values.menuCards).toHaveLength(0);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle rapid add and remove operations", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      act(() => {
        result.current.actions.addMenuCard(
          { id: "1", label: "Card 1", value: "v1" },
        );
      });

      act(() => {
        result.current.actions.addMenuCard(
          { id: "2", label: "Card 2", value: "v2" },
        );
      });

      act(() => {
        result.current.actions.removeMenuCard("1");
      });

      act(() => {
        result.current.actions.addMenuCard(
          { id: "3", label: "Card 3", value: "v3" },
        );
      });

      act(() => {
        result.current.actions.removeMenuCard("2");
      });

      expect(result.current.values.menuCards).toHaveLength(1);
      expect(result.current.values.menuCards[0].id).toBe("3");
    });

    it("should maintain order after insertions at different positions", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      act(() => {
        result.current.actions.addMenuCard(
          { id: "a", label: "A", value: "a" },
        );
      });

      act(() => {
        result.current.actions.addMenuCard(
          { id: "c", label: "C", value: "c" },
        );
      });

      act(() => {
        result.current.actions.addMenuCard(
          { id: "b", label: "B", value: "b" },
          1
        );
      });

      expect(result.current.values.menuCards.map((c) => c.id)).toEqual([
        "a",
        "b",
        "c",
      ]);
    });

    it("should handle adding duplicate IDs", () => {
      const { result } = renderHook(() => useTitleBarContextProvider(), {
        wrapper: ({ children }) => (
          <TitleBarContextProvider>{children}</TitleBarContextProvider>
        ),
      });

      const card1: MenuCard = { id: "duplicate", label: "First", value: "v1" };
      const card2: MenuCard = {
        id: "duplicate",
        label: "Second",
        value: "v2",
      };

      act(() => {
        result.current.actions.addMenuCard(card1);
      });

      act(() => {
        result.current.actions.addMenuCard(card2);
      });

      // Context doesn't prevent duplicates - it's up to the consumer
      expect(result.current.values.menuCards).toHaveLength(2);

      // Removing by ID will remove all cards with that ID (filter removes all matches)
      act(() => {
        result.current.actions.removeMenuCard("duplicate");
      });

      // Should remove all occurrences with the same ID
      expect(result.current.values.menuCards).toHaveLength(0);
    });
  });

  describe("State Persistence", () => {
    it("should persist menu cards across re-renders", () => {
      const { result, rerender } = renderHook(
        () => useTitleBarContextProvider(),
        {
          wrapper: ({ children }) => (
            <TitleBarContextProvider>{children}</TitleBarContextProvider>
          ),
        }
      );

      const card: MenuCard = { id: "persist", label: "Persist", value: "p" };

      act(() => {
        result.current.actions.addMenuCard(card);
      });

      expect(result.current.values.menuCards).toHaveLength(1);

      // Force re-render
      rerender();

      expect(result.current.values.menuCards).toHaveLength(1);
      expect(result.current.values.menuCards[0]).toEqual(card);
    });
  });
});
