/**
 * @fileoverview Lightweight Cytoscape mock for unit testing.
 *
 * Provides mock implementations of Cytoscape API methods used in CytoscapeGraph component.
 * For integration tests that need real Cytoscape, import the actual library instead.
 */
import {vi} from "vitest";

interface MockCytoscapeElement {
  id: () => string;
  data: (key?: string) => unknown;
  classes: (classes?: string) => void;
  select: () => void;
  unselect: () => void;
}

interface MockCytoscapeCore {
  nodes: ReturnType<typeof vi.fn>;
  elements: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  batch: ReturnType<typeof vi.fn>;
  getElementById: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock Cytoscape element (node or edge).
 */
export const createMockCytoscapeElement = (id: string): MockCytoscapeElement => ({
  id: vi.fn(() => id),
  data: vi.fn((key?: string) => {
    if (key === "id") return id;
    return { id };
  }),
  classes: vi.fn(),
  select: vi.fn(),
  unselect: vi.fn(),
});

/**
 * Creates a mock Cytoscape core instance.
 * Used for most unit tests to avoid actual graph rendering.
 */
export const createMockCytoscape = (): MockCytoscapeCore => {
  const mockElements: MockCytoscapeElement[] = [];

  // Mock nodes collection that can be chained
  const mockNodesCollection = {
    on: vi.fn(),
    off: vi.fn(),
    unselect: vi.fn(),
    select: vi.fn(),
  };

  return {
    nodes: vi.fn(() => mockNodesCollection),
    elements: vi.fn(() => mockElements),
    on: vi.fn(),
    off: vi.fn(),
    batch: vi.fn((fn) => fn()),
    getElementById: vi.fn((id: string) => {
      return mockElements.find((el) => el.id() === id);
    }),
  };
};

/**
 * Mock Cytoscape constructor for vi.mock().
 * Also includes use() and warnings() as properties for module-level calls.
 */
const mockCytoscapeConstructor = Object.assign(
  vi.fn(() => createMockCytoscape()),
  {
    use: vi.fn(),
    warnings: vi.fn(),
  }
);

/**
 * Default mock for cytoscape module.
 * Use this in vi.mock('cytoscape') calls.
 */
export const cytoscapeMock = {
  default: mockCytoscapeConstructor,
  use: vi.fn(),
  warnings: vi.fn(),
};
