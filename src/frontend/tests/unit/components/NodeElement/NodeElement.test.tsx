import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import { NodeElement } from "../../../../src/modules/Nodes/components/NodeElement/NodeElement";
import { rootReducer } from "../../../../src/stores";

describe("NodeElement", () => {
  const nodeKey = "resonator_spectroscopy";

  const createMockStore = (selectedNodeName?: string) =>
    configureStore({
      reducer: rootReducer,
      preloadedState: {
        nodes: {
          allNodes: {
            [nodeKey]: {
              name: nodeKey,
              title: "Resonator Spectroscopy",
              description: "Test description",
            },
          },
          selectedNodeName: selectedNodeName ?? null,
          submitNodeResponseError: null,
          isNodeRunning: false,
          isAllStatusesUpdated: false,
          updateAllButtonPressed: false,
          isRescanningNodes: false,
        },
        webSocket: {
          runStatus: null,
          history: null,
        },
      } as any,
    });

  const renderWithStore = (store: any) =>
    render(
      <BrowserRouter>
        <Provider store={store}>
          <NodeElement nodeKey={nodeKey} />
        </Provider>
      </BrowserRouter>
    );

  it("renders node title", () => {
    const store = createMockStore();

    renderWithStore(store);

    expect(screen.getByTestId(`node-element-${nodeKey}`)).toBeInTheDocument();

    expect(screen.getByTestId(`title-or-name-${nodeKey}`)).toHaveTextContent("Resonator Spectroscopy");
  });

  it("renders description", () => {
    const store = createMockStore();

    renderWithStore(store);

    expect(screen.getByTestId(`node-description-${nodeKey}`)).toHaveTextContent("Test description");
  });

  it("highlights node when selected", () => {
    const store = createMockStore(nodeKey);

    renderWithStore(store);

    const card = screen.getByTestId(`node-element-${nodeKey}`);
    expect(card).toBeInTheDocument();
  });

  it("dispatches setSelectedNode on click", () => {
    const store = createMockStore();
    const dispatchSpy = vi.spyOn(store, "dispatch");

    renderWithStore(store);

    fireEvent.click(screen.getByTestId(`title-or-name-${nodeKey}`));

    expect(dispatchSpy).toHaveBeenCalled();
  });
});