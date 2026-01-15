# QUAlibrate Frontend (UI)

## Stack:

### Typescript, React, Webpack, EsLint, SCSS

## Installation:
- **Node.js** (version 16 or higher recommended)
- **npm** (comes with Node.js)
- **QUAlibrate backend** running at `http://localhost:8001` (for development and testing)

## How to run:

In order to connect the frontend part to a custom API service you can use env.
variable API_URL.  
Example: `API_URL=https://foo.bar/api npm run start`
Install dependencies:

```bash
npm install
```

## Development

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

Console output and stderr are buffered during Vitest execution and only shown if a test fails. This keeps output clean when all tests pass, but shows helpful debug information when tests fail.

To see ALL console output (even for passing tests):
- Set environment variable: DEBUG_TESTS=true npm test
- Or use npm script: npm run test:unit:debug

**Unit test tricks**

When debugging unit tests, it can be useful to insert this into the code:
```
screen.logTestingPlaygroundURL();
```
This will print a link to a page with a playground for testing components specific to the test.

If you use the debugger on a test, if you're at a breakpoint, you can observe the test DOM with commands like this:
- document.body.innerHTML
- document.querySelector('.test-name')
- document.querySelector('.test-name').innerHTML

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