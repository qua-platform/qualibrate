// MSW (Mock Service Worker) request handlers for API mocking
import { http, HttpResponse } from "msw";

/**
 * Mock API handlers for testing
 * These handlers intercept HTTP requests and return mock responses
 *
 * Note: MSW cannot intercept WebSocket connections (ws:// protocol).
 * WebSocket connections are mocked at the global level in setup.ts
 */
export const handlers = [
  // Node endpoints
  http.get("/execution/get_nodes", () => {
    return HttpResponse.json([
      {
        name: "test_cal",
        parameters: {
          resonator: "q1.resonator",
          sampling_points: 100,
          noise_factor: 0.1,
        },
        runnable: true,
      },
    ]);
  }),

  http.post("/execution/submit/node", () => {
    return HttpResponse.json({
      jobId: "job-123",
      status: "submitted",
    });
  }),

  // Project endpoints
  http.get("/api/projects/", () => {
    return HttpResponse.json([{ name: "test-project", id: 1 }]);
  }),

  http.get("/api/project/active", () => {
    return HttpResponse.json("test-project");
  }),

  // Snapshot endpoints
  http.get("/api/snapshot/:id/", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: Number(id),
      timestamp: new Date().toISOString(),
      data: { results: "mock-data" },
    });
  }),

  // Snapshots history endpoint (called by SnapshotsContext)
  http.get("/api/branch/:branch/snapshots_history", () => {
    return HttpResponse.json({
      items: [],
      total: 0,
      page: 1,
      per_page: 100,
    });
  }),

  // Snapshot comparison endpoint (called by SnapshotsContext)
  http.get("/api/snapshot/:id/compare", () => {
    return HttpResponse.json({
      comparison: {},
      differences: [],
    });
  }),

  // Data file content endpoint (called by SnapshotsContext)
  http.get("/api/data_file/:id/content", () => {
    return HttpResponse.json({
      content: "",
      filename: "test.json",
    });
  }),

  // Last run info endpoint (called by NodesContext)
  http.get("/execution/last_run_info", () => {
    return HttpResponse.json(null);
  }),
];