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

  // Last run info endpoint (called by NodesContext.fetchNodeResults)
  // Returns null to indicate no previous run (no active/previous calibration execution)
  // This is the expected response when there's no prior calibration run
  http.get("/execution/last_run/", () => {
    return HttpResponse.json(null, { status: 200 });
  }),

  // Get all graphs endpoint (called by GraphContext.fetchAllCalibrationGraphs)
  http.get("/execution/get_graphs", () => {
    return HttpResponse.json({
      test_workflow: {
        name: "test_workflow",
        title: "Test Workflow",
        description: "A test workflow graph",
        parameters: {},
        nodes: {
          node1: {
            name: "test_cal",
            parameters: {}
          }
        }
      }
    });
  }),

  // Execution history endpoint (called by GraphStatusContext.fetchAllMeasurements)
  http.get("/execution/last_run/workflow/execution_history", () => {
    return HttpResponse.json({
      items: [],
      total: 0
    });
  }),

  // Redirect endpoint (called during app initialization)
  http.get("/api/redirect", () => {
    return HttpResponse.json({
      page: "home"
    });
  }),
];