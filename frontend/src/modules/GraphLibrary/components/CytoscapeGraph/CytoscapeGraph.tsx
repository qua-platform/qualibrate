/**
 * @fileoverview Interactive graph visualization component using Cytoscape.js.
 *
 * Renders calibration workflow graphs with node selection, auto-layout, and
 * real-time status updates. Synchronizes selection state across GraphContext,
 * GraphStatusContext, and SelectionContext.
 *
 * @see GraphContext - Manages graph and node selection state
 * @see GraphElement - Uses this for workflow preview
 * @see MeasurementElementGraph - Uses this for execution status visualization
 */
import cytoscape, { ElementDefinition, EventObject } from "cytoscape";
import { useEffect, useRef } from "react";
import { CytoscapeLayout } from "./config/Cytoscape";

import styles from "./CytoscapeGraph.module.scss";
import klay from "cytoscape-klay";
import { setTrackLatest } from "../../../../stores/GraphStores/GraphStatus/actions";
import { useSelector } from "react-redux";
import { getSelectedNodeNameInWorkflow } from "../../../../stores/GraphStores/GraphCommon/selectors";
import { setSelectedNodeNameInWorkflow } from "../../../../stores/GraphStores/GraphCommon/actions";
import { useRootDispatch } from "../../../../stores";

cytoscape.use(klay);
cytoscape.warnings(false);

interface IProps {
  elements: ElementDefinition[];
  onNodeClick?: (name: string) => void;
}

export default function CytoscapeGraph({ elements, onNodeClick }: IProps) {
  /**
   * Maps node group names to icon file paths.
   * Icons are stored in /assets/icons/ and named by node group.
   */
  const getNodeIcon = (nodeName: string) => {
    return `/assets/icons/${nodeName}.svg`;
  };

  /**
   * Adds background images to Cytoscape elements for node type icons.
   */
  const wrapCytoscapeElements = (elements: cytoscape.ElementDefinition[]) => {
    return elements.map((el) => {
      const deepClone = JSON.parse(JSON.stringify(el));
      return {
        ...deepClone,
        style: {
          backgroundImage: getNodeIcon(el.group ? el.group.toString() : ""),
        },
      };
    });
  };

  const cytoscapeElements = wrapCytoscapeElements(elements);
  const dispatch = useRootDispatch();
  const selectedNodeNameInWorkflow = useSelector(getSelectedNodeNameInWorkflow);
  const cy = useRef<cytoscape.Core>();
  const divRef = useRef(null);

  const style = [
    {
      selector: "node",
      style: {
        "background-color": "#ffffff",
        label: "data(id)",
        width: "50px",
        height: "50px",
        "border-width": "2px",
        "border-color": "#000",
        color: "#a8a6a6",
      },
    },
    {
      selector: ":selected",
      css: {
        "background-color": "#3b93dc",
        "border-width": "1px",
        "text-outline-width": 0.3,
        "font-weight": 1,
        "font-color": "#ffffff",
      },
    },
    {
      selector: "edge",
      style: {
        width: 5,
        "line-color": "#cbc4c4",
        "target-arrow-color": "#cbc4c4",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "font-color": "#c9bcbc",
      },
    },
  ];
  useEffect(() => {
    if (elements) {
      if (!cy.current) {
        cy.current = cytoscape({
          container: divRef.current,
          elements: cytoscapeElements,
          style,
          layout: CytoscapeLayout,
          zoom: 1,
          minZoom: 0.1,
          maxZoom: 1.6,
          wheelSensitivity: 0.1,
        });
      } else {
        // Batch update node classes for status changes (running, completed, failed)
        cy.current.batch(() => {
          const allElements = cy.current?.elements() ?? [];
          allElements.forEach((element) => {
            const newElement = elements?.find((s) => s.data.id === element.id());
            if (newElement) {
              element.classes(newElement.classes as string);
            }
          });
        });
      }
    }
  }, [elements]);

  useEffect(() => {
    if (selectedNodeNameInWorkflow) {
      cy.current?.nodes().unselect();
      const targetNode = cy.current?.getElementById(selectedNodeNameInWorkflow);
      if (targetNode) {
        targetNode.select();
      }
    } else {
      cy.current?.nodes().unselect();
    }
  }, [selectedNodeNameInWorkflow]);

  useEffect(() => {
    const onClickN = (e: EventObject) => {
      // Disable "track latest" when manually selecting a node
      dispatch(setTrackLatest(false));
      dispatch(setSelectedNodeNameInWorkflow((e.target.data() as { id: string }).id));
      if (onNodeClick) {
        onNodeClick((e.target.data() as { id: string }).id);
      }
    };
    cy.current?.nodes().on("click", onClickN);

    return () => {
      cy.current?.nodes().off("click", "node");
    };
  }, [setSelectedNodeNameInWorkflow, cy.current]);

  useEffect(() => {
    // Clear selection when clicking graph background
    const onClick = (e: EventObject) => {
      if (e.target === cy.current) {
        dispatch(setSelectedNodeNameInWorkflow(undefined));
      }
    };
    cy.current?.on("click", onClick);

    return () => {
      cy.current?.off("click", onClick);
    };
  }, [setSelectedNodeNameInWorkflow, cy.current]);

  return <div ref={divRef} className={styles.wrapper} />;
}
