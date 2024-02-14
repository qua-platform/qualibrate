import cytoscape, { ElementDefinition, EventObject } from "cytoscape";
import { useContext, useEffect, useMemo, useRef } from "react";
import { cytoscapeDesign } from "./config/cytoscape.config";
import { CytoscapeLayout } from "./config/Cytoscape";
import { NodeData } from "../types";
import GlobalThemeContext from "../../themeModule/GlobalThemeContext";

cytoscape.warnings(false);

type Props = {
  elements: ElementDefinition[];
  onNodeClick: (node: NodeData) => void;
  onClickOutside: () => void;
};
export default function CytoscapeGraph({ elements, onNodeClick, onClickOutside }: Props) {
  const { theme } = useContext(GlobalThemeContext);
  const style = useMemo(() => cytoscapeDesign(theme), [theme]);
  const cy = useRef<cytoscape.Core>();
  const divRef = useRef(null);

  useEffect(() => {
    if (!cy.current) {
      cy.current = cytoscape({
        container: divRef.current,
        elements,
        style,
        layout: CytoscapeLayout,
        zoom: 1,
        minZoom: 0.4,
        maxZoom: 1.6,
        wheelSensitivity: 0.1,
      });
    } else {
      // update style around node if its status is changed
      cy.current.batch(() => {
        const allElements = cy.current?.elements() ?? [];
        allElements.forEach((element) => {
          const newElement = elements.find((s) => s.data.id === element.id());
          if (newElement) {
            element.classes(newElement.classes);
          }
        });
      });
    }
  }, [elements, style]);

  useEffect(() => {
    const onClickN = (e: EventObject) => {
      onNodeClick(e.target.data() as NodeData);
    };
    cy.current?.nodes().on("click", onClickN);

    return () => {
      cy.current?.nodes().off("click", "node");
    };
  }, [onNodeClick, cy.current]);

  useEffect(() => {
    const onClick = (e: EventObject) => {
      if (e.target === cy.current) {
        onClickOutside();
      }
    };
    cy.current?.on("click", onClick);

    return () => {
      cy.current?.off("click", onClick);
    };
  }, [onClickOutside, cy.current]);

  return <div ref={divRef} style={{ height: "100%", width: "100%" }} />;
}
