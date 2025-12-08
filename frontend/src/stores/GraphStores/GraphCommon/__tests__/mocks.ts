import { FetchGraphResponse } from "@/stores/GraphStores/GraphLibrary";

export const MOCK_WORKFLOW_ELEMENTS: FetchGraphResponse = {
  nodes: [
    {
      id: 1,
      loop: true,
      data: {
        label: "workflow1",
        condition: false,
        max_iterations: 5,
        subgraph: {
          nodes: [
            {
              id: 1,
              loop: false,
              data: { label: "wf_node1" },
              position: { "x": 100, "y": 100 }
            },
            {
              id: 2,
              loop: false,
              data: { label: "wf_node2" },
              position: { "x": 100, "y": 100 }
            },
            {
              id: 3,
              loop: false,
              data: { label: "wf_node3" },
              position: { "x": 100, "y": 100 }
            },
          ],
          edges: [
            {
              id: "wf_node1-wf_node3",
              source: 1,
              target: 3,
              data: { condition: true },
              position: { "x": 100, "y": 100 }
            },
          ],
        }
      },
      position: { "x": 100, "y": 100 }
    },
    {
      id: 2,
      loop: false,
      data: {
        label: "workflow2",
        subgraph: {
          nodes: [
            {
              id: 1,
              loop: false,
              data: { label: "wf_node1" },
              position: { "x": 100, "y": 100 }
            },
            {
              id: 2,
              loop: false,
              data: { label: "wf_node2" },
              position: { "x": 100, "y": 100 }
            },
            {
              id: 3,
              loop: false,
              data: { label: "wf_node3" },
              position: { "x": 100, "y": 100 }
            },
          ],
          edges: [
            {
              id: "wf_node1-wf_node3",
              source: 1,
              target: 3,
              data: { condition: true },
              position: { "x": 100, "y": 100 }
            },
          ],
        }
      },
      position: { "x": 100, "y": 100 }
    },
    {
      id: 3,
      loop: false,
      data: { label: "node1" },
      position: { "x": 100, "y": 100 }
    }
  ],
  edges: [
    {
      id: "workflow1-workflow2",
      source: 1,
      target: 2,
      data: { condition: true },
      position: {  "x": 100, "y": 100  }
    },
    {
      id: "workflow2-node1",
      source: 2,
      target: 3,
      data: { condition: true },
      position: { "x": 100, "y": 100 }
    },
  ],
};
