# Development

### Running the Development Server

```bash
npm run start               # Default dev server (don't use - won't work with backend)
npm run start:local:dev     # With .env file
npm run start:dev           # Against dev server (don't use - won't work with backend)
```

```env
API_URL=http://127.0.0.1:8001/
baseUrl=http://localhost:1234
WS_PROTOCOL=ws
WS_BASE_URL=127.0.0.1:8001/
USE_RELATIVE_PATHS=false
PUBLIC_PATH="/"
DASHBOARD_APP_PATH=http://127.0.0.1:8001
```

### Production Build

```bash
npm run build    # Creates dist/ directory
npm run clean    # Clean dist directory
```

### Code Quality

```bash
npm run lint           # ESLint + Stylelint
npm run lint:fix       # Auto-fix issues
npm run format         # Prettier formatting
```

## Testing

Two types of tests:
- **Unit Tests** (Vitest) - Fast, no backend required
- **E2E Tests** (Playwright) - Slow, requires backend

### Unit Tests (Vitest)

Fast tests for development. No backend required.

```bash
npm test                    # Run all unit tests
npm run test:unit:watch     # Watch mode (recommended)
npm run test:unit:ui        # Interactive UI
npm run test:unit:debug     # Prints debug messages during tests (disabled by default)
npm run test:unit:coverage  # Coverage report
npm run test:contexts       # Context tests only
npm run test:components     # Component tests only
```

**Test Structure:**
```
src/
├── test-utils/             # Test setup and utilities
│   ├── setup.ts           # Global configuration
│   ├── providers.tsx      # React test wrappers
│   └── mocks/             # MSW API mocks
├── contexts/__tests__/    # Context tests
└── modules/*/tests/       # Component tests
```

**Console Output Suppression:**

Console output and stderr are buffered during Vitest execution and only shown  if a test fails. This keeps output clean when all tests pass, but shows helpful debug information when tests fail.

To see ALL console output (even for passing tests):
- Set environment variable: DEBUG_TESTS=true npm test
- Or use npm script: npm run test:unit:debug

### E2E Tests (Playwright)

Slow integration tests. **Requires backend running.**

**Prerequisites:**
```bash
# Start backend first
qualibrate start
```

Then wait for the backend to be ready (should see server logs)

**Running E2E Tests:**
```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:headed   # With visible browser
npm run test:e2e:debug    # With debugger
npm run test:e2e:ui       # Playwright UI mode
```

**Configuration:**
- Location: `tests/e2e/`
- Config: `tests/playwright.config.ts`
- Timeout: 60 seconds
- Retries: 1 locally, 2 in CI

### Test Workflow

**During development:**
```bash
npm run test:unit:watch   # Auto-runs on file changes
```

**Before committing:**
```bash
npm test                  # Unit tests
npm run lint             # Code quality
```

**Before deploying:**
```bash
npm run test:all         # Unit + E2E (requires backend)
```

## Deployment

The `dist/` directory is served by the FastAPI backend in production. Build the frontend before starting the backend:

```bash
npm run build
```


# Documentation Standards

## Format

Use **[JSDoc](https://jsdoc.app/)** for all documentation comments.

```typescript
/**
 * Brief description.
 * Additional details if needed.
 *
 * @param paramName - Description
 * @returns Description
 * @throws Error types if applicable
 * @example
 * // Only if truly complex
 */
```

## What to Document

- Purpose and motivation
- Non-obvious algorithms
- Integration points
- Workarounds and known issues

## Examples of style

```typescript
/** WebSocket lifecycle states. Auto-reconnects on failure. */
enum ConnectionState { }
```

**Complex interfaces**: Document purpose, not every property.

```typescript
/**
 * Real-time calibration execution status.
 * Discriminated by runnable_type: "node" | "graph".
 */
export type RunStatusType = {
  is_running: boolean;
  runnable_type: "node" | "graph";
  node: NodeExecution | null;
  graph: GraphItem | null;
};
```

**Functions**: Only document non-obvious parameters.

```typescript
/**
 * Subscribe to WebSocket messages.
 * @returns Unsubscribe function
 */
subscribe(cb: (data: T) => void): () => void;
```

**Inline comments**: Only for non-obvious logic.

```typescript
// FlexLayout doesn't expose name in public API
// @ts-expect-error - _attributes exists but not typed
return node._attributes.name === name;
```

**Examples**: Only if truly complex.

```typescript
// Adds value
/**
 * @example
 * const unsub = ws.subscribe(data => console.log(data));
 * unsub(); // cleanup
 */

// Obvious
/**
 * @example
 * const state = ws.getConnectionState();
 */
```

## When to Add MORE Detail

Sometimes parameters need explanation even when types are clear:

```typescript
// Too brief - units and behavior unclear
/**
 * Connect to WebSocket.
 */
connect(retryDelay: number): void;

// Good - explains units and behavior
/**
 * Connect to WebSocket with automatic reconnection.
 * @param retryDelay - Milliseconds between reconnection attempts (default: 1000)
 */
connect(retryDelay: number = 1000): void;
```

```typescript
// Too brief - doesn't explain the "why"
/**
 * Wraps Cytoscape elements.
 */
const wrapElements = (elements: ElementDefinition[]) => { };

// Good - explains purpose and side effects
/**
 * Adds background images to Cytoscape elements for node type icons.
 * Icons loaded from /assets/icons/ named by node group (e.g., "calibration.svg").
 */
const wrapElements = (elements: ElementDefinition[]) => { };
```

```typescript
// Too brief - boolean flags need context
/**
 * Fetch nodes.
 */
fetchAllNodes(rescan: boolean): Promise<void>;

// Good - explains cost and when to use
/**
 * Fetch all calibration nodes from backend.
 * @param rescan - Force backend to re-scan node library (slow, use sparingly)
 */
fetchAllNodes(rescan: boolean = false): Promise<void>;
```

Document side effects and non-obvious behavior:

```typescript
// Missing important information
/**
 * Open tab in layout.
 */
openNewTab(key: string): void;

// Good - explains singleton behavior
/**
 * Open tab in layout.
 * For singleton tabs (nodes, graph-library), focuses existing instead of creating duplicate.
 */
openNewTab(key: string): void;
```
