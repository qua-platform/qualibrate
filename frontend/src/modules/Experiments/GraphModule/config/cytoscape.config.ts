import cytoscape from "cytoscape";
import { LIGHT, Theme } from "../../../themeModule/themeHelper";

const darkColors = {
  nodeText: "#C6CDD6",
  nodeTextOutline: "#2B2C32",
  nodeBackground: "#FFF",

  nodeSelectedTextOutline: "#2c7a8b",
  nodeSelectedText: "#FFF",
  nodeSelectedOverlay: "#2CCBE5",

  nodeGrey: "#C2D1D6",
  nodeBlue: "#00B5DD",
  nodeYellow: "#FFB800",
  nodeGreen: "#00AE31",
  nodeRed: "#FF2463",

  edge: "#C2D1D6",
};

const lightColors = {
  nodeText: "#4c4c50",
  nodeTextOutline: "#f7f9fa",
  nodeBackground: "#FFFFFF",

  nodeSelectedTextOutline: "#cef0f6",
  nodeSelectedText: "#212125",
  nodeSelectedOverlay: "#2CCBE5",

  nodeGrey: "#c1d1d6",
  nodeBlue: "#00B5DD",
  nodeYellow: "#FFB800",
  nodeGreen: "#00AE31",
  nodeRed: "#FF2463",

  edge: "#C6CDD6",
};
export const cytoscapeDesign = (theme: Theme): cytoscape.Stylesheet[] => {
  const colors = theme === LIGHT ? lightColors : darkColors;
  return [
    {
      selector: "node",
      style: {
        shape: "ellipse",
        "background-color": colors.nodeBackground,
        "border-width": "4px",
        "border-color": colors.nodeGrey,
        "font-family": "Roboto",
        label: "data(id)",
        "text-valign": "bottom",
        "text-halign": "center",
        width: 38,
        height: 38,
        "underlay-shape": "ellipse",
        "underlay-color": colors.nodeBackground,
        "underlay-padding": "5px",
        "underlay-opacity": "1",
        color: colors.nodeText,
        "text-margin-y": "13px",
        "text-outline-color": colors.nodeTextOutline,
        "text-outline-opacity": "1",
        "text-outline-width": "3",
        padding: "0px",
        "background-width": "60%",
        "background-height": "60%",
      },
    },
    {
      selector: ":selected",
      css: {
        "overlay-shape": "ellipse",
        "overlay-color": colors.nodeSelectedOverlay,
        "overlay-opacity": 0.3,
        "overlay-padding": "9px",
        color: colors.nodeSelectedText,
        "text-outline-color": colors.nodeSelectedOverlay,
        "text-outline-width": 2,
        "font-weight": "500",
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        width: 1,
        "mid-target-arrow-shape": "triangle",
        "mid-target-arrow-color": colors.edge,
        "line-color": colors.edge,
      },
    },
    {
      selector: ".initialised",
      style: {
        "border-color": colors.nodeYellow,
      },
    },
    {
      selector: ".finished",
      style: {
        "border-color": colors.nodeGreen,
      },
    },
    {
      selector: ".error",
      style: {
        "border-color": colors.nodeRed,
      },
    },
    {
      selector: ".running",
      style: {
        "border-color": colors.nodeBlue,
      },
    },
  ];
};
