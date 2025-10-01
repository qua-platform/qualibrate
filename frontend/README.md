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

**Local development with environment file:**
```bash
npm run start:local:dev
```

Requires a `.env` file in the `frontend/` directory with:
```env
API_URL=http://127.0.0.1:8001/
baseUrl=http://localhost:1234
WS_PROTOCOL=ws
WS_BASE_URL=127.0.0.1:8001/
USE_RELATIVE_PATHS=false
PUBLIC_PATH="/"
```

**Development against dev server:**
```bash
npm run start:dev
```

The development server will open automatically at `http://localhost:1234/`.

### Available Scripts

**Development:**
- `npm run start` - Start Webpack dev server
- `npm run start:local:dev` - Start with `.env` file
- `npm run start:dev` - Start against dev server

**Building:**
- `npm run build` - Production build (creates `dist/`)
- `npm run clean` - Clean dist directory

**Code Quality:**
- `npm run lint` - Run ESLint + Stylelint
- `npm run lint:code` - Run ESLint only
- `npm run lint:style` - Run Stylelint only
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format with Prettier

**Testing:**
- `npm run test:e2e` - Run E2E tests (Playwright)
- `npm run test:e2e:headed` - Run tests with visible browser
- `npm run test:e2e:debug` - Run tests with Playwright inspector
- `npm run test:e2e:ui` - Run tests with Playwright UI mode

## Testing

### End-to-End Tests (Playwright)

The E2E tests verify complete user workflows including node execution, parameter modification, and results validation.

**Prerequisites:**
1. **Start the QUAlibrate backend** before running tests:
   ```bash
   # From the root QUAlibrate directory
   qualibrate start
   # Then in a separate terminal:
   cd frontend
   ```

2. Wait for the backend to be ready (should see server logs and be accessible at `http://localhost:8001/`)

**Running Tests:**

```bash
# Run all E2E tests
npm run test:e2e

# Run with visible browser (helpful for debugging)
npm run test:e2e:headed

# Run with Playwright debugger
npm run test:e2e:debug

# Run with Playwright UI (interactive mode)
npm run test:e2e:ui
```

**From the tests directory:**
```bash
cd tests
npm run test                    # All tests
npm run test:workflow1          # Specific workflow test
```

**Test Configuration:**
- Tests are located in `tests/e2e/`
- Configuration: `tests/playwright.config.ts`
- Test timeout: 60 seconds (for calibration job execution)
- Retries: 1 locally, 2 in CI
- Screenshots and videos captured on failure

**Troubleshooting Tests:**
- Ensure backend is running at `http://localhost:8001/`
- Check that `qualibrate-examples` repository is available for calibration scripts
- View test traces: `npx playwright show-trace <path-to-trace.zip>`

## Production Build

Build the frontend for production:

```bash
npm run build
```

This creates optimized files in the `dist/` directory, which are served by the FastAPI backend in production.

**Note:** The backend requires the frontend to be built before it can serve the static files.
