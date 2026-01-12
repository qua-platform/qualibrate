import { FetchGraphResponse } from "../../../../src/stores/GraphStores/GraphLibrary";

export const MOCK_WORKFLOW_ELEMENTS: FetchGraphResponse = {
  nodes: [
    {
      name: "workflow1",
      data: {
        label: "workflow1",
        condition: false,
        max_iterations: 5,
        subgraph: {
          nodes: [
            {
              name: "wf_node1",
              data: { label: "wf_node1" },
              position: { x: 100, y: 100 },
            },
            {
              name: "wf_node2",
              data: { label: "wf_node2" },
              position: { x: 100, y: 100 },
            },
            {
              name: "wf_node3",
              data: { label: "wf_node3" },
              position: { x: 100, y: 100 },
            },
          ],
          edges: [
            {
              id: "wf_node1-wf_node3",
              source: "wf_node1",
              target: "wf_node3",
              data: { connect_on: true },
              position: { x: 100, y: 100 },
            },
            {
              id: "wf_node2-wf_node2",
              source: "wf_node2",
              target: "wf_node2",
              data: { loop: { content: "some content" } },
              position: { x: 100, y: 100 },
            },
          ],
        },
      },
      position: { x: 100, y: 100 },
    },
    {
      name: "workflow2",
      data: {
        label: "workflow2",
        subgraph: {
          nodes: [
            {
              name: "wf_node1",
              data: { label: "wf_node1" },
              position: { x: 100, y: 100 },
            },
            {
              name: "wf_node2",
              data: { label: "wf_node2" },
              position: { x: 100, y: 100 },
            },
            {
              name: "wf_node3",
              data: { label: "wf_node3" },
              position: { x: 100, y: 100 },
            },
          ],
          edges: [
            {
              id: "wf_node1-wf_node3",
              source: "wf_node1",
              target: "wf_node3",
              data: { connect_on: true },
              position: { x: 100, y: 100 },
            },
          ],
        },
      },
      position: { x: 100, y: 100 },
    },
    {
      name: "node1",
      data: { label: "node1" },
      position: { x: 100, y: 100 },
    },
  ],
  edges: [
    {
      id: "workflow1->workflow1",
      source: "workflow1",
      target: "workflow1",
      data: { loop: {
        label: "repeat-until-success",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        max_iterations: 5,
      } },
      position: { x: 100, y: 100 },
    },
    {
      id: "workflow2->workflow2",
      source: "workflow2",
      target: "workflow2",
      data: { loop: { content: "some content", max_iterations: 5 } },
      position: { x: 100, y: 100 },
    },
    {
      id: "node1->node1",
      source: "node1",
      target: "node1",
      data: { loop: { max_iterations: 15 } },
      position: { x: 100, y: 100 },
    },
    {
      id: "workflow1->workflow2",
      source: "workflow1",
      target: "workflow2",
      data: { connect_on: true },
      position: { x: 100, y: 100 },
    },
    {
      id: "workflow2->node1",
      source: "workflow2",
      target: "node1",
      data: {
        connect_on: false,
        condition: {
          label: "Condition 1",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        },
      },
      position: { x: 100, y: 100 },
    },
  ],
};
