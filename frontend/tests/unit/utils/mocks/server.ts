// MSW server setup for Node.js test environment
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * MSW server instance for intercepting HTTP requests in tests
 * This server runs in Node.js environment (not in the browser)
 */
export const server = setupServer(...handlers);