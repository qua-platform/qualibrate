// Test utilities for React component testing
import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

/**
 * Minimal mock providers for testing components in isolation
 * Add additional providers as needed for specific test scenarios
 */
const MockedProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <BrowserRouter>{children}</BrowserRouter>;

/**
 * Custom render function that wraps components with necessary providers
 * Usage: import { render } from '@/test-utils/providers';
 */
const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: MockedProviders, ...options });

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Override the default render with our custom one
export { customRender as render };