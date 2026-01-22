import prismColors from "./prismColors";
import diffColors from "./diffColors";

export const DARK = "dark";
export const LIGHT = "light";

// import "prismjs/themes/prism.css";
// import "prism-color-variables/variables.css";
export type Theme = "dark" | "light";

export const updateColorTheme = () => {
  const theme = getColorTheme();
  const arrayOfVariableKeys = Object.keys(colors);
  const arrayOfVariableValues = Object.values(colors);
  arrayOfVariableKeys.forEach((cssVariableKey, index) => {
    document.documentElement.style.setProperty(cssVariableKey, arrayOfVariableValues[index][theme]);
  });
};

export const toggleColorTheme = (): Theme => {
  const cur = getColorTheme();
  return setColorTheme(cur === LIGHT ? DARK : LIGHT);
};

const setColorTheme = (theme: Theme): Theme => {
  localStorage.setItem("colorTheme", theme);
  updateColorTheme();
  return theme;
};

export const getColorTheme = (): Theme => {
  const color = localStorage.getItem("colorTheme") || "";
  if (![DARK, LIGHT].includes(color)) {
    return DARK;
  }
  return <Theme>color;
};

type ThemedColor = { dark: string; light: string };
export type Colors = {
  [key: string]: ThemedColor;
};

const colors: Colors = {
  ...prismColors,
  ...diffColors,
  "--disabled-tab": {
    dark: "rgba(43, 44, 50, 0.5)",
    light: "rgba(246, 249, 250, 0.6)",
  },
  "--selected-tab": { dark: "#2b2c32", light: "#F6F9FA" },
  "--layout-background": { dark: "#212125", light: "#e1e9ec" },
  "--background-color": { dark: "#2b2c32", light: "#f6f9fa" },
  "--active-text": { dark: "#2ccbe5", light: "#0FB0CB" },
  "--copy-field": { dark: "#C6CDD626", light: "#C2D1D64D" },

  //buttons
  "--blue-button": { dark: "#05869c", light: "#0FB0CB" },
  "--blue-button-text": { dark: "#ffffff", light: "#ffffff" },
  "--blue-button-disabled": { dark: "#42424c", light: "rgba(33, 33, 37, 0.1)" },
  "--blue-button-disabled-text": {
    dark: "rgba(255, 255, 255, 0.6)",
    light: "rgba(33, 33, 37, 0.6)",
  },
  "--secondary-blue-button": { dark: "#2ccbe5", light: "#0FB0CB" },
  "--secondary-blue-button-disabled": {
    dark: "#c6cdd6",
    light: "rgba(33, 33, 37, 0.6)",
  },
  // outline button
  "--outline-button": { light: "#FFFFFF", dark: "#323339" },
  "--outline-button-border": { light: "#c2d1d6", dark: "#42424c" },
  "--outline-button-text": { light: "#212125", dark: "#ffffff" },
  "--outline-button-disabled-text": { light: "#78797b", dark: "#a5abb3" },

  "--outline-button-active": {
    light: "rgba(15,176,203,0.1)",
    dark: "rgba(44, 203, 229, 0.1)",
  },
  "--outline-button-active-border": { light: "#018ca3", dark: "#2b5964" },
  "--outline-button-active-text": { light: "#018ca3", dark: "#2ccbe5" },

  "--box-background": { dark: "rgba(36,36,41,0.4)", light: "#FFFFFF" },
  // tooltip
  "--tooltip": { dark: "#2a2b31", light: "#ffffff" },
  "--tooltip-border": { dark: "#42424c", light: "rgba(194, 209, 214, 0.5)" },
  "--tooltip-shadow": {
    dark: "0px 4px 8px rgba(0, 0, 0, 0.25)",
    light: "0px 4px 8px rgba(0, 0, 0, 0.25)",
  },

  "--table-header": { dark: "#323339", light: "#FFFFFF" },
  "--table-background": { dark: "#2B2C32", light: "#F6F9FA4D" },
  "--table-hover": { dark: "#2CCBE50D", light: "#2CCBE533" },
  // popup
  "--popup-background": { dark: "#323339", light: "#FFFFFF" },
  "--overlay-background": { dark: "#212125CC", light: "#212125CC" },
  "--overlay-background-blocking": { dark: "#212125", light: "#c2d1d6" },
  // label
  "--label-background": { dark: "#484a50", light: "#e0e9ec" },
  "--font": { dark: "#ffffff", light: "#212125" },
  "--body-font": { dark: "#a5abb3", light: "#212125" },
  "--sub-text-color": { dark: "#a5abb3", light: "#78797b" },
  "--hover-grey": {
    dark: "rgba(198, 205, 214, 0.03)",
    light: "rgba(33, 33, 37, 0.1)",
  },
  "--border-color": { dark: "#42424c", light: "#c2d1d6" },
  "--input-background": { dark: "#2A2B31", light: "#ffffff" },
  "--input-border": { dark: "#42424C", light: "rgba(194, 209, 214, 0.5)" },
  "--input-border-active": { dark: "#c6cdd6", light: "rgba(33, 33, 37, 0.6)" },
  "--input-outline": {
    dark: "rgba(44, 203, 229, 0.3)",
    light: "rgba(44, 203, 229, 0.3)",
  },
  // checkbox
  "--checkbox-background": { dark: "#C6CDD60D", light: "#C6CDD60D" },
  "--checkbox-border": { dark: "#42424C", light: "#c2d1d6" },
  "--checkbox-hover-border": { dark: "#94e5f2", light: "#94e5f2" },
  "--checkbox-active-background": { dark: "#2ccbe5", light: "#0FB0CB" },
  "--icon-thumbnail": { dark: "#42424c", light: "rgba(33, 33, 37, 0.15)" },
  "--error": { dark: "#ff2463", light: "#ff2463" },
  "--warning": { dark: "#ac9730", light: "#C9780099" },
  "--warning-bright": { dark: "#FFDB2C", light: "#C97800" },
  "--warning-border": { dark: "#FFDB2C33", light: "#C9780099" },
  "--log-background": { dark: "#1e1e1e", light: "#ffffff" },
  "--log-color": { dark: "#fff", light: "#1e1e1e" },
  //admin
  "--admin-header-background": { dark: "#242429", light: "#ffffff" },
  "--code-background": { dark: "#2b2c32", light: "#F6F9FA" },
  "--code-background-hover": { dark: "#36383e", light: "#0FB0CB" },

  // experiments
  "--job-list-header": { dark: "#212125", light: "#e1e9ec" },
  "--job-list-background": { dark: "#242429", light: "#FFFFFF" },

  // welcome page
  "--selection-color": {
    dark: "rgba(198, 205, 214, 0.03)",
    light: "#2CCBE51A",
  },

  // jobs
  "--grouping-border": { dark: "rgba(198, 205, 214, 0.6)", light: "#C2D1D6" },
  "--grouping-border-hover": {
    dark: "rgba(198, 205, 214, 1)",
    light: "#9ea8af",
  },
  "--grouping-border-active": { dark: "#fff", light: "#212125" },

  // statuses
  "--green": { dark: "#bdff94", light: "#008F68" },
  "--green-light": { dark: "#2e392d", light: "#13D9A133" },

  "--yellow": { dark: "#fed465", light: "#C97800" },
  "--yellow-light": { dark: "#403931", light: "#FFDB2C4D" },

  "--blue": { dark: "#81e1ff", light: "#0073DD" },
  "--blue-light": { dark: "#2e3846", light: "#48A7FF33" },

  "--red": { dark: "#ff8484", light: "#E80043" },
  "--red-light": { dark: "#40333a", light: "#edd9e5" },

  "--grey": { dark: "#c6cdd6", light: "rgba(33, 33, 37, 0.6)" },
  "--grey-light": {
    dark: "#37393f",
    light: "rgba(33, 33, 37, 0.1)",
  },
};
