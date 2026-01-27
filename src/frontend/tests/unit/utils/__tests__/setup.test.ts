// Verification test to ensure test infrastructure is working correctly
import { describe, it, expect } from "vitest";

describe("Test Setup Verification", () => {
  it("should run basic assertions", () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  it("should have WebSocket mock available", () => {
    expect(global.WebSocket).toBeDefined();
    expect(typeof global.WebSocket).toBe("function");
  });

  it("should have IntersectionObserver mock available", () => {
    expect(global.IntersectionObserver).toBeDefined();
    expect(typeof global.IntersectionObserver).toBe("function");
  });

  it("should have ResizeObserver mock available", () => {
    expect(global.ResizeObserver).toBeDefined();
    expect(typeof global.ResizeObserver).toBe("function");
  });

  it("should be able to create mock WebSocket instance", () => {
    const ws = new global.WebSocket("ws://localhost:8001");
    expect(ws).toBeDefined();
    expect(ws.readyState).toBeDefined();
    expect(ws.send).toBeDefined();
    expect(ws.close).toBeDefined();
  });

  it("should support vitest globals", () => {
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });
});