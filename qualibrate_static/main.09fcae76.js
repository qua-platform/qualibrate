"use strict";
(self["webpackChunkqualibrate_frontend_ui"] = self["webpackChunkqualibrate_frontend_ui"] || []).push([[792],{

/***/ 7417:
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(6540);
;// ./src/common/helpers.ts
const noop = () => { };
/* harmony default export */ var helpers = (noop);

;// ./src/contexts/ApiContext.tsx



const yesterdayDay = new Date(new Date().setDate(new Date().getDate() - 1));
const ApiContext = react.createContext({
    dateRange: { startDate: new Date(), endDate: yesterdayDay },
    setDateRange: helpers,
});
const useApiContext = () => React.useContext(ApiContext);
function ApiContextProvider({ children }) {
    const [dateRange, setDateRange] = (0,react.useState)({
        startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
        endDate: new Date(),
    });
    return ((0,jsx_runtime.jsx)(ApiContext.Provider, { value: {
            dateRange,
            setDateRange,
        }, children: children }));
}

// EXTERNAL MODULE: ./node_modules/flexlayout-react/lib/index.js
var lib = __webpack_require__(9310);
;// ./src/common/layout.ts
const BORDER_SIZE = 100;

;// ./src/routing/flexLayout/FlexLayoutBuilder.ts


const SINGLE_TAB_KEY = ["nodes", "graph-library", "data", "project"];
const DEFAULT_MODEL = {
    global: { tabEnableClose: true },
    layout: {
        type: "row",
        weight: BORDER_SIZE,
        children: [],
    },
};
class FlexLayoutBuilder {
    model;
    constructor() {
        try {
            const saved = localStorage.getItem("flexModel");
            if (saved) {
                this.model = lib.Model.fromJson(JSON.parse(saved));
            }
            this.model = lib.Model.fromJson(DEFAULT_MODEL);
        }
        catch (e) {
            this.model = lib.Model.fromJson(DEFAULT_MODEL);
        }
    }
    isEmpty() {
        const children = this.model.getRoot().getChildren();
        if (children.length < 1) {
            return true;
        }
        const tabsCount = children.reduce((sum, child) => {
            return sum + child.getChildren().length;
        }, 0);
        return tabsCount < 1;
    }
    _getAllTabs() {
        const children = this.model.getRoot().getChildren();
        return children.flatMap((child) => {
            return getChildrenFromNode(child);
        });
    }
    findTabByKey(name) {
        const allTabs = this._getAllTabs();
        return allTabs.find((n) => {
            return checkName(n, name);
        });
    }
    _selectNode(nodeId) {
        this.model.doAction(lib.Actions.selectTab(nodeId));
    }
    _getActiveTabSet() {
        const activeTabSet = this.model.getActiveTabset();
        const firstTabset = this.model
            .getRoot()
            .getChildren()
            .filter((n) => n.getType() === "tabset")[0];
        return activeTabSet || firstTabset;
    }
    _addNode(tabKey) {
        const activeTabSet = this._getActiveTabSet();
        if (activeTabSet) {
            this.model.doAction(lib.Actions.addNode({
                name: tabKey,
                type: "tab",
            }, activeTabSet?.getId(), lib.DockLocation.CENTER, -1));
        }
    }
    openNewTab(key) {
        const isSingleton = SINGLE_TAB_KEY.includes(key);
        const tab = this.findTabByKey(key);
        if (isSingleton && tab !== undefined) {
            return this._selectNode(tab.getId());
        }
        this._addNode(key);
    }
}
function getChildrenFromNode(node) {
    if (node.getType() !== "tab") {
        return node.getChildren().flatMap((n) => getChildrenFromNode(n));
    }
    return [node];
}
function checkName(node, name) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return node._attributes.name === name;
}

;// ./src/routing/flexLayout/FlexLayoutContext.tsx



const FlexLayoutContext = react.createContext(null);
const FlexLayoutContext_useFlexLayoutContext = () => (0,react.useContext)(FlexLayoutContext);
function FlexLayoutContextProvider(props) {
    const { children } = props;
    const LayoutBuilder = (0,react.useRef)(new FlexLayoutBuilder());
    const [model, setModel] = (0,react.useState)(LayoutBuilder.current.model);
    const [activeTab, setActiveTab] = (0,react.useState)(null);
    const [activeTabsetName, setActiveTabsetName] = (0,react.useState)(null);
    const [topBarAdditionalComponents, setTopBarAdditionalComponents] = (0,react.useState)(undefined);
    const [selectedPageName, setSelectedPageName] = (0,react.useState)(null);
    (0,react.useEffect)(() => {
        // openTab("nodes");
        localStorage.setItem("flexModel", JSON.stringify(model.toJson()));
    }, [model]);
    const handleIframeUrlSetup = (tab) => {
        if (tab === "graph-status") {
            setSelectedPageName("graph-status");
        }
        else if (tab === "nodes") {
            setSelectedPageName("nodes");
        }
        else if (tab === "graph-library") {
            setSelectedPageName("graph-library");
        }
        else if (tab === "data") {
            setSelectedPageName("data");
        }
        else {
            setSelectedPageName(null);
        }
    };
    const checkIsEmpty = (0,react.useCallback)(() => {
        if (LayoutBuilder.current.isEmpty()) {
            // history.push(HOME_URL);
        }
    }, [LayoutBuilder]);
    const openTab = (0,react.useCallback)((tab) => {
        // navigate(APP_URL);
        // LayoutBuilder.current.removeAllOpenTabs();
        handleIframeUrlSetup(tab);
        LayoutBuilder.current.openNewTab(tab);
        setModel(LayoutBuilder.current.model);
        setActiveTab(tab);
        setActiveTabsetName(activeTab);
    }, []);
    const [activeTabsetId, setActiveTabsetId] = (0,react.useState)(null);
    const flexLayoutListener = (0,react.useCallback)((props) => {
        const tabName = model
            .getActiveTabset()
            ?.getChildren()
            // @ts-expect-error TODO Fix this
            .find(({ _attributes }) => _attributes.id === props.data.tabNode)?._renderedName;
        setActiveTabsetId(props.data.tabNode);
        if (tabName) {
            setActiveTabsetName(tabName);
        }
        return props;
    }, [model]);
    return ((0,jsx_runtime.jsx)(FlexLayoutContext.Provider, { value: {
            openTab,
            model,
            checkIsEmpty,
            activeTab,
            activeTabsetName,
            setActiveTabsetName,
            flexLayoutListener,
            activeTabsetId,
            topBarAdditionalComponents,
            setTopBarAdditionalComponents,
            selectedPageName,
            setSelectedPageName,
        }, children: children }));
}

// EXTERNAL MODULE: ./node_modules/react-router/dist/index.js
var dist = __webpack_require__(7767);
;// ./src/common/modules.ts
const HOME_URL = "/";
const LOGIN_URL = "/login";

;// ./src/ui-lib/layouts/styles/Layout.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Layout_module = ({"wrapper":"Layout-module__wrapper","pageWrapper":"Layout-module__pageWrapper","pageWrapper1":"Layout-module__pageWrapper1","mainPageWrapper":"Layout-module__mainPageWrapper","mainPageWrapperWithSidePanelBar":"Layout-module__mainPageWrapperWithSidePanelBar","content":"Layout-module__content","addLeftMargin":"Layout-module__addLeftMargin","layout":"Layout-module__layout","header":"Layout-module__header","header_panel":"Layout-module__header_panel","headerPanel":"Layout-module__header_panel","header_panel_widget":"Layout-module__header_panel_widget","headerPanelWidget":"Layout-module__header_panel_widget","header_panel_widget_selected":"Layout-module__header_panel_widget_selected","headerPanelWidgetSelected":"Layout-module__header_panel_widget_selected","_tabset_header_sizer":"Layout-module___tabset_header_sizer","tabsetHeaderSizer":"Layout-module___tabset_header_sizer","emptyPlaceholder":"Layout-module__emptyPlaceholder"});
;// ./src/ui-lib/Icons/DataIcon.tsx


const DataIcon = ({ width = 25, height = 24, className, }) => {
    return ((0,jsx_runtime.jsxs)("svg", { className: className, xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 25 24", fill: "none", children: [(0,jsx_runtime.jsx)("path", { d: "M7 16L10.3876 9.72807C10.9439 8.69828 12.2616 8.36407 13.2414 9.00429L14.7586 9.99571C15.7384 10.6359 17.0561 10.3017 17.6124 9.27193L21 3", stroke: "#ffffff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("path", { d: "M22 21L2.5 21L2.5 2", stroke: "#ffffff", strokeWidth: "1.5", strokeDasharray: "1 1" })] }));
};
/* harmony default export */ var Icons_DataIcon = (DataIcon);

;// ./src/utils/cyKeys.ts
const cyKeys = {
    LOGIN_PAGE: "login-page",
    COMPONENTS_TAB: "components-tab",
    EXPERIMENTS_TAB: "experiments-tab",
    DASHBOARD_TAB: "dashboard-tab",
    PROJECT_TAB: "project-tab",
    DATA_TAB: "data-tab",
    HELP_TAB: "help-tab",
    TOGGLE_SIDEBAR: "toggle-sidebar",
    CALIBRATION_TAB: "calibration-tab",
    NODES_TAB: "nodes-tab",
    NOTEBOOK_TAB: "notebook-tab",
    DOCS_TAB: "docs-tab",
    SEARCH_TAB: "search-tab",
    ADMIN_PANEL_TAB: "admin-panel-tab",
    HOME_PAGE: "home-page",
    JOBS_TAB: "jobs-tab",
    NAVIGATION_SELECT_ITEM: "navigation-select-item",
    EDITABLE_CELL: "editable-cell",
    VALUE_ON_EDIT: "value-on-edit",
    login: {
        USERNAME: "username-field",
        PASSWORD: "login-field",
        SUBMIT: "login-button",
        LOGOUT_THUMBNAIL: "logout-thumbnail",
        LOGOUT_BUTTON: "logout-button",
    },
    experiment: {
        RUN_JOB_BUTTON: "experiment-run-job-button",
        SUBMIT_JOB_TO_QUEUE: "experiment-submit-job-to-queue",
        GRAPH: "graph",
        WORKFLOW_DESCRIPTION: "workflow-description",
        WORKFLOW_NAME: "workflow-name",
        WORKFLOW_VIEW: "workflow-view",
        CODE_VIEW: "code-view",
        SYSTEM_VIEW: "system-view",
        WORKFLOW_VIEW_BUTTON: "workflow-view-button",
        WORKFLOW_CODE_BUTTON: "workflow-code-button",
        WORKFLOW_SYSTEM_BUTTON: "workflow-system-button",
        EXPERIMENT_INFO: "experiment-info",
        PARAMETERS_PANEL: "parameters-panel",
        LOG_PANEL: "log-panel",
        DOCUMENTATION_PANEL: "documentation-panel",
        STATISTICS_PANEL: "statistics-panel",
        INPUT_TABLE: "input-table",
        nodeInfo: {
            edit: {
                INPUT: "node-info-edit-input",
                APPLY: "node-info-edit-apply",
            },
        },
    },
    projectPopup: {
        CHANGE_PROJECT: "change-project",
    },
    projects: {
        LETS_START_BUTTON: "lets-start-button",
        PROJECT: "project-item",
    },
    popup: {
        RUN_JOB_IN_WORKFLOW: "run-job-in-a-workflow",
        FILTER_EXPERIMENTS_POPUP: "filter-experiments-popup",
    },
    data: {
        MENU_BUTTON: "menu-button",
        EXPERIMENT: "data-experiment",
        EXPERIMENT_LIST: "data-experiment-list",
        FILTER_BUTTON: "filter-button",
    },
    jobs: {
        LIST: "job-list",
        WRAPPER: "job-wrapper",
        GROUP_SORT_BUTTON: "job-group-sort-button",
        START_DATE_SORT_BUTTON: "job-sort-date-button",
        FILTER_BUTTON: "job-filter-button",
        SELECT_JOB_BUTTON: "job-select-button",
        ADD_JOB_BUTTON: "job-add-job-button",
        EXISTING_WORKFLOW_BUTTON: "job-existing-workflow-button",
        ADD_JOB_POPUP: "add-job-popup",
        FILTER_JOBS_POPUP: "filter-jobs-popup",
        JOB_PARAMETERS: "job-parameters",
        JOB_STEP_NAME: "job-step-name",
        SELECT_CHECKBOX: "select-checkbox",
        COMPARE_BUTTON: "compare-button",
        DIFF_ROW: "diff-frame",
        JOB_COMPARE_SELECT: "job-compare-select",
        diff: {
            SELECT: "jobs-diff-select",
            SELECT_LIST_ITEM: "jobs-diff-select-list-item",
        },
    },
    table: {
        ROW: "table-row",
    },
    common: {
        DROPDOWN_LIST: "dropdown-list",
        PAGE_TITLE: "page-title",
        PAGE_SUBTITLE: "page-subtitle",
        DROPDOWN_BUTTON: "dropdown-button",
    },
};
/* harmony default export */ var utils_cyKeys = (cyKeys);

;// ./src/common/interfaces/InputProps.ts
var IconType;
(function (IconType) {
    IconType["INNER"] = "INNER";
})(IconType || (IconType = {}));

;// ./src/utils/colors.ts
const BLUE_BUTTON = "var(--blue-button)";
const BLUE_BUTTON_TEXT = "var(--blue-button-text)";
const MAIN_TEXT_COLOR = "var(--font)";
const BACKGROUND_COLOR = "var(--background-color)";
const SECONDARY_BLUE_BUTTON = "var(--secondary-blue-button)";
const ACCENT_COLOR_LIGHT = "var(--sub-text-color)";
const ACTIVE_TEXT = "var(--active-text)";
const ERROR_COLOR = "var(--error)";
const GREY_FONT = "var(--sub-text-color)";
const BODY_FONT = "var(--body-font)";
const MENU_TEXT_COLOR = "var(--menu-text-color)";
const GREEN_COLOR = "var(--green)";
// export const RED_COLOR = "var(--red)";
// export const CODE_BACKGROUND_COLOR = "var(--code-background)";
// export const CODE_BACKGROUND_COLOR_HOVER = "var(--code-background-color)";
const LIGHT_GREY_FONT = "var(--menu-text-color)";
// export const ACTION_BUTTON_COlOR = "var(--action-button-hover)";
const OUTLINE_BUTTON_TEXT = "var(--outline-button-text)";
const OUTLINE_BUTTON_DISABLE_TEXT = "var(--outline-button-disabled-text)";
const OUTLINE_BUTTON_ACTIVE_TEXT = "var(--outline-button-active-text)";
const BLUE_ICON_BUTTON_TEXT = "var(--blue-icon-button-text)";
const BLUE_ICON_BUTTON_HOVER_TEXT = "var(--blue-icon-button-hover-text)";

;// ./src/ui-lib/Icons/SearchIcon.tsx



const SearchIcon = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => ((0,jsx_runtime.jsx)("svg", { width: width, height: height, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0,jsx_runtime.jsx)("path", { d: "m21.878 20.7-5.81-5.81a7.876 7.876 0 0 0 1.765-4.973C17.833 5.55 14.282 2 9.917 2 5.55 2 2 5.551 2 9.917c0 4.365 3.551 7.916 7.917 7.916a7.876 7.876 0 0 0 4.973-1.765l5.81 5.81a.417.417 0 0 0 .589 0l.589-.59a.417.417 0 0 0 0-.588ZM9.917 16.166a6.257 6.257 0 0 1-6.25-6.25 6.257 6.257 0 0 1 6.25-6.25 6.257 6.257 0 0 1 6.25 6.25 6.257 6.257 0 0 1-6.25 6.25Z", fill: color }) }));

;// ./src/modules/Project/components/Project.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Project_module = ({"projectActions":"Project-module__projectActions","checkWrapper":"Project-module__checkWrapper","projectChecked":"Project-module__projectChecked","projectActive":"Project-module__projectActive","projectWrapper":"Project-module__projectWrapper","project":"Project-module__project","projectInfo":"Project-module__projectInfo","projectDetails":"Project-module__projectDetails","projectName":"Project-module__projectName","projectDate":"Project-module__projectDate","projectThumbnail":"Project-module__projectThumbnail","splash":"Project-module__splash","splashNoProject":"Project-module__splashNoProject"});
;// ./src/ui-lib/Icons/ProjectFolderIcon.tsx


const ProjectFolderIcon = ({ initials, width = 36, height = 36, fillColor = "#5175BD", textColor = "#FFFFFF", fontSize = 14, }) => {
    return ((0,jsx_runtime.jsxs)("svg", { width: width, height: height, viewBox: "0 0 30 30", children: [(0,jsx_runtime.jsx)("path", { opacity: "0.4", d: "M4 6C4 3.79086 5.79086 2 8 2H25C27.2091 2 29 3.79086 29 6H4Z", fill: fillColor }), (0,jsx_runtime.jsx)("path", { opacity: "0.2", d: "M4 2C4 0.895431 4.89543 0 6 0H20C21.1046 0 22 0.895431 22 2H4Z", fill: fillColor }), (0,jsx_runtime.jsx)("path", { d: "M0 4C0 1.79086 1.79086 0 4 0H6.3915C7.08108 0 7.72202 0.355239 8.0875 0.940002L9.4125 3.06C9.77798 3.64476 10.4189 4 11.1085 4H26C28.2091 4 30 5.79086 30 8V26C30 28.2091 28.2091 30 26 30H4C1.79086 30 0 28.2091 0 26V4Z", fill: fillColor }), (0,jsx_runtime.jsx)("text", { x: "15", y: "20", textAnchor: "middle", fill: textColor, fontSize: fontSize, fontWeight: "bold", fontFamily: "Arial, sans-serif", children: initials })] }));
};
/* harmony default export */ var Icons_ProjectFolderIcon = (ProjectFolderIcon);

;// ./src/modules/Project/constants.ts
const colorPalette = [
    "#AC51BD",
    "#5175BD",
    "#268A50",
    "#097F8C",
    "#986800",
    "#7351BD",
    "#1268D0",
];

;// ./src/modules/Project/helpers.ts

const extractInitials = (name) => {
    if (!name)
        return "";
    const parts = name.trim().split(" ").slice(0, 2);
    const first = parts[0] ?? "";
    const second = parts[1] ?? "";
    return (first[0] ?? "").toUpperCase() + (second[0] ?? "").toUpperCase();
};
const getColorIndex = (name) => {
    if (!name)
        return 0;
    let hash = 2166136261;
    for (let i = 0; i < name.length; i++) {
        hash ^= name.charCodeAt(i);
        hash *= 16777619;
    }
    const index = Math.abs(hash) % colorPalette.length;
    return Math.max(0, Math.min(index, colorPalette.length - 1));
};

;// ./src/modules/TopbarMenu/helpers.ts
const formatTime = (sec) => {
    if (sec === null)
        return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h ? `${h}h ` : ""}${m ? `${m}m ` : ""}${s}s`;
};
const formatDate = (date) => {
    if (!date)
        return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    return (d.toLocaleDateString("en-GB") +
        " " +
        d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }));
};
const capitalize = (text) => {
    if (text && text.length > 0) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    return text;
};
const getWrapperClass = (status, styles) => {
    if (status === "running")
        return styles.running;
    if (status === "finished")
        return styles.finished;
    if (status === "error")
        return styles.error;
    return styles.pending;
};
const getStatusClass = (status, styles) => {
    if (status === "running")
        return styles.statusRunning;
    if (status === "finished")
        return styles.statusFinished;
    if (status === "error")
        return styles.statusError;
    return styles.statusPending;
};

;// ./src/modules/Project/components/ProjectInfo.tsx


// eslint-disable-next-line css-modules/no-unused-class




const ProjectInfo = ({ name, date, colorIcon }) => {
    return ((0,jsx_runtime.jsxs)("div", { className: Project_module.projectInfo, children: [(0,jsx_runtime.jsx)("div", { className: Project_module.projectThumbnail, children: (0,jsx_runtime.jsx)(Icons_ProjectFolderIcon, { initials: extractInitials(name), fillColor: colorIcon }) }), (0,jsx_runtime.jsxs)("div", { className: Project_module.projectDetails, children: [(0,jsx_runtime.jsx)("div", { className: Project_module.projectName, children: name || "" }), date && (0,jsx_runtime.jsxs)("div", { className: Project_module.projectDate, children: ["Last updated: ", formatDate(date)] })] })] }));
};
/* harmony default export */ var components_ProjectInfo = (ProjectInfo);

;// ./src/utils/classnames.ts
function classNames(...cls) {
    return cls
        .map((v) => {
        if (typeof v === "undefined" || v === false) {
            // ignore
        }
        else if (typeof v === "string") {
            return v;
        }
        else if (v?.length && !!v[1]) {
            return v[0];
        }
        return null;
    })
        .filter((v) => !!v)
        .join(" ");
}

;// ./src/common/enums/Api.ts
var API_METHODS;
(function (API_METHODS) {
    API_METHODS["GET"] = "GET";
    API_METHODS["POST"] = "POST";
})(API_METHODS || (API_METHODS = {}));

;// ./src/utils/fileHelpers.ts
// export function getDataFileUri(dataType: string, dataStr: string, dataCharset: string | undefined = "utf-8"): string {
//   return `data:${dataType};charset=${dataCharset},${encodeURIComponent(dataStr)}`;
// }
function makeTemporaryDownloadLink(url, fileName) {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
}
// export function downloadData<D>(data: D, fileName: string, dataType?: string): void {
//   const infoStr: string = JSON.stringify(data);
//   const infoDataUri = getDataFileUri(dataType || "application/json", infoStr);
//   makeTemporaryDownloadLink(infoDataUri, fileName);
// }
// export function isValidFile(acceptTypes: Array<string>, file: File | null): boolean {
//   return file !== null && acceptTypes.includes(file.type);
// }

;// ./src/utils/api/index.ts


const AUTH_HEADER = {
    Authorization: "Basic bWVhc3VyZW1lbnQ6ZW50YW5nbGU=",
};
const BASIC_HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    ...AUTH_HEADER,
};
const API_ADDRESS = "api/v0/";
class Api {
    static get address() {
        if (true) {
            return "";
        }
        // removed by dead control flow
{}
    }
    static api(path) {
        return this.address + API_ADDRESS + path;
    }
    static divideProperties(props, extractArrays = false) {
        return Object.fromEntries(Object.entries(props).filter(([, value]) => (extractArrays ? Array.isArray(value) : !Array.isArray(value))));
    }
    static formQuery(options = {}) {
        if (!options || !Object.keys(options).length) {
            return "";
        }
        const arrayProperties = this.divideProperties(options, true);
        if (!Object.keys(arrayProperties).length) {
            return "?" + new URLSearchParams(options);
        }
        const plainProperties = this.divideProperties(options, false);
        const plainParams = new URLSearchParams(plainProperties);
        const arrayQuery = Object.keys(arrayProperties)
            .map((arrayName) => arrayProperties[arrayName].map((value) => `&${arrayName}=${value}`))
            .join("")
            .replace(/,/g, "");
        return `?${plainParams}${arrayQuery}`;
    }
    static async pingURL(url) {
        try {
            const res = await fetch(url, {
                method: API_METHODS.GET,
                // headers: { ...BASIC_HEADERS },
                // credentials: "include",
            });
            return this.getResult(res);
        }
        catch (e) {
            return {
                isOk: false,
                error: "" + e,
            };
        }
    }
    static async _fetch(path, method, options) {
        const { queryParams, body, ...restOptions } = options || {};
        const urlQuery = this.formQuery(queryParams);
        try {
            const res = await fetch(`${path}${urlQuery}`, {
                method: method,
                headers: { ...BASIC_HEADERS, "Content-Type": "application/json" },
                body,
                credentials: "include",
                ...restOptions,
            });
            return this.getResult(res);
        }
        catch (e) {
            return {
                isOk: false,
                error: "" + e,
            };
        }
    }
    static async fetchData(path, method, options) {
        const { queryParams, body, ...restOptions } = options || {};
        const urlQuery = this.formQuery(queryParams);
        try {
            const response = await fetch(`${path}${urlQuery}`, {
                method: method,
                headers: { ...BASIC_HEADERS, "Content-Type": "application/json" },
                body,
                credentials: "include",
                ...restOptions,
            });
            const data = await response.json();
            if (!response.ok) {
                //throw new Error(`Request failed with status ${response.status}`);
                return {
                    error: `${data?.detail[0].msg}`,
                };
            }
            return data;
        }
        catch (e) {
            return {
                error: `${e}`,
            };
        }
    }
    static async fetch([path, method], options) {
        const { queryParams, body, ...restOptions } = options || {};
        const urlQuery = this.formQuery(queryParams);
        try {
            const res = await fetch(this.api(`${path}${urlQuery}`), {
                method,
                headers: { ...BASIC_HEADERS, "Content-Type": "application/json" },
                body,
                credentials: "include",
                ...restOptions,
            });
            return this.getResult(res);
        }
        catch (e) {
            return {
                isOk: false,
                error: "" + e,
            };
        }
    }
    static async downloadFile(fullPath, defaultFileName, options = {}) {
        return new Promise((resolve) => {
            let fileName = defaultFileName;
            fetch(fullPath, {
                method: API_METHODS.GET,
                headers: {
                    ...BASIC_HEADERS,
                },
                ...options,
            })
                .then((response) => {
                try {
                    const header = response.headers.get("Content-Disposition");
                    const parts = header.split(";");
                    fileName = parts[1].split("=")[1].replaceAll('"', "");
                }
                catch (e) {
                    console.log(e);
                }
                if (response.ok) {
                    return response.blob();
                }
                else {
                    return Promise.reject(response.statusText);
                }
            })
                .then((blob) => {
                const fileUrl = window.URL.createObjectURL(new Blob([blob]));
                makeTemporaryDownloadLink(fileUrl, fileName);
                resolve({ isOk: true });
            })
                .catch((err) => resolve({ isOk: false, error: err }));
        });
    }
    static async setupOkResponse(res, message) {
        let result = undefined;
        try {
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                const text = await res.text();
                if (text) {
                    result = JSON.parse(text);
                }
            }
        }
        catch (e) {
            console.warn("JSON parsing failed in setupOkResponse:", e);
        }
        return {
            isOk: true,
            result,
            message,
        };
    }
    static async setupErrorResponse(res, message) {
        return {
            isOk: false,
            error: await res.json(),
            message,
        };
    }
    static async getResult(res) {
        return res.ok ? this.setupOkResponse(res) : this.setupErrorResponse(res);
    }
}

;// ./src/utils/api/apiRoutes.ts
const ALL_SNAPSHOTS = ({ branchName = "main", pageNumber = 1, pageLimit = 100, reverseOrder = false, globalReverse = false }) => "api/branch/" +
    branchName +
    "/snapshots_history?page=" +
    pageNumber +
    "&per_page=" +
    pageLimit +
    "&reverse=" +
    reverseOrder +
    "&global_reverse=" +
    globalReverse;
const ONE_SNAPSHOT = (snapshotId) => `api/snapshot/${snapshotId}/`;
const SNAPSHOT_RESULT = (snapshotId) => `api/data_file/${snapshotId}/content`;
const SNAPSHOT_DIFF = (currentSnapshotId, newSnapshotId) => `api/snapshot/${currentSnapshotId}/compare?id_to_compare=${newSnapshotId}`;
const UPDATE_SNAPSHOT = (id) => `api/snapshot/${id}/update_entry`;
const UPDATE_SNAPSHOTS = (id) => `api/snapshot/${id}/update_entries`;
const ALL_PROJECTS = () => "api/projects/";
const ACTIVE_PROJECT = () => "api/project/active";
const SHOULD_REDIRECT_USER_TO_SPECIFIC_PAGE = () => "api/redirect";
const CREATE_PROJECT = () => "api/project/create";
const IS_NODE_RUNNING = () => "execution/is_running";
const STOP_RUNNING = () => "execution/stop";
const ALL_NODES = () => "execution/get_nodes";
const GET_NODE = () => "execution/get_node";
const ALL_GRAPHS = () => "execution/get_graphs";
const GET_GRAPH = () => "execution/get_graph";
const GET_WORKFLOW_GRAPH = () => "execution/get_graph/cytoscape";
const SUBMIT_NODE_RUN = () => "execution/submit/node";
const SUBMIT_WORKFLOW_RUN = () => "execution/submit/workflow";
const GET_EXECUTION_HISTORY = () => "execution/last_run/workflow/execution_history?reverse=true";
const GET_LAST_RUN = () => "execution/last_run/";
const GET_LAST_RUN_STATUS = () => "execution/last_run/status";
const GET_LAST_RUN_WORKFLOW_STATUS = () => "execution/last_run/workflow/status";
const GET_LOGS = ({ after, before, num_entries, reverse, }) => {
    const query = new URLSearchParams({
        ...(after && { after }),
        ...(before && { before }),
        num_entries: num_entries,
        reverse: reverse ? "true" : "false",
    });
    return `execution/output_logs?${query.toString()}`;
};

;// ./src/modules/Project/api/ProjectViewAPI.tsx



class ProjectViewApi extends Api {
    constructor() {
        super();
    }
    static api(path) {
        return this.address + path;
    }
    static fetchAllProjects() {
        return this._fetch(this.api(ALL_PROJECTS()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static fetchActiveProjectName() {
        return this._fetch(this.api(ACTIVE_PROJECT()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static fetchShouldRedirectUserToProjectPage() {
        return this._fetch(this.api(SHOULD_REDIRECT_USER_TO_SPECIFIC_PAGE()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static selectActiveProject(projectName) {
        return this._fetch(this.api(ACTIVE_PROJECT()), API_METHODS.POST, {
            headers: BASIC_HEADERS,
            body: JSON.stringify(projectName),
        });
    }
    static createProject(formData) {
        const body = {
            ...(formData.dataPath && { storage_location: formData.dataPath }),
            ...(formData.calibrationPath && { calibration_library_folder: formData.calibrationPath }),
            ...(formData.quamPath && { quam_state_path: formData.quamPath }),
        };
        return this._fetch(this.api(CREATE_PROJECT()), API_METHODS.POST, {
            headers: BASIC_HEADERS,
            body: JSON.stringify(body),
            queryParams: { project_name: formData.projectName },
        });
    }
}

;// ./src/modules/Project/context/ProjectContext.tsx




const ProjectContext = react.createContext({
    allProjects: [],
    setAllProjects: helpers,
    handleSelectActiveProject: helpers,
    activeProject: undefined,
    shouldGoToProjectPage: true,
    isScanningProjects: false,
    fetchProjectsAndActive: helpers,
    refreshShouldGoToProjectPage: async () => { },
});
const useProjectContext = () => (0,react.useContext)(ProjectContext);
const ProjectContextProvider = ({ children }) => {
    const [activeProject, setActiveProject] = (0,react.useState)(undefined);
    const [shouldGoToProjectPage, setShouldGoToProjectPage] = (0,react.useState)(true);
    const [allProjects, setAllProjects] = (0,react.useState)([]);
    const [isScanningProjects, setIsScanningProjects] = (0,react.useState)(false);
    const fetchProjectsAndActive = (0,react.useCallback)(async () => {
        setIsScanningProjects(true);
        try {
            const [projectsRes, activeNameRes] = await Promise.all([ProjectViewApi.fetchAllProjects(), ProjectViewApi.fetchActiveProjectName()]);
            if (projectsRes.isOk && projectsRes.result) {
                const fetchedProjects = projectsRes.result;
                setAllProjects(fetchedProjects);
                if (activeNameRes.isOk && activeNameRes.result) {
                    const fetchedActiveProject = fetchedProjects.find((p) => p.name === activeNameRes.result);
                    setActiveProject(fetchedActiveProject);
                }
            }
        }
        catch (error) {
            console.error("Error fetching projects or active project:", error);
        }
        setIsScanningProjects(false);
    }, []);
    const fetchShouldRedirectUserToProjectPage = (0,react.useCallback)(async () => {
        try {
            const response = await ProjectViewApi.fetchShouldRedirectUserToProjectPage();
            if (response.isOk && response.result) {
                localStorage.setItem("backandWorking", "true");
                setShouldGoToProjectPage(response.result.page === "project");
            }
        }
        catch (error) {
            console.error("Error fetching should user be redirected to project page:", error);
        }
    }, []);
    (0,react.useEffect)(() => {
        fetchShouldRedirectUserToProjectPage();
        fetchProjectsAndActive();
    }, [fetchShouldRedirectUserToProjectPage, fetchProjectsAndActive]);
    const handleSelectActiveProject = (0,react.useCallback)(async (project) => {
        try {
            const { isOk, result } = await ProjectViewApi.selectActiveProject(project.name);
            if (isOk && result === project.name) {
                setActiveProject(project);
                setShouldGoToProjectPage(false);
            }
        }
        catch (err) {
            console.error("Failed to activate project:", err);
        }
    }, [setActiveProject, setShouldGoToProjectPage]);
    return ((0,jsx_runtime.jsx)(ProjectContext.Provider, { value: {
            allProjects,
            setAllProjects,
            activeProject,
            shouldGoToProjectPage,
            handleSelectActiveProject,
            isScanningProjects,
            fetchProjectsAndActive,
            refreshShouldGoToProjectPage: fetchShouldRedirectUserToProjectPage,
        }, children: children }));
};

;// ./src/ui-lib/Icons/ProjectCheckIcon.tsx


const ProjectCheckIcon = ({ className, width = 19, height = 12, stroke = "var(--grey-highlight)", }) => {
    return ((0,jsx_runtime.jsx)("svg", { className: className, width: width, height: height, viewBox: "0 0 21 14", fill: "none", children: (0,jsx_runtime.jsx)("path", { d: "M1 8.2L6.42857 13L20 1", stroke: stroke, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }));
};
/* harmony default export */ var Icons_ProjectCheckIcon = (ProjectCheckIcon);

;// ./src/modules/Project/Project.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Project_Project_module = ({"projectPageWrapper":"Project-module__projectPageWrapper","splashNoProject":"Project-module__splashNoProject","projectPageLayout":"Project-module__projectPageLayout","projectActions":"Project-module__projectActions","pageActions":"Project-module__pageActions","actionButton":"Project-module__actionButton","searchProjectField":"Project-module__searchProjectField"});
;// ./src/ui-lib/components/Button/BlueButton.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var BlueButton_module = ({"blueButton":"BlueButton-module__blueButton","big":"BlueButton-module__big","isCircle":"BlueButton-module__isCircle","primary":"BlueButton-module__primary","secondary":"BlueButton-module__secondary"});
;// ./src/ui-lib/components/Button/BlueButton.tsx




const BlueButton = (props) => {
    const { className, children, isSecondary, isBig, isCircle, ...restProps } = props;
    return ((0,jsx_runtime.jsx)("button", { className: classNames(BlueButton_module.blueButton, isBig && BlueButton_module.big, isSecondary ? BlueButton_module.secondary : BlueButton_module.primary, isCircle && BlueButton_module.isCircle, className), ...restProps, children: children }));
};
/* harmony default export */ var Button_BlueButton = (BlueButton);

;// ./src/modules/Snapshots/api/SnapshotsApi.tsx



class SnapshotsApi extends Api {
    constructor() {
        super();
    }
    static api(path) {
        return this.address + path;
    }
    static fetchAllSnapshots(pageNumber) {
        return this._fetch(this.api(ALL_SNAPSHOTS({ pageNumber })), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static fetchSnapshot(id, loadTypeFlag) {
        const url = this.api(ONE_SNAPSHOT(id));
        const params = new URLSearchParams();
        // Use DataWithMachine as default if no load type flag is provided
        const flagsToUse = loadTypeFlag && loadTypeFlag.length > 0 ? loadTypeFlag : ["DataWithMachine"];
        flagsToUse.forEach((flag) => params.append("load_type_flag", flag));
        const urlWithParams = `${url}?${params.toString()}`;
        return this._fetch(urlWithParams, API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static fetchSnapshotResult(id) {
        return this._fetch(this.api(SNAPSHOT_RESULT(id)), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static fetchSnapshotUpdate(currentId, newId) {
        return this._fetch(this.api(SNAPSHOT_DIFF(currentId, newId)), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static updateState(snapshotId, data_path, value) {
        return this._fetch(this.api(UPDATE_SNAPSHOT(snapshotId)), API_METHODS.POST, {
            headers: BASIC_HEADERS,
            body: JSON.stringify({ data_path, value }),
            // queryParams: { data_path, value },
        });
    }
    static updateStates(snapshotId, listOfUpdates) {
        return this._fetch(this.api(UPDATE_SNAPSHOTS(snapshotId)), API_METHODS.POST, {
            headers: BASIC_HEADERS,
            body: JSON.stringify({ items: listOfUpdates }),
            // queryParams: { data_path, value },
        });
    }
    static stopNodeRunning() {
        return this._fetch(this.api(STOP_RUNNING()), API_METHODS.POST, {
            headers: BASIC_HEADERS,
            // body: JSON.stringify({ data_path, value }),
            // queryParams: { data_path, value },
        });
    }
}

;// ./src/modules/Snapshots/context/SnapshotsContext.tsx



const SnapshotsContext = react.createContext({
    trackLatestSidePanel: true,
    setTrackLatestSidePanel: () => { },
    trackPreviousSnapshot: true,
    setTrackPreviousSnapshot: () => { },
    totalPages: 0,
    pageNumber: 0,
    setPageNumber: () => { },
    allSnapshots: [],
    setAllSnapshots: () => { },
    selectedSnapshotId: undefined,
    setSelectedSnapshotId: () => { },
    latestSnapshotId: undefined,
    setLatestSnapshotId: () => { },
    clickedForSnapshotSelection: false,
    setClickedForSnapshotSelection: () => { },
    fetchOneSnapshot: () => { },
    jsonData: {},
    setJsonData: () => { },
    jsonDataSidePanel: {},
    setJsonDataSidePanel: () => { },
    diffData: {},
    setDiffData: () => { },
    result: {},
    setResult: () => { },
    firstId: "0",
    setFirstId: () => { },
    secondId: "0",
    setSecondId: () => { },
    reset: false,
    setReset: () => { },
});
const useSnapshotsContext = () => (0,react.useContext)(SnapshotsContext);
function SnapshotsContextProvider(props) {
    const [trackLatestSidePanel, setTrackLatestSidePanel] = (0,react.useState)(true);
    const [trackPreviousSnapshot, setTrackPreviousSnapshot] = (0,react.useState)(true);
    const [pageNumber, setPageNumber] = (0,react.useState)(1);
    const [totalPages, setTotalPages] = (0,react.useState)(1);
    const [allSnapshots, setAllSnapshots] = (0,react.useState)([]);
    const [selectedSnapshotId, setSelectedSnapshotId] = (0,react.useState)(undefined);
    const [clickedForSnapshotSelection, setClickedForSnapshotSelection] = (0,react.useState)(false);
    const [latestSnapshotId, setLatestSnapshotId] = (0,react.useState)(undefined);
    const [reset, setReset] = (0,react.useState)(false);
    const [jsonDataSidePanel, setJsonDataSidePanel] = (0,react.useState)(undefined);
    const [jsonData, setJsonData] = (0,react.useState)(undefined);
    const [diffData, setDiffData] = (0,react.useState)(undefined);
    const [result, setResult] = (0,react.useState)(undefined);
    const [firstId, setFirstId] = (0,react.useState)("0");
    const [secondId, setSecondId] = (0,react.useState)("0");
    const fetchSnapshotJsonData = (0,react.useCallback)((id) => {
        try {
            return SnapshotsApi.fetchSnapshot(id);
        }
        catch (e) {
            console.error(`Failed to fetch a snapshot (id=${id}):`, e);
            return null;
        }
    }, []);
    const fetchSnapshotResults = (0,react.useCallback)((id) => {
        try {
            return SnapshotsApi.fetchSnapshotResult(id);
        }
        catch (e) {
            console.error(`Failed to fetch results for the snapshot (id=${id}):`, e);
            return undefined;
        }
    }, []);
    const fetchSnapshotDiff = (0,react.useCallback)((id2, id1) => {
        try {
            return SnapshotsApi.fetchSnapshotUpdate(id1, id2);
        }
        catch (e) {
            console.error(`Failed to fetch snapshot updates for the snapshots (id2=${id2}, id1=${id1}):`, e);
            return undefined;
        }
    }, []);
    const fetchOneSnapshot = async (snapshotId, snapshotId2, updateResult = true, fetchUpdate = false) => {
        const id1 = (snapshotId ?? 0).toString();
        const id2 = snapshotId2 ? snapshotId2.toString() : snapshotId - 1 >= 0 ? (snapshotId - 1).toString() : "0";
        const resSnapshotJsonData = await fetchSnapshotJsonData(id1);
        if (resSnapshotJsonData?.isOk) {
            if (updateResult) {
                setJsonData(resSnapshotJsonData.result?.data);
                const resSnapshotResults = await fetchSnapshotResults(id1);
                if (resSnapshotResults?.isOk) {
                    setResult(resSnapshotResults?.result);
                }
            }
            setJsonDataSidePanel(resSnapshotJsonData?.result?.data?.quam ?? {});
        }
        if (id1 !== id2 && fetchUpdate) {
            const resSnapshotDiff = await fetchSnapshotDiff(id2, id1);
            if (resSnapshotDiff?.isOk) {
                setDiffData(resSnapshotDiff?.result ?? {});
            }
        }
        else {
            setDiffData({});
        }
    };
    const fetchAllSnapshots = (0,react.useCallback)(async (page) => {
        try {
            return SnapshotsApi.fetchAllSnapshots(page);
        }
        catch (e) {
            console.error(`Failed to fetch all snapshots (page=${page}):`, e);
            return null;
        }
    }, []);
    const fetchGitgraphSnapshots = async (firstTime, page) => {
        const resAllSnapshots = await fetchAllSnapshots(page);
        setAllSnapshots([]);
        if (resAllSnapshots && resAllSnapshots?.isOk) {
            const items = resAllSnapshots.result?.items;
            setTotalPages(resAllSnapshots.result?.total_pages ?? 1);
            setPageNumber(resAllSnapshots.result?.page ?? 1);
            setAllSnapshots(resAllSnapshots.result?.items ?? []);
            let lastElId = 0;
            if (items) {
                lastElId = items.length > 0 ? items[0]?.id : 0;
                setLatestSnapshotId(lastElId);
                if (trackLatestSidePanel) {
                    const snapshotId1 = lastElId;
                    const snapshotId2 = trackPreviousSnapshot ? lastElId - 1 : Number(secondId);
                    fetchOneSnapshot(snapshotId1, snapshotId2, false, true);
                }
            }
            if (firstTime) {
                if (items) {
                    setSelectedSnapshotId(lastElId);
                    fetchOneSnapshot(lastElId, lastElId - 1, true, true);
                }
                else {
                    if (selectedSnapshotId) {
                        fetchOneSnapshot(selectedSnapshotId);
                        setReset(false);
                    }
                }
            }
        }
    };
    (0,react.useEffect)(() => {
        setAllSnapshots([]);
        fetchGitgraphSnapshots(true, pageNumber);
    }, [pageNumber]);
    // -----------------------------------------------------------
    // -----------------------------------------------------------
    // -----------------------------------------------------------
    // PERIODICAL FETCH ALL SNAPSHOTS
    const intervalFetch = async (page) => {
        const resAllSnapshots = await fetchAllSnapshots(page);
        if (resAllSnapshots) {
            setTotalPages(resAllSnapshots.result?.total_pages);
            setPageNumber(resAllSnapshots.result?.page);
            const newMaxId = resAllSnapshots.result?.items[0]?.id;
            const odlMaxId = allSnapshots ? allSnapshots[0]?.id : 0;
            console.log(`Max snapshot ID - previous=${odlMaxId}, latest=${newMaxId}`);
            if (newMaxId !== odlMaxId && resAllSnapshots.result?.items?.length !== 0) {
                setReset(true);
            }
            else {
                setReset(false);
            }
        }
    };
    // TODO Add lastSelectedId! in state
    (0,react.useEffect)(() => {
        const checkInterval = setInterval(() => intervalFetch(pageNumber), 1000);
        return () => clearInterval(checkInterval);
    }, [allSnapshots, pageNumber]);
    // -----------------------------------------------------------
    // -----------------------------------------------------------
    // PERIODICAL FETCH ALL SNAPSHOTS
    (0,react.useEffect)(() => {
        if (reset) {
            // setAllSnapshots([]);
            const updateFn = setTimeout(() => fetchGitgraphSnapshots(false, pageNumber), 2);
            return () => clearTimeout(updateFn);
        }
    }, [reset, pageNumber]);
    // -----------------------------------------------------------
    return ((0,jsx_runtime.jsx)(SnapshotsContext.Provider, { value: {
            trackLatestSidePanel,
            setTrackLatestSidePanel,
            trackPreviousSnapshot,
            setTrackPreviousSnapshot,
            totalPages,
            pageNumber,
            setPageNumber,
            allSnapshots,
            setAllSnapshots,
            selectedSnapshotId,
            setSelectedSnapshotId,
            latestSnapshotId,
            setLatestSnapshotId,
            clickedForSnapshotSelection,
            setClickedForSnapshotSelection,
            jsonData,
            setJsonData,
            jsonDataSidePanel,
            setJsonDataSidePanel,
            diffData,
            setDiffData,
            result,
            setResult,
            fetchOneSnapshot,
            firstId,
            setFirstId,
            secondId,
            setSecondId,
            reset,
            setReset,
        }, children: props.children }));
}

;// ./src/modules/Project/components/ProjectActions.tsx



// eslint-disable-next-line css-modules/no-unused-class







const ProjectActions = ({ isCurrentProject, projectName, selectedProject }) => {
    const { openTab } = FlexLayoutContext_useFlexLayoutContext();
    const { handleSelectActiveProject } = useProjectContext();
    const { reset, setReset, setSelectedSnapshotId, setAllSnapshots, setJsonData, setResult, setDiffData } = useSnapshotsContext();
    const handleSubmit = (0,react.useCallback)(() => {
        if (!selectedProject)
            return;
        handleSelectActiveProject(selectedProject);
        setSelectedSnapshotId(undefined);
        setJsonData(undefined);
        setResult(undefined);
        setDiffData(undefined);
        setReset(true);
        openTab(NODES_KEY);
    }, [
        selectedProject,
        handleSelectActiveProject,
        openTab,
        setAllSnapshots,
        setSelectedSnapshotId,
        setJsonData,
        setResult,
        setDiffData,
        setReset,
        reset,
    ]);
    return ((0,jsx_runtime.jsxs)("div", { className: Project_Project_module.pageActions, children: [selectedProject?.name === projectName && ((0,jsx_runtime.jsx)(Button_BlueButton, { onClick: handleSubmit, className: Project_Project_module.actionButton, disabled: selectedProject === undefined, "data-cy": utils_cyKeys.projects.LETS_START_BUTTON, "data-testid": "lets-start-button-" + projectName, isBig: true, children: "Let\u2019s Start" })), isCurrentProject && (0,jsx_runtime.jsx)(Icons_ProjectCheckIcon, {})] }));
};
/* harmony default export */ var components_ProjectActions = (ProjectActions);

;// ./src/modules/Project/components/Project.tsx




// eslint-disable-next-line css-modules/no-unused-class






const Project = ({ isActive = false, lastModifiedAt = "", project, selectedProject, setSelectedProject }) => {
    const { activeProject } = useProjectContext();
    const isCurrentProjectActive = activeProject?.name === project.name;
    const index = (0,react.useMemo)(() => getColorIndex(project.name), [project.name]);
    const projectColor = colorPalette[index];
    const handleOnClick = (0,react.useCallback)((project) => {
        setSelectedProject(project);
    }, [setSelectedProject]);
    return ((0,jsx_runtime.jsx)("div", { className: Project_module.projectWrapper, "data-testid": "project-wrapper-" + project.name, children: (0,jsx_runtime.jsxs)("div", { className: classNames(Project_module.project, isActive && Project_module.projectActive, isCurrentProjectActive && Project_module.projectChecked), onClick: () => handleOnClick(project), "data-cy": utils_cyKeys.projects.PROJECT, children: [(0,jsx_runtime.jsx)(components_ProjectInfo, { name: project.name, colorIcon: projectColor, date: lastModifiedAt ? new Date(lastModifiedAt) : undefined }), (0,jsx_runtime.jsx)(components_ProjectActions, { isCurrentProject: isCurrentProjectActive, projectName: project.name, selectedProject: selectedProject })] }) }));
};
/* harmony default export */ var components_Project = (Project);

;// ./src/common/ui-components/buttons/styles/ActionButton.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var ActionButton_module = ({"actionButton":"ActionButton-module__actionButton"});
;// ./src/common/ui-components/buttons/styles/PlainButton.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var PlainButton_module = ({"plainButton":"PlainButton-module__plainButton"});
;// ./src/common/ui-components/buttons/styles/ButtonWrapper.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var ButtonWrapper_module = ({"button":"ButtonWrapper-module__button"});
;// ./src/contexts/InterfaceContext.tsx





const InterfaceContext = react.createContext({
    openedPopupIDs: undefined,
    actions: {
        openPopup: helpers,
        closeCurrentPopup: helpers,
        toggleSystemInfoVisibility: helpers,
        getPopup: helpers,
        getActivePopup: () => null,
    },
    values: {
        registeredPopups: [],
        systemInfoVisible: false,
    },
});
function InterfaceContextProvider(props) {
    const { children } = props;
    // const [popups] = useState<Popup[]>(registeredPopups);
    const registeredPopups = [];
    const [openedPopupIDs, setCurrentPopupIDs] = useState(undefined);
    const [openedPopupId, setCurrentPopupId] = useState(undefined);
    const [systemInfoVisible, toggleSystemInfoVisibility] = useSwitch(false);
    const { activeTabsetName, activeTab } = useFlexLayoutContext();
    const openPopup = (id) => {
        const activePopup = registeredPopups.find((p) => p.id === id);
        if (activeTabsetName && activePopup?.frameId !== activeTabsetName) {
            return;
        }
        setCurrentPopupId(id);
    };
    const closeCurrentPopup = () => {
        setCurrentPopupId(undefined);
    };
    useEffect(() => {
        setCurrentPopupIDs((prev) => {
            return prev?.filter((p) => {
                return registeredPopups.find((v) => v.id === p && v.frameId === activeTabsetName);
            });
        });
    }, [activeTabsetName, activeTab]);
    const getPopup = (targetId) => {
        const isVisible = !!openedPopupIDs?.find((id) => id === targetId);
        const popup = isVisible ? registeredPopups?.find(({ id }) => id === targetId)?.component : null;
        return isVisible ? popup : null;
    };
    const getActivePopup = () => {
        return openedPopupId ? registeredPopups?.find(({ id }) => id === openedPopupId)?.component : null;
    };
    return (_jsx(InterfaceContext.Provider, { value: {
            openedPopupIDs,
            actions: {
                openPopup,
                closeCurrentPopup,
                toggleSystemInfoVisibility,
                getPopup,
                getActivePopup,
            },
            values: {
                registeredPopups,
                systemInfoVisible,
            },
        }, children: children }));
}
const useInterfaceContext = () => React.useContext(InterfaceContext);
/* harmony default export */ var contexts_InterfaceContext = (InterfaceContext);

;// ./src/common/interfaces/ButtonTypes.ts
var ButtonTypes;
(function (ButtonTypes) {
    ButtonTypes["ACTION"] = "ACTION";
    ButtonTypes["PLAIN"] = "PLAIN";
})(ButtonTypes || (ButtonTypes = {}));

;// ./src/common/ui-components/buttons/ButtonWrapper.tsx









const defaultClassName = ButtonWrapper_module.button;
const actionButtonClassName = ActionButton_module.actionButton;
const plainButtonClassName = PlainButton_module.plainButton;
const getButtonStyles = (type, customClassName) => {
    return classNames(customClassName, defaultClassName, type === ButtonTypes.PLAIN && plainButtonClassName, type === ButtonTypes.ACTION && actionButtonClassName);
};
/* TODO
 * This component is overcomplicated. Use buttons from:
 * ./qualibrate_frontend_ui/src/ui-lib/components/Button
 *
 * If you just need a clickable wrap - use <button> all default styles are already reset
 *
 */
const ButtonComponent = ({ icon, iconSide, actionName, onClickCallback, type = ButtonTypes.ACTION, customClassName, textColor, hideText = false, onSubmitType = "button", showPopup, disabled = false, ...restProps }) => {
    const { actions: { openPopup }, } = (0,react.useContext)(contexts_InterfaceContext);
    const renderButtonContent = () => {
        const textContent = !hideText ? actionName : "";
        if (iconSide === "RIGHT") {
            return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [textContent || "", icon] }));
        }
        return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: ["c", icon, textContent || ""] }));
    };
    const handleClick = () => {
        if (disabled) {
            return;
        }
        if (showPopup) {
            openPopup(showPopup);
        }
        if (onClickCallback) {
            onClickCallback();
        }
    };
    const defaultBackgroundColor = onSubmitType === "submit" && BLUE_BUTTON;
    const enabledConfig = disabled ? { opacity: 0.5, cursor: "not-allowed" } : {};
    return ((0,jsx_runtime.jsx)("button", { onClick: handleClick, className: getButtonStyles(type, customClassName), style: {
            ...enabledConfig,
            color: textColor,
            backgroundColor: defaultBackgroundColor || undefined,
        }, type: onSubmitType, ...restProps, children: renderButtonContent() }));
};
/* harmony default export */ var ButtonWrapper = (ButtonComponent);

;// ./src/ui-lib/Icons/WorkflowPlaceholderIcon.tsx



const WorkflowPlaceHolderIcon = ({ width = 373, height = 155, color = MAIN_TEXT_COLOR }) => ((0,jsx_runtime.jsxs)("svg", { width: width, height: height, viewBox: "0 0 373 155", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0,jsx_runtime.jsx)("path", { opacity: "0.6", d: "M173.5 81L298 126L357 16.5", stroke: color, strokeDasharray: "2 2" }), (0,jsx_runtime.jsx)("path", { opacity: "0.6", d: "M71.5 79L101 16L173.5 85L239.5 32", stroke: color, strokeDasharray: "2 2" }), (0,jsx_runtime.jsx)("circle", { cx: "51", cy: "105", r: "21", fill: BACKGROUND_COLOR, stroke: color, strokeDasharray: "2 2" }), (0,jsx_runtime.jsx)("path", { d: "M116 16C116 24.2843 109.284 31 101 31C92.7157 31 86 24.2843 86 16C86 7.71573 92.7157 1 101 1C109.284 1 116 7.71573 116 16Z", fill: BACKGROUND_COLOR, stroke: color }), (0,jsx_runtime.jsx)("path", { d: "M189.5 82C189.5 90.2843 182.784 97 174.5 97C166.216 97 159.5 90.2843 159.5 82C159.5 73.7157 166.216 67 174.5 67C182.784 67 189.5 73.7157 189.5 82Z", fill: BACKGROUND_COLOR, stroke: color }), (0,jsx_runtime.jsx)("path", { d: "M313 124C313 132.284 306.284 139 298 139C289.716 139 283 132.284 283 124C283 115.716 289.716 109 298 109C306.284 109 313 115.716 313 124Z", fill: BACKGROUND_COLOR, stroke: color }), (0,jsx_runtime.jsx)("path", { d: "M84 105C84 123.225 69.2254 138 51 138C32.7746 138 18 123.225 18 105C18 86.7746 32.7746 72 51 72C69.2254 72 84 86.7746 84 105Z", stroke: color }), (0,jsx_runtime.jsx)("path", { d: "M25.5 126L1 150.5L4 153.5L28.5 129", stroke: color }), (0,jsx_runtime.jsx)("path", { d: "M372.5 16C372.5 24.2843 365.784 31 357.5 31C349.216 31 342.5 24.2843 342.5 16C342.5 7.71573 349.216 1 357.5 1C365.784 1 372.5 7.71573 372.5 16Z", fill: BACKGROUND_COLOR, stroke: color }), (0,jsx_runtime.jsx)("path", { d: "M254.5 32C254.5 40.2843 247.784 47 239.5 47C231.216 47 224.5 40.2843 224.5 32C224.5 23.7157 231.216 17 239.5 17C247.784 17 254.5 23.7157 254.5 32Z", fill: BACKGROUND_COLOR, stroke: color })] }));

;// ./src/ui-lib/loader/LoaderPage.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var LoaderPage_module = ({"container":"LoaderPage-module__container","text":"LoaderPage-module__text"});
;// ./src/ui-lib/loader/LoadingBar.tsx






// eslint-disable-next-line css-modules/no-unused-class

const DEFAULT_LOADING_PHRASE = "Loading...";
const LoadingBar = ({ text = DEFAULT_LOADING_PHRASE, icon = (0,jsx_runtime.jsx)(WorkflowPlaceHolderIcon, {}), className, actionButton, callback }) => {
    const formatError = (error) => {
        if (typeof error === "string") {
            return error.split("\\n").map((item, idx) => {
                return ((0,jsx_runtime.jsxs)("span", { children: [item, (0,jsx_runtime.jsx)("br", {})] }, idx));
            });
        }
        else {
            return (0,jsx_runtime.jsx)("span", { children: error.detail }, error.detail);
        }
    };
    const retryButton = callback && (0,jsx_runtime.jsx)(ButtonWrapper, { actionName: "Retry", type: ButtonTypes.ACTION, onClickCallback: callback });
    return ((0,jsx_runtime.jsxs)("div", { className: classNames(className), style: { whiteSpace: "pre-wrap" }, children: [icon, (0,jsx_runtime.jsx)("div", { className: LoaderPage_module.text, children: formatError(text) }), actionButton || retryButton] }));
};
/* harmony default export */ var loader_LoadingBar = (LoadingBar);

;// ./src/ui-lib/Icons/NoItemsIcon.tsx



const NoItemsIcon = ({ width = 100, height = 102, color = ACCENT_COLOR_LIGHT }) => ((0,jsx_runtime.jsxs)("svg", { width: width, height: height, viewBox: "0 0 100 102", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0,jsx_runtime.jsx)("path", { d: "M77.8351 43.333V1.5C77.8351 1.22386 77.6113 1 77.3351 1H1.08594C0.809795 1 0.585938 1.22386 0.585938 1.5V86.3324C0.585938 86.6086 0.809794 86.8324 1.08594 86.8324H43.6273", stroke: color }), (0,jsx_runtime.jsx)("path", { d: "M15 41.7087H63", stroke: color, strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("path", { d: "M15 62.7087L34.7482 62.7087", stroke: color, strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("path", { d: "M15 20.0987L63.0662 20.0987", stroke: color, strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("circle", { cx: "75.0586", cy: "77.7087", r: "5.5", stroke: color }), (0,jsx_runtime.jsx)("path", { d: "M90.5428 80.6407C90.359 80.5355 90.2621 80.326 90.2951 80.1168C90.5498 78.499 90.5456 76.8361 90.2731 75.1918C90.2384 74.9828 90.3337 74.7726 90.5167 74.666L94.9937 72.0586C95.2323 71.9196 95.3131 71.6135 95.1742 71.3749L90.5052 63.3581C90.3663 63.1195 90.0601 63.0387 89.8215 63.1777L85.3445 65.7851C85.1615 65.8917 84.9316 65.8708 84.767 65.7375C83.4708 64.6883 82.0268 63.8647 80.4941 63.288C80.2959 63.2134 80.1615 63.0259 80.1608 62.8141L80.1418 57.6368C80.1407 57.3606 79.916 57.1375 79.6398 57.1386L70.361 57.1745C70.0849 57.1756 69.862 57.4002 69.863 57.6763L69.882 62.8536C69.8828 63.0655 69.7496 63.2542 69.5516 63.3296C68.7932 63.6187 68.0467 63.9661 67.3197 64.3894C66.5945 64.8118 65.9238 65.2897 65.2966 65.8078C65.1332 65.9426 64.9035 65.9653 64.7197 65.8601L60.2261 63.2886C59.9865 63.1515 59.681 63.2346 59.5438 63.4742L54.9339 71.527C54.7967 71.7667 54.8798 72.0722 55.1195 72.2094L59.6137 74.7816C59.7977 74.8869 59.8944 75.0966 59.8613 75.306C59.605 76.9243 59.61 78.5849 59.8829 80.2299C59.9176 80.4388 59.8223 80.6491 59.6393 80.7556L55.1624 83.3628C54.9238 83.5018 54.843 83.8079 54.982 84.0465L59.6508 92.0633C59.7897 92.3019 60.0958 92.3827 60.3345 92.2437L64.8115 89.6363C64.9945 89.5297 65.2243 89.5506 65.389 89.6838C66.6843 90.7323 68.1268 91.5573 69.6597 92.1315C69.8584 92.2059 69.9932 92.3936 69.994 92.6058L70.0135 97.7838C70.0145 98.06 70.2392 98.283 70.5154 98.2819L79.794 98.2461C80.0702 98.2451 80.2932 98.0203 80.2921 97.7442L80.2719 92.5685C80.271 92.3569 80.4037 92.1684 80.6013 92.0928C81.3617 91.802 82.1106 91.4545 82.8361 91.032C83.5633 90.6085 84.2338 90.1292 84.8614 89.6117C85.0246 89.4771 85.2541 89.4547 85.4377 89.5599L89.929 92.1315C90.1687 92.2687 90.4742 92.1856 90.6114 91.946L95.2212 83.8933C95.3584 83.6536 95.2753 83.3481 95.0356 83.2109L90.5428 80.6407Z", stroke: color })] }));

;// ./src/modules/Project/components/ProjectList.tsx

 // eslint-disable-next-line css-modules/no-unused-class





const ProjectList = ({ projects, selectedProject, setSelectedProject }) => {
    const { isScanningProjects } = useProjectContext();
    const sortedProjects = (0,react.useMemo)(() => {
        return [...projects].sort((a, b) => new Date(b.last_modified_at).getTime() - new Date(a.last_modified_at).getTime());
    }, [projects]);
    if (!isScanningProjects && projects?.length === 0) {
        return ((0,jsx_runtime.jsx)("div", { className: Project_module.splashNoProject, children: (0,jsx_runtime.jsx)(loader_LoadingBar, { icon: (0,jsx_runtime.jsx)(NoItemsIcon, { height: 204, width: 200 }), text: "No projects found" }) }));
    }
    return ((0,jsx_runtime.jsx)("div", { className: Project_module.splash, children: sortedProjects.map((project, index) => ((0,jsx_runtime.jsx)(components_Project, { isActive: selectedProject?.name === project.name, project: project, lastModifiedAt: project.last_modified_at, selectedProject: selectedProject, setSelectedProject: setSelectedProject }, index))) }));
};
/* harmony default export */ var components_ProjectList = (ProjectList);

;// ./src/common/ui-components/common/Input/Input.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Input_module = ({"inputWrapper":"Input-module__inputWrapper","withIcon":"Input-module__withIcon","disabledInput":"Input-module__disabledInput","inputIcon":"Input-module__inputIcon","input":"Input-module__input","error":"Input-module__error","label":"Input-module__label","inputTitle":"Input-module__inputTitle","inputController":"Input-module__inputController","newLineBetween":"Input-module__newLineBetween","inputControllerWithLock":"Input-module__inputControllerWithLock","inputName":"Input-module__inputName","inputField":"Input-module__inputField","inputSelect":"Input-module__inputSelect","addBottomPadding":"Input-module__addBottomPadding","lockValue":"Input-module__lockValue","errorMsg":"Input-module__errorMsg","inputIcon_inner":"Input-module__inputIcon_inner","inputIconInner":"Input-module__inputIcon_inner","labelWrapper":"Input-module__labelWrapper"});
;// ./src/common/ui-components/common/Input/InputField.tsx


// eslint-disable-next-line css-modules/no-unused-class



const InputField = (props) => {
    const { name = "", value, onChange, typeOfField, className, error, icon, label, iconType, inputClassName: inputCN, disabled = false, ...restProps } = props;
    const handleChange = (event) => {
        if (onChange) {
            onChange(event.target.value, event);
        }
    };
    const inputClassName = classNames(Input_module.input, error && Input_module.error, inputCN, disabled && Input_module.disabledInput);
    return ((0,jsx_runtime.jsxs)("div", { className: classNames(Input_module.inputWrapper, icon && Input_module.withIcon, className), children: [(label || icon) && ((0,jsx_runtime.jsxs)("div", { className: Input_module.labelWrapper, children: [label && (0,jsx_runtime.jsx)("label", { className: Input_module.label, children: label }), icon && (0,jsx_runtime.jsx)("div", { className: classNames(Input_module.inputIcon, iconType === IconType.INNER && Input_module.inputIcon_inner), children: icon })] })), (0,jsx_runtime.jsx)("input", { name: name, autoComplete: "new-password", className: inputClassName, value: value, onChange: handleChange, type: typeOfField === "password" ? "password" : "text", placeholder: props.placeholder ?? "Enter a value", disabled: props.disabled, ...restProps }), (0,jsx_runtime.jsx)("div", { className: Input_module.errorMsg, children: error })] }));
};
/* harmony default export */ var Input_InputField = (InputField);

;// ./src/modules/Nodes/api/NodesAPI.tsx



class NodesApi extends Api {
    constructor() {
        super();
    }
    static api(path) {
        return this.address + path;
    }
    static fetchAllNodes(rescan = false) {
        return this._fetch(this.api(ALL_NODES()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
            queryParams: { rescan },
        });
    }
    static submitNodeParameters(nodeName, inputParameter) {
        return this._fetch(this.api(SUBMIT_NODE_RUN()), API_METHODS.POST, {
            headers: BASIC_HEADERS,
            body: JSON.stringify(inputParameter),
            queryParams: { name: nodeName },
        });
    }
    static fetchLastRunInfo() {
        return this._fetch(this.api(GET_LAST_RUN()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static fetchLastRunStatusInfo() {
        return this._fetch(this.api(GET_LAST_RUN_STATUS()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static checkIsNodeRunning() {
        return this._fetch(this.api(IS_NODE_RUNNING()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static stopRunningGraph() {
        return this._fetch(this.api(STOP_RUNNING()), API_METHODS.POST, {
            headers: BASIC_HEADERS,
        });
    }
    static getLogs(after = null, before = null, num_entries = "300", reverse = true) {
        return this._fetch(this.api(GET_LOGS({ after, before, num_entries, reverse })), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
}

;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementElement/MeasurementElement.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var MeasurementElement_module = ({"rowWrapper":"MeasurementElement-module__rowWrapper","row":"MeasurementElement-module__row","dot":"MeasurementElement-module__dot","titleOrName":"MeasurementElement-module__titleOrName","descriptionWrapper":"MeasurementElement-module__descriptionWrapper","descriptionTooltip":"MeasurementElement-module__descriptionTooltip","expandedContent":"MeasurementElement-module__expandedContent","runInfoAndParameters":"MeasurementElement-module__runInfoAndParameters","runInfo":"MeasurementElement-module__runInfo","parameters":"MeasurementElement-module__parameters"});
;// ./src/modules/GraphLibrary/api/GraphLibraryApi.tsx



class GraphLibraryApi extends Api {
    constructor() {
        super();
    }
    static api(path) {
        return this.address + path;
    }
    static fetchAllGraphs(rescan = false) {
        return this._fetch(this.api(ALL_GRAPHS()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
            queryParams: { rescan },
        });
    }
    static fetchGraph(name) {
        return this._fetch(this.api(GET_WORKFLOW_GRAPH()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
            queryParams: { name },
        });
    }
    static submitWorkflow(name, workflow) {
        return this._fetch(this.api(SUBMIT_WORKFLOW_RUN()), API_METHODS.POST, {
            headers: BASIC_HEADERS,
            body: JSON.stringify(workflow),
            queryParams: { name },
        });
    }
    static fetchExecutionHistory() {
        return this._fetch(this.api(GET_EXECUTION_HISTORY()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
    static fetchLastWorkflowStatus() {
        return this._fetch(this.api(GET_LAST_RUN_WORKFLOW_STATUS()), API_METHODS.GET, {
            headers: BASIC_HEADERS,
        });
    }
}

;// ./src/services/WebSocketService.ts
/**
 * @fileoverview Generic WebSocket client with automatic reconnection and pub/sub pattern.
 *
 * Provides a reusable WebSocket wrapper class for real-time bidirectional communication
 * with automatic reconnection logic and multiple subscriber support.
 *
 * **Primary Use Case**:
 * Used by WebSocketContext.tsx to manage two real-time connections for quantum calibration:
 * - Run status updates: Real-time node/graph execution progress
 * - Execution history: Historical calibration data for timeline visualization
 *
 * **Key Features**:
 * - Type-safe message handling via TypeScript generics
 * - Automatic reconnection every second until the server becomes available again
 * - Pub/sub pattern allowing multiple callbacks per WebSocket connection
 * - JSON serialization/deserialization of all messages
 * - Robust connection state tracking with 5-state state machine (ConnectionState enum)
 *
 * **Architecture Pattern**:
 * The service implements a facade pattern over the native WebSocket API, adding
 * resilience features (reconnection) and developer experience improvements (pub/sub,
 * type safety) without requiring changes to consuming code.
 *
 * **RECENT IMPROVEMENTS**:
 * - **State Tracking**: Replaced manual boolean flag with ConnectionState enum for accurate state tracking
 *
 * **REMAINING AREAS FOR IMPROVEMENT**:
 * 1. **Reconnection Strategy**: Constant 1s retries without jitter can cause thundering herd patterns
 * 2. **Retry Telemetry**: No built-in analytics for how long a reconnect cycle has been running
 * 3. **Error Handling**: Console-only logging, no user-facing error notifications
 * 4. **Subscriber Errors**: Uncaught errors in subscribers can affect other subscribers
 * 5. **No Runtime Type Validation**: Type safety is compile-time only
 *
 * @see WebSocketContext for React integration and provider implementation
 * @see WS_GET_STATUS and WS_EXECUTION_HISTORY for WebSocket endpoint routes
 */
/**
 * WebSocket connection state machine.
 *
 * **State Transitions**:
 * - DISCONNECTED → CONNECTING: connect() called
 * - CONNECTING → CONNECTED: WebSocket onopen event fires
 * - CONNECTING → FAILED: Connection attempt fails (onclose during CONNECTING)
 * - CONNECTED → FAILED: Unexpected disconnection (onclose during CONNECTED)
 * - FAILED → RECONNECTING: Automatic retry initiated
 * - RECONNECTING → CONNECTING: Retry attempt starts
 * - ANY_STATE → DISCONNECTED: disconnect() called (manual shutdown)
 *
 * **State Meanings**:
 * - DISCONNECTED: Initial state, no connection exists or manually disconnected
 * - CONNECTING: Connection attempt in progress (waiting for onopen)
 * - CONNECTED: Successfully connected and ready to send/receive messages
 * - RECONNECTING: Waiting to retry after connection failure
 * - FAILED: Connection attempt failed, either retrying or exhausted retries
 */
var ConnectionState;
(function (ConnectionState) {
    ConnectionState["DISCONNECTED"] = "disconnected";
    ConnectionState["CONNECTING"] = "connecting";
    ConnectionState["CONNECTED"] = "connected";
    ConnectionState["RECONNECTING"] = "reconnecting";
    ConnectionState["FAILED"] = "failed";
})(ConnectionState || (ConnectionState = {}));
/**
 * Generic WebSocket client with automatic reconnection and pub/sub pattern.
 *
 * **Message Protocol**:
 * - All messages must be JSON-serializable objects
 * - Messages automatically parsed via JSON.parse() on receive
 * - Invalid JSON messages logged as warnings, not thrown as errors
 * - Type safety enforced via generic parameter T (compile-time only, no runtime validation)
 *
 * **Current Usage in QUAlibrate**:
 * Used by WebSocketContext.tsx to manage two real-time connections:
 * 1. Run Status WebSocket (`/execution/ws/run_status`) - node/graph execution updates
 * 2. Execution History WebSocket (`/execution/ws/workflow_execution_history`) - historical data
 *
 * **Connection State Management**:
 * Uses a 5-state state machine (ConnectionState enum) for accurate connection tracking:
 * - DISCONNECTED: Initial state or manually disconnected
 * - CONNECTING: Connection attempt in progress
 * - CONNECTED: Successfully connected and ready
 * - RECONNECTING: Waiting to retry after failure
 * - FAILED: Connection failed (may retry or be exhausted)
 *
 * The isConnected() method provides dual verification by checking both the internal
 * ConnectionState and the actual WebSocket.readyState for maximum reliability.
 *
 * **REMAINING LIMITATIONS**:
 * Continuous 1s retries may overwhelm unstable networks or servers during outages.
 * Consider introducing jitter or a maximum delay cap, and exposing retry telemetry
 * to users when connection issues persist.
 *
 * **IMPROVEMENT NEEDED: Error Handling**:
 * - Connection errors only log to console (no user feedback mechanism)
 * - No connection timeout handling (browser default timeout varies)
 * - No distinction between recoverable (network issues) vs non-recoverable (bad URL) errors
 *
 * @template T - The message type for this WebSocket connection (must be JSON-serializable)
 *
 * @see WebSocketContext for React integration and usage in component tree
 * @see WS_GET_STATUS and WS_EXECUTION_HISTORY for WebSocket route constants
 */
class WebSocketService {
    /**
     * WebSocket connection instance. Null when disconnected.
     * @private
     */
    ws = null;
    /**
     * WebSocket URL (e.g., "ws://localhost:8001/execution/ws/run_status").
     * Immutable after construction.
     * @private
     * @readonly
     */
    url;
    /**
     * Current connection state using state machine pattern.
     *
     * Tracks the connection lifecycle through 5 distinct states:
     * - DISCONNECTED: No connection, initial state
     * - CONNECTING: Connection attempt in progress
     * - CONNECTED: Successfully connected and operational
     * - RECONNECTING: Waiting before retry attempt
     * - FAILED: Connection attempt failed
     *
     * This replaces the previous boolean isConnected flag to provide more
     * granular state information and eliminate synchronization issues with
     * WebSocket.readyState.
     *
     * @private
     */
    connectionState = ConnectionState.DISCONNECTED;
    reconnectAttempt = 0;
    shouldReconnect = true;
    reconnectTimeoutId = null;
    retryDelay = 1000;
    /**
     * Primary message callback provided during construction.
     * Called for every message received, before notifying subscribers.
     * @private
     * @readonly
     */
    onMessage;
    /**
     * Primary callback when the connection is established.
     * Called every time connection is established.
     * @private
     * @readonly
     */
    onConnected;
    /**
     * Primary callback when the connection is closed.
     * Called every time connection is closed.
     * @private
     * @readonly
     */
    onClose;
    /**
     * Array of subscriber callbacks registered via subscribe() method.
     * All subscribers are notified after onMessage callback.
     *
     * Subscribers are responsible for their own error handling - uncaught errors
     * in subscriber callbacks will propagate and may affect other subscribers.
     *
     * @private
     */
    subscribers = [];
    /**
     * Construct a new WebSocket service instance.
     *
     * Does NOT automatically connect - call connect() to establish connection.
     *
     * @param url - Full WebSocket URL (e.g., "ws://localhost:8001/ws/status")
     * @param onMessage - Callback invoked for every received message (before subscribers)
     *
     */
    constructor(url, onMessage, onConnected, onClose) {
        this.url = url;
        this.onMessage = onMessage;
        this.onConnected = onConnected;
        this.onClose = onClose;
    }
    /**
     * Establish WebSocket connection with automatic retry on failure.
     *
     * Sets up event handlers for connection lifecycle (onopen, onmessage, onerror, onclose)
     * and implements automatic reconnection with linear backoff strategy.
     *
     * **Connection Process**:
     * 1. Check if already connected (early return if yes)
     * 2. Create new WebSocket instance with this.url
     * 3. Set isConnected=true on successful open
     * 4. Handle incoming messages by parsing JSON and notifying callbacks
     * 5. On connection close, retry automatically after a short delay
     *
     * **Reconnection Behavior**:
     * - Attempts to reconnect indefinitely
     * - Uses a fixed one second delay between attempts (no exponential backoff)
     * - Logs each retry to the console for visibility
     *
     * **Error Handling**:
     * - Constructor errors caught and logged (connection attempt failures)
     * - Message parsing errors caught in onmessage handler (invalid JSON)
     * - All errors only log to console, no user-facing notifications
     * - No distinction between recoverable vs permanent failures
     *
     * @remarks
     * Connection failures are logged to console but don't throw errors.
     * Use isOpen() to check connection state after calling connect().
     *
     * Guard against duplicate connections: returns early if isConnected is true.
     * However, isConnected flag can become stale (see FRAGILE note in field docs).
     *
     * @see disconnect for closing connection gracefully
     * @see isOpen for checking current connection state
     */
    connect(retryDelay = 1000) {
        if (this.connectionState === ConnectionState.CONNECTED) {
            console.warn("⚠️ WebSocket is already connected:", this.url);
            return;
        }
        this.shouldReconnect = true;
        this.reconnectAttempt = 0;
        this.retryDelay = retryDelay;
        this.clearReconnectTimeout();
        this.tryConnect();
    }
    /**
     * Send typed message over WebSocket connection.
     *
     * Serializes message to JSON and sends over WebSocket if connection is open.
     * Uses isConnected() method which performs dual verification of both internal
     * state and WebSocket.readyState for maximum reliability.
     *
     * **Safety Checks**:
     * The isConnected() method verifies:
     * 1. Internal connectionState === CONNECTED
     * 2. WebSocket instance exists and readyState === OPEN
     *
     * **Current Usage in QUAlibrate**:
     * This method appears UNUSED in the current application - WebSockets are used
     * receive-only (server pushes data, frontend doesn't send). The send methods
     * in WebSocketContext.tsx (sendRunStatus, sendHistory) exist but are not called.
     *
     * @param data - Message to send. Must match type T and be JSON-serializable.
     *
     * @remarks
     * **Silently fails if connection not open** - returns early with console warning.
     * Check isConnected() before sending critical messages to detect failures.
     *
     * **No return value or error propagation** - callers cannot detect send failures.
     * Consider returning boolean success status or throwing errors for better error handling.
     *
     * **No message queuing** - messages sent while disconnected are lost permanently.
     * Consider implementing message queue to retry sending after reconnection.
     *
     * @see isConnected for checking connection state before sending
     * @see connect for establishing connection
     */
    send(data) {
        // Use isConnected() for reliable connection check
        if (!this.isConnected()) {
            console.warn("❌ Cannot send message: WebSocket not connected:", this.url);
            return;
        }
        try {
            // Serialize to JSON string and send
            // FRAGILE: No validation that data is JSON-serializable
            // Will throw if data contains non-serializable values (functions, circular refs)
            this.ws.send(JSON.stringify(data));
        }
        catch (err) {
            // Serialization or send failed - log but don't propagate error
            console.warn("❌ Failed to send data over WebSocket:", err);
        }
    }
    /**
     * Gracefully close WebSocket connection and clean up resources.
     *
     * Closes the WebSocket connection, clears the connection instance, and sets
     * state to DISCONNECTED. Does not clear subscribers (they persist for reconnection).
     *
     * **Cleanup Behavior**:
     * - Calls WebSocket.close() to initiate graceful shutdown
     * - Sets ws to null to allow garbage collection
     * - Sets connectionState to DISCONNECTED
     * - Does NOT clear subscribers array (intentional for reconnection scenarios)
     *
     * **IMPORTANT: Stops Reconnection**:
     * After calling disconnect(), automatic reconnection will NOT occur even if
     * onclose handler fires. This is because the retries parameter is local to
     * the connect() method call stack. To reconnect, must call connect() again.
     *
     * @remarks
     * Safe to call when already disconnected (no-op if ws is null).
     * Does not unsubscribe callbacks - subscribers persist across disconnect/reconnect cycles.
     *
     * Typical usage: component unmount cleanup to prevent memory leaks.
     * See WebSocketContext.tsx useEffect cleanup function for example.
     *
     * @see connect for establishing new connection
     * @see isConnected for checking connection state
     * @see getConnectionState for detailed state information
     */
    disconnect() {
        this.shouldReconnect = false;
        this.clearReconnectTimeout();
        this.reconnectAttempt = 0;
        if (this.ws) {
            const socket = this.ws;
            socket.close();
            this.ws = null;
        }
        this.connectionState = ConnectionState.DISCONNECTED;
    }
    /**
     * Subscribe to WebSocket messages.
     *
     * Adds callback to subscribers array with duplicate prevention.
     * All subscribers are notified after the primary onMessage callback
     * when messages are received.
     *
     * **Callback Notification Order**:
     * 1. Primary onMessage callback (constructor parameter)
     * 2. All subscribers in registration order
     *
     * **Duplicate Prevention**:
     * Same callback reference will not be registered multiple times.
     * Uses reference equality (===) for duplicate detection.
     *
     * **Error Isolation**:
     * Errors thrown in subscriber callbacks are caught and logged, preventing
     * them from affecting other subscribers. Each subscriber is isolated in its
     * own try-catch block. Errors are logged to console.error.
     *
     * @param cb - Callback function to invoke on each message. Receives parsed message data.
     * @returns Unsubscribe function for convenience (modern pattern)
     *
     * @remarks
     * **New Pattern (Use this)**:
     * ```typescript
     * const unsubscribe = ws.subscribe((data) => console.log(data));
     * // Later...
     * unsubscribe();
     * ```
     *
     * **Legacy Pattern (Don't use)**:
     * ```typescript
     * const callback = (data) => console.log(data);
     * ws.subscribe(callback);
     * // Later...
     * ws.unsubscribe(callback);
     * ```
     *
     * Subscribers persist across disconnect/reconnect cycles unless explicitly
     * unsubscribed via the returned function or unsubscribe() method.
     *
     * Callbacks are invoked synchronously in the onmessage event handler.
     * Long-running callbacks will block WebSocket message processing.
     *
     * @see connect for the message handling flow
     */
    subscribe(cb) {
        // Check for duplicates to prevent double-subscription
        if (!this.subscribers.includes(cb)) {
            this.subscribers.push(cb);
        }
        // Return unsubscribe function for convenience
        return () => {
            this.subscribers = this.subscribers.filter((s) => s !== cb);
        };
    }
    /**
     * Get current connection state.
     *
     * Returns the current ConnectionState enum value, providing granular
     * information about the connection lifecycle.
     *
     * **Use Cases**:
     * - UI status indicators showing connection state
     * - Conditional logic based on connection phase
     * - Debugging connection issues
     * - Monitoring reconnection attempts
     *
     * @returns {ConnectionState} Current connection state (one of 5 enum values)
     *
     * @remarks
     * Prefer this method over isConnected() when you need detailed state information.
     * Use isConnected() when you only need to know if messages can be sent/received.
     *
     * **State meanings**:
     * - DISCONNECTED: No connection, can call connect()
     * - CONNECTING: Connection attempt in progress
     * - CONNECTED: Ready to send/receive messages
     * - RECONNECTING: Waiting before retry attempt
     * - FAILED: Connection failed (may be retrying or exhausted)
     *
     * @see isConnected for simple boolean connection check
     * @see ConnectionState enum for state definitions
     */
    getConnectionState() {
        return this.connectionState;
    }
    /**
     * Check if WebSocket is connected and ready to send messages.
     *
     * Performs dual verification for maximum reliability:
     * 1. Checks internal connectionState === CONNECTED
     * 2. Verifies actual WebSocket.readyState === OPEN
     *
     * This eliminates the previous risk of state desynchronization between
     * the manual isConnected flag and the actual WebSocket state.
     *
     * **Use Cases**:
     * - Check before calling send() to avoid errors
     * - Conditional UI rendering based on connectivity
     * - Guard conditions for WebSocket-dependent operations
     *
     * @returns {boolean} True if connected and ready, false otherwise
     *
     * @remarks
     * This method provides a reliable boolean check for "can I send messages now?"
     * Use getConnectionState() if you need more detailed state information.
     *
     * **Dual Check Benefits**:
     * - Catches cases where WebSocket closed but state not yet updated
     * - Catches cases where state updated but WebSocket not yet open
     * - Provides defense-in-depth against edge cases
     *
     * @see getConnectionState for detailed state information
     * @see send for message sending (which uses this method)
     */
    isConnected() {
        return this.connectionState === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN;
    }
    tryConnect() {
        if (!this.shouldReconnect) {
            this.connectionState = ConnectionState.DISCONNECTED;
            return;
        }
        this.connectionState = ConnectionState.CONNECTING;
        try {
            this.ws = new WebSocket(this.url);
            this.ws.onopen = () => {
                this.connectionState = ConnectionState.CONNECTED;
                this.reconnectAttempt = 0;
                this.clearReconnectTimeout();
                console.log("✅ WebSocket connected:", this.url);
                if (this.onConnected) {
                    this.onConnected();
                }
            };
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.onMessage(data);
                    this.subscribers.forEach((cb) => {
                        try {
                            cb(data);
                        }
                        catch (error) {
                            console.error("❌ Error in WebSocket subscriber:", error);
                        }
                    });
                }
                catch (e) {
                    console.warn("⚠️ Failed to parse WebSocket message:", event.data, e);
                }
            };
            this.ws.onerror = (err) => {
                console.warn("⚠️ WebSocket error on", this.url, err);
            };
            this.ws.onclose = () => {
                this.ws = null;
                this.clearReconnectTimeout();
                if (!this.shouldReconnect || this.connectionState === ConnectionState.DISCONNECTED) {
                    this.connectionState = ConnectionState.DISCONNECTED;
                    return;
                }
                console.warn("🔌 WebSocket closed:", this.url);
                this.connectionState = ConnectionState.FAILED;
                if (this.onClose) {
                    this.onClose();
                }
                this.scheduleReconnect();
            };
        }
        catch (err) {
            console.warn("❌ Failed to connect WebSocket:", this.url, err);
            this.connectionState = ConnectionState.FAILED;
            this.scheduleReconnect();
        }
    }
    clearReconnectTimeout() {
        if (this.reconnectTimeoutId !== null) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }
    }
    scheduleReconnect() {
        if (!this.shouldReconnect) {
            this.connectionState = ConnectionState.DISCONNECTED;
            return;
        }
        this.connectionState = ConnectionState.RECONNECTING;
        const delayMs = this.retryDelay;
        console.warn(`⏳ Attempting to reconnect to ${this.url} in ${delayMs}ms (attempt ${this.reconnectAttempt + 1})`);
        this.reconnectAttempt += 1;
        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectTimeoutId = null;
            this.tryConnect();
        }, delayMs);
    }
}

;// ./src/services/webSocketRoutes.ts
const WS_GET_STATUS = "execution/ws/run_status";
const WS_EXECUTION_HISTORY = "execution/ws/workflow_execution_history";

// EXTERNAL MODULE: ./node_modules/@mui/material/Dialog/Dialog.js + 11 modules
var Dialog = __webpack_require__(3231);
// EXTERNAL MODULE: ./node_modules/@mui/material/DialogTitle/DialogTitle.js
var DialogTitle = __webpack_require__(6831);
// EXTERNAL MODULE: ./node_modules/@mui/material/DialogContent/DialogContent.js + 1 modules
var DialogContent = __webpack_require__(2477);
// EXTERNAL MODULE: ./node_modules/@mui/material/DialogContentText/DialogContentText.js + 1 modules
var DialogContentText = __webpack_require__(7867);
// EXTERNAL MODULE: ./node_modules/@mui/material/DialogActions/DialogActions.js + 1 modules
var DialogActions = __webpack_require__(8763);
;// ./src/common/ui-components/common/BasicDialog/BasicDialog.tsx



const BasicDialog = ({ open, title, description, onClose, buttons }) => {
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };
    return ((0,jsx_runtime.jsx)("div", { children: (0,jsx_runtime.jsxs)(Dialog/* default */.A, { open: open, onClose: handleClose, children: [(0,jsx_runtime.jsx)(DialogTitle/* default */.A, { children: title }), (0,jsx_runtime.jsx)(DialogContent/* default */.A, { children: (0,jsx_runtime.jsx)(DialogContentText/* default */.A, { children: description }) }), buttons && (0,jsx_runtime.jsx)(DialogActions/* default */.A, { children: buttons.map((button) => button) })] }) }));
};

;// ./src/contexts/WebSocketContext.tsx

/**
 * @fileoverview WebSocket state management for real-time quantum calibration updates.
 *
 * This context provides WebSocket connections to two backend endpoints for real-time
 * communication during calibration workflows:
 * 1. `/execution/ws/run_status` - Real-time node/graph execution status updates
 * 2. `/execution/ws/workflow_execution_history` - Historical execution records for timeline view
 *
 * **Architecture**:
 * - Uses singleton WebSocketService instances per connection (stored in useRef)
 * - Auto-reconnects once per second until the server becomes available again
 * - Supports pub/sub pattern with subscribe/unsubscribe for multiple consumers
 * - Updates pushed to state every ~500ms during active calibration runs
 *
 * **Provider Hierarchy**:
 * Must wrap all components that need real-time updates. Currently wraps entire app
 * at index.tsx level (inside GlobalThemeContextProvider), providing updates to:
 * - NodesContext: Consumes runStatus for node execution state synchronization
 * - GraphContext: Consumes runStatus for graph workflow visualization
 * - SnapshotsContext: May consume history for timeline updates
 *
 * **Connection Lifecycle**:
 * - Connects on mount (via useEffect initialization)
 * - Disconnects on unmount (cleanup function)
 * - Reconnection handled automatically by WebSocketService with continuous 1s retries
 *
 * **Critical Integration Point**:
 * NodesContext.tsx subscribes to runStatus changes via useEffect,
 * triggering node execution state updates when runStatus.runnable_type === "node".
 *
 * **IMPROVEMENT NEEDED: Error Handling**:
 * - WebSocket errors only log to console (limited user feedback beyond the dialog)
 * - Connection failures during reconnection rely solely on automatic retry (no manual override)
 * - No circuit breaker pattern for persistent connection failures
 * - Consider adding connection status indicator and error boundaries
 *
 * @see WebSocketService for low-level WebSocket management implementation
 * @see NodesContext for primary consumer of runStatus updates (lines 265-269)
 * @see GraphContext for graph workflow visualization integration
 */





/**
 * React context for WebSocket real-time calibration data.
 *
 * Initialized with null values for runStatus and history, and no-op functions
 * for all operations. Actual implementations provided by WebSocketProvider.
 */
const WebSocketContext = (0,react.createContext)({
    runStatus: null,
    history: null,
    sendRunStatus: () => { },
    sendHistory: () => { },
    subscribeToRunStatus: () => () => { },
    subscribeToHistory: () => () => { },
});
/**
 * Custom hook to access WebSocket data and operations.
 *
 * Provides access to real-time calibration execution status and historical data
 * via WebSocket connections, along with methods for pub/sub pattern subscriptions.
 *
 * @returns {WebSocketData} Object containing:
 *   - runStatus: Latest execution status (null if no active run)
 *   - history: Historical execution records (null if not yet received)
 *   - sendRunStatus: Send message to status WebSocket
 *   - sendHistory: Send message to history WebSocket
 *   - subscribeToRunStatus: Register callback for status updates, returns unsubscribe function
 *   - subscribeToHistory: Register callback for history updates, returns unsubscribe function
 *
 * @throws Implicitly throws if used outside WebSocketProvider (context will have default no-op values)
 *
 * @see WebSocketProvider for the provider component setup
 * @see NodesContext for primary consumer of runStatus
 */
const useWebSocketData = () => (0,react.useContext)(WebSocketContext);
/**
 * Provider component for WebSocket real-time calibration data.
 *
 * Establishes and manages two WebSocket connections for real-time updates during
 * quantum calibration workflows. Handles automatic reconnection, state management,
 * and pub/sub pattern for multiple subscribers.
 *
 * **Setup Instructions**:
 * Must be placed high in the component tree (currently in index.tsx inside
 * GlobalThemeContextProvider) to ensure all child contexts and components can
 * access real-time data.
 *
 * **WebSocket Connections**:
 * - Run Status: `${protocol}://${host}/execution/ws/run_status`
 * - Execution History: `${protocol}://${host}/execution/ws/workflow_execution_history`
 *
 * **Environment Configuration**:
 * Protocol and host determined by:
 * 1. Protocol: Auto-detected from window.location (http→ws, https→wss)
 * 2. Host: process.env.WS_BASE_URL (if set) or window.location.host + pathname
 *
 * **Lifecycle Management**:
 * - Connections established on component mount (useEffect with empty deps)
 * - Both connections use same WebSocketService with continuous 1s retry cadence
 * - Disconnects gracefully on component unmount via cleanup function
 * - Reconnection handled automatically by WebSocketService (linear backoff, 1s delay)
 *
 * @param props.children - React children to receive WebSocket context
 *
 * @example
 * ```typescript
 * // In index.tsx
 * <GlobalThemeContextProvider>
 *   <WebSocketProvider>
 *     <ApiContextProvider>
 *       <NodesContextProvider>
 *         <App />
 *       </NodesContextProvider>
 *     </ApiContextProvider>
 *   </WebSocketProvider>
 * </GlobalThemeContextProvider>
 * ```
 *
 * @remarks
 * **IMPROVEMENT NEEDED: Error Recovery**:
 * After 5 failed reconnection attempts, the WebSocket service stops trying and
 * connections remain closed indefinitely. Users must refresh the page to restore
 * real-time updates. Consider:
 * - Exponential backoff instead of linear backoff
 * - Unlimited reconnection attempts with longer delays
 * - User-facing "reconnect" button when connection lost
 * - React Error Boundary to catch and report connection failures
 *
 * **Performance Note**:
 * WebSocketService instances are stored in useRef to prevent recreation on re-renders.
 * State updates (setRunStatus, setHistory) trigger re-renders of all consumers,
 * so consider memoization in child components if performance issues arise.
 *
 * @see WebSocketService for low-level connection management (services/WebSocketService.ts)
 * @see useWebSocketData for the hook to consume this context
 * @see WS_GET_STATUS and WS_EXECUTION_HISTORY for WebSocket route constants
 */
const WebSocketProvider = ({ children }) => {
    // Determine WebSocket protocol based on current page protocol (http→ws, https→wss)
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    const location = "MISSING_ENV_VAR".WS_BASE_URL || `${window.location.host}${window.location.pathname}`;
    const host = "MISSING_ENV_VAR".WS_BASE_URL || location;
    // Use useRef to persist WebSocketService instances across re-renders
    // This prevents reconnection on every component update
    const runStatusWS = (0,react.useRef)(null);
    const historyWS = (0,react.useRef)(null);
    // State for current WebSocket data, updated by WebSocketService callbacks
    const [runStatus, setRunStatus] = (0,react.useState)(null);
    const [history, setHistory] = (0,react.useState)(null);
    const [showConnectionErrorDialog, setShowConnectionErrorDialog] = (0,react.useState)(false);
    const [connectionLostAt, setConnectionLostAt] = (0,react.useState)(null);
    const [connectionLostSeconds, setConnectionLostSeconds] = (0,react.useState)(0);
    const connectionLostAtRef = (0,react.useRef)(null);
    const { refreshShouldGoToProjectPage } = useProjectContext();
    const handleShowConnectionErrorDialog = (0,react.useCallback)(() => {
        if (localStorage.getItem("backandWorking") !== "true") {
            return;
        }
        if (connectionLostAtRef.current === null) {
            const now = Date.now();
            connectionLostAtRef.current = now;
            setConnectionLostAt(now);
            setConnectionLostSeconds(0);
        }
        setShowConnectionErrorDialog(true);
        localStorage.setItem("backandWorking", "false");
    }, []);
    const handleHideConnectionErrorDialog = (0,react.useCallback)(() => {
        setShowConnectionErrorDialog((isVisible) => {
            if (!isVisible) {
                return isVisible;
            }
            localStorage.setItem("backandWorking", "true");
            connectionLostAtRef.current = null;
            setConnectionLostAt(null);
            setConnectionLostSeconds(0);
            void refreshShouldGoToProjectPage();
            return false;
        });
    }, [refreshShouldGoToProjectPage]);
    (0,react.useEffect)(() => {
        if (!showConnectionErrorDialog || connectionLostAt === null) {
            return;
        }
        setConnectionLostSeconds(Math.floor((Date.now() - connectionLostAt) / 1000));
        const intervalId = window.setInterval(() => {
            setConnectionLostSeconds(Math.floor((Date.now() - connectionLostAt) / 1000));
        }, 1000);
        return () => {
            clearInterval(intervalId);
        };
    }, [showConnectionErrorDialog, connectionLostAt]);
    const formatElapsed = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return minutes > 0 ? `${minutes}m ${secs.toString().padStart(2, "0")}s` : `${secs}s`;
    };
    // Establish WebSocket connections on mount, disconnect on unmount
    // Empty dependency array [] ensures this runs once per component lifecycle
    (0,react.useEffect)(() => {
        // Construct full WebSocket URLs from protocol, host, and route constants
        const runStatusUrl = `${protocol}://${host}${WS_GET_STATUS}`;
        const historyUrl = `${protocol}://${host}${WS_EXECUTION_HISTORY}`;
        runStatusWS.current = new WebSocketService(runStatusUrl, setRunStatus, handleHideConnectionErrorDialog, handleShowConnectionErrorDialog);
        historyWS.current = new WebSocketService(historyUrl, setHistory, handleHideConnectionErrorDialog, handleShowConnectionErrorDialog);
        // Initiate connections with continuous 1-second retry cadence
        if (runStatusWS.current && !runStatusWS.current.isConnected()) {
            runStatusWS.current.connect();
        }
        if (historyWS.current && !historyWS.current.isConnected()) {
            historyWS.current.connect();
        }
        // Cleanup function: disconnect WebSockets when component unmounts
        // Prevents memory leaks and dangling connections
        return () => {
            if (runStatusWS.current && runStatusWS.current.isConnected()) {
                runStatusWS.current.disconnect();
            }
            if (historyWS.current && historyWS.current.isConnected()) {
                historyWS.current.disconnect();
            }
        };
    }, []); // Empty deps: run once on mount, cleanup on unmount
    // Message sending functions (Don't seem to be used in this application - WebSockets are used receive-only)
    const sendRunStatus = (data) => runStatusWS.current?.send(data);
    const sendHistory = (data) => historyWS.current?.send(data);
    // Pub/sub subscription functions for advanced use cases
    // Most consumers just read runStatus/history from context without subscribing
    // Now returns unsubscribe function for convenient cleanup
    const subscribeToRunStatus = (cb) => {
        return runStatusWS.current?.subscribe(cb) ?? (() => { });
    };
    const subscribeToHistory = (cb) => {
        return historyWS.current?.subscribe(cb) ?? (() => { });
    };
    return ((0,jsx_runtime.jsxs)(WebSocketContext.Provider, { value: {
            runStatus,
            history,
            sendRunStatus,
            sendHistory,
            subscribeToRunStatus,
            subscribeToHistory,
        }, children: [showConnectionErrorDialog && ((0,jsx_runtime.jsx)(BasicDialog, { open: showConnectionErrorDialog, title: "Connection lost", description: (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: ["Connection with the server has been lost.", (0,jsx_runtime.jsx)("br", {}), "Retrying for ", formatElapsed(connectionLostSeconds), "..."] }) })), children] }));
};

;// ./src/modules/GraphLibrary/components/GraphStatus/context/GraphStatusContext.tsx





const GraphContext = react.createContext({
    allMeasurements: undefined,
    setAllMeasurements: helpers,
    // selectedMeasurement: undefined,
    // setSelectedMeasurement: noop,
    trackLatest: false,
    setTrackLatest: helpers,
    workflowGraphElements: undefined,
    setWorkflowGraphElements: helpers,
    fetchAllMeasurements: async () => undefined,
});
const useGraphStatusContext = () => (0,react.useContext)(GraphContext);
const GraphStatusContextProvider = (props) => {
    const { history } = useWebSocketData();
    const [allMeasurements, setAllMeasurements] = (0,react.useState)(undefined);
    const [workflowGraphElements, setWorkflowGraphElements] = (0,react.useState)(undefined);
    const [trackLatest, setTrackLatest] = (0,react.useState)(true);
    const fetchAllMeasurements = async () => {
        const response = await GraphLibraryApi.fetchExecutionHistory();
        if (response.isOk) {
            if (response.result && response.result.items) {
                setAllMeasurements(response.result.items);
                return response.result.items;
            }
        }
        else if (response.error) {
            console.log(response.error);
        }
        return [];
    };
    (0,react.useEffect)(() => {
        fetchAllMeasurements();
    }, []);
    (0,react.useEffect)(() => {
        if (history) {
            setAllMeasurements(history.items);
        }
    }, [history]);
    return ((0,jsx_runtime.jsx)(GraphContext.Provider, { value: {
            allMeasurements,
            setAllMeasurements,
            trackLatest,
            setTrackLatest,
            workflowGraphElements,
            setWorkflowGraphElements,
            fetchAllMeasurements,
        }, children: props.children }));
};

;// ./src/modules/common/context/SelectionContext.tsx



const SelectionContext = react.createContext({
    selectedItemName: undefined,
    setSelectedItemName: helpers,
});
const useSelectionContext = () => (0,react.useContext)(SelectionContext);
function SelectionContextProvider(props) {
    const [selectedItemName, setSelectedItemName] = (0,react.useState)(undefined);
    return ((0,jsx_runtime.jsx)(SelectionContext.Provider, { value: {
            selectedItemName,
            setSelectedItemName,
        }, children: props.children }));
}

;// ./src/modules/GraphLibrary/context/GraphContext.tsx





const GraphContext_GraphContext = react.createContext({
    allGraphs: undefined,
    setAllGraphs: helpers,
    selectedWorkflow: undefined,
    setSelectedWorkflow: helpers,
    selectedWorkflowName: undefined,
    setSelectedWorkflowName: helpers,
    selectedNodeNameInWorkflow: undefined,
    setSelectedNodeNameInWorkflow: helpers,
    workflowGraphElements: undefined,
    setWorkflowGraphElements: helpers,
    lastRunInfo: undefined,
    setLastRunInfo: helpers,
    fetchAllCalibrationGraphs: helpers,
    fetchWorkflowGraph: helpers,
    isRescanningGraphs: false,
});
const useGraphContext = () => (0,react.useContext)(GraphContext_GraphContext);
const GraphContextProvider = (props) => {
    const { runStatus } = useWebSocketData();
    const [allGraphs, setAllGraphs] = (0,react.useState)(undefined);
    const [selectedWorkflow, setSelectedWorkflow] = (0,react.useState)(undefined);
    const [selectedWorkflowName, setSelectedWorkflowName] = (0,react.useState)(undefined);
    const [selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow] = (0,react.useState)(undefined);
    const [workflowGraphElements, setWorkflowGraphElements] = (0,react.useState)(undefined);
    const [lastRunInfo, setLastRunInfo] = (0,react.useState)(undefined);
    const [isRescanningGraphs, setIsRescanningGraphs] = (0,react.useState)(false);
    const updateObject = (obj) => {
        const modifyParameters = (parameters, isNodeLevel = false) => {
            if (parameters?.targets_name) {
                if (isNodeLevel) {
                    const targetKey = parameters.targets_name.default?.toString();
                    if (targetKey && parameters.targets_name.default) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { targets_name, [targetKey]: _, ...rest } = parameters;
                        return rest;
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { targets_name, ...rest } = parameters;
                    return rest;
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { targets_name, ...rest } = parameters;
                    return rest;
                }
            }
            return parameters;
        };
        obj.parameters = modifyParameters(obj.parameters, false);
        if (obj.nodes) {
            Object.keys(obj.nodes).forEach((nodeKey) => {
                const node = obj.nodes[nodeKey];
                node.parameters = modifyParameters(node.parameters, true);
            });
        }
        return obj;
    };
    const updateAllGraphs = (allFetchedGraphs) => {
        const updatedGraphs = {};
        Object.entries(allFetchedGraphs).forEach(([key, graph]) => {
            updatedGraphs[key] = updateObject(graph);
        });
        return updatedGraphs;
    };
    const fetchAllCalibrationGraphs = async (rescan = false) => {
        setIsRescanningGraphs(true);
        const response = await GraphLibraryApi.fetchAllGraphs(rescan);
        if (response.isOk) {
            const allFetchedGraphs = response.result;
            const updatedGraphs = updateAllGraphs(allFetchedGraphs);
            setAllGraphs(updatedGraphs);
        }
        else if (response.error) {
            console.log(response.error);
        }
        setIsRescanningGraphs(false);
    };
    const fetchWorkflowGraph = async (nodeName) => {
        const response = await GraphLibraryApi.fetchGraph(nodeName);
        if (response.isOk) {
            setWorkflowGraphElements(response.result);
        }
        else if (response.error) {
            console.log(response.error);
        }
    };
    (0,react.useEffect)(() => {
        if (selectedWorkflowName) {
            fetchWorkflowGraph(selectedWorkflowName);
            setSelectedWorkflow(allGraphs?.[selectedWorkflowName]);
        }
        else if (lastRunInfo?.workflowName) {
            fetchWorkflowGraph(lastRunInfo?.workflowName);
        }
    }, [lastRunInfo, selectedWorkflowName]);
    (0,react.useEffect)(() => {
        if (runStatus && runStatus.graph && runStatus.node) {
            setLastRunInfo({
                ...lastRunInfo,
                active: runStatus.is_running,
                workflowName: runStatus.graph.name,
                activeNodeName: runStatus.node.name ?? "",
                nodesCompleted: runStatus.graph.finished_nodes,
                nodesTotal: runStatus.graph.total_nodes,
                runDuration: runStatus.graph.run_duration,
                error: runStatus.graph.error,
            });
        }
    }, [runStatus]);
    (0,react.useEffect)(() => {
        fetchAllCalibrationGraphs();
    }, []);
    return ((0,jsx_runtime.jsx)(GraphContext_GraphContext.Provider, { value: {
            allGraphs,
            setAllGraphs,
            selectedWorkflow,
            setSelectedWorkflow,
            selectedWorkflowName,
            setSelectedWorkflowName,
            selectedNodeNameInWorkflow,
            setSelectedNodeNameInWorkflow,
            workflowGraphElements,
            setWorkflowGraphElements,
            lastRunInfo,
            setLastRunInfo,
            fetchAllCalibrationGraphs,
            fetchWorkflowGraph,
            isRescanningGraphs,
        }, children: props.children }));
};

;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementElementInfoSection/MeasurementElementInfoSection.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var MeasurementElementInfoSection_module = ({"sectionTitle":"MeasurementElementInfoSection-module__sectionTitle","outcomesTitle":"MeasurementElementInfoSection-module__outcomesTitle","infoContent":"MeasurementElementInfoSection-module__infoContent","infoItem":"MeasurementElementInfoSection-module__infoItem","label":"MeasurementElementInfoSection-module__label","info":"MeasurementElementInfoSection-module__info","value":"MeasurementElementInfoSection-module__value","outcomes":"MeasurementElementInfoSection-module__outcomes","outcomeContainer":"MeasurementElementInfoSection-module__outcomeContainer","outcomeBubble":"MeasurementElementInfoSection-module__outcomeBubble","success":"MeasurementElementInfoSection-module__success","failure":"MeasurementElementInfoSection-module__failure","qubitLabel":"MeasurementElementInfoSection-module__qubitLabel","outcomeStatus":"MeasurementElementInfoSection-module__outcomeStatus"});
;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementElementInfoSection/MeasurementElementInfoSection.tsx




const MeasurementElementStatusInfoAndParameters = ({ title, data, isInfoSection = false, filterEmpty = false, className, evenlySpaced = false, }) => {
    const filteredData = filterEmpty
        ? Object.entries(data ?? {}).filter(([, value]) => value != null && value !== "")
        : Object.entries(data ?? {});
    if (filteredData.length === 0)
        return null;
    return ((0,jsx_runtime.jsxs)("div", { className: className, children: [title && (0,jsx_runtime.jsx)("div", { className: MeasurementElementInfoSection_module.sectionTitle, children: title }), (0,jsx_runtime.jsx)("div", { className: MeasurementElementInfoSection_module.infoContent, style: evenlySpaced ? { height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-evenly" } : {}, children: filteredData.map(([key, value]) => ((0,jsx_runtime.jsxs)("div", { className: MeasurementElementInfoSection_module.infoItem, children: [(0,jsx_runtime.jsxs)("div", { className: classNames(MeasurementElementInfoSection_module.label, isInfoSection && MeasurementElementInfoSection_module.info), children: [key, ":"] }), (0,jsx_runtime.jsx)("div", { className: MeasurementElementInfoSection_module.value, children: Array.isArray(value) ? value.join(", ") : value?.toString() || "N/A" })] }, key))) })] }));
};
const MeasurementElementOutcomes = ({ outcomes }) => {
    if (!outcomes || Object.keys(outcomes).length === 0)
        return null;
    return ((0,jsx_runtime.jsxs)("div", { className: MeasurementElementInfoSection_module.outcomes, children: [(0,jsx_runtime.jsx)("div", { className: MeasurementElementInfoSection_module.outcomesTitle, children: "Outcomes" }), (0,jsx_runtime.jsx)("div", { className: MeasurementElementInfoSection_module.outcomeContainer, children: Object.entries(outcomes).map(([qubit, result]) => {
                    const isSuccess = result === "successful";
                    return ((0,jsx_runtime.jsxs)("span", { className: classNames(MeasurementElementInfoSection_module.outcomeBubble, isSuccess ? MeasurementElementInfoSection_module.success : MeasurementElementInfoSection_module.failure), children: [(0,jsx_runtime.jsxs)("span", { className: classNames(MeasurementElementInfoSection_module.qubitLabel, isSuccess ? MeasurementElementInfoSection_module.success : MeasurementElementInfoSection_module.failure), children: [qubit || "N/A", " "] }), (0,jsx_runtime.jsx)("span", { className: MeasurementElementInfoSection_module.outcomeStatus, children: result })] }, qubit));
                }) })] }));
};

// EXTERNAL MODULE: ./node_modules/@mui/material/Tooltip/Tooltip.js + 6 modules
var Tooltip = __webpack_require__(4433);
;// ./src/ui-lib/Icons/InfoIcon.tsx



const InfoIcon = ({ width = 18, height = 18, color = ACCENT_COLOR_LIGHT, }) => ((0,jsx_runtime.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 20 20", fill: "none", children: [(0,jsx_runtime.jsx)("circle", { cx: "10", cy: "10", r: "9", stroke: color, strokeWidth: "1" }), (0,jsx_runtime.jsx)("circle", { cx: "10", cy: "6", r: "1.2", fill: color }), (0,jsx_runtime.jsx)("path", { d: "M10 9.5V14", stroke: color, strokeWidth: "2", strokeLinecap: "round" })] }));

;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementElement/MeasurementElement.tsx











// Formats a date-time string into a more readable format.
const formatDateTime = (dateTimeString) => {
    const [date, time] = dateTimeString.split("T");
    const timeWithoutZone = time.split("+")[0].split("Z")[0];
    const timeWithoutMilliseconds = timeWithoutZone.split(".")[0];
    return `${date} ${timeWithoutMilliseconds}`;
};
const MeasurementElement = ({ element, dataMeasurementId }) => {
    const { selectedItemName, setSelectedItemName } = useSelectionContext();
    const { selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow } = useGraphContext();
    // const { fetchResultsAndDiffData } = useGraphStatusContext();
    const { fetchOneSnapshot, setResult, setDiffData, setSelectedSnapshotId, setClickedForSnapshotSelection } = useSnapshotsContext();
    const { trackLatest, setTrackLatest } = useGraphStatusContext();
    // Check if the current measurement is selected in either the list or Cytoscape graph
    const measurementSelected = selectedItemName && (selectedItemName === element.id?.toString() || selectedItemName === element.metadata?.name);
    const cytoscapeNodeSelected = selectedNodeNameInWorkflow &&
        (selectedNodeNameInWorkflow === element.id?.toString() || selectedNodeNameInWorkflow === element.metadata?.name);
    const getDotStyle = () => {
        if (!element.data?.outcomes || Object.keys(element.data?.outcomes).length === 0) {
            return { backgroundColor: "#40a8f5" }; // Default blue color if no outcomes
        }
        const outcomes = Object.values(element.data?.outcomes);
        const total = outcomes.length;
        const successes = outcomes.filter((status) => status === "successful").length;
        const successPercentage = total !== 0 ? (successes / total) * 100 : 0;
        return {
            background: `conic-gradient(rgb(40, 167, 69, 0.9) ${successPercentage}%, rgb(220, 53, 69, 0.9) 0)`,
        };
    };
    const handleOnClick = () => {
        if (selectedItemName !== element.metadata?.name && trackLatest) {
            setTrackLatest(false);
        }
        setSelectedItemName(element.metadata?.name);
        setSelectedNodeNameInWorkflow(element.metadata?.name);
        if (element.id) {
            setSelectedSnapshotId(element.id);
            setClickedForSnapshotSelection(true);
            fetchOneSnapshot(element.id);
        }
        else {
            setResult({});
            setDiffData({});
        }
    };
    return ((0,jsx_runtime.jsxs)("div", { "data-measurement-id": dataMeasurementId, className: classNames(MeasurementElement_module.rowWrapper), children: [(0,jsx_runtime.jsxs)("div", { className: MeasurementElement_module.row, onClick: handleOnClick, children: [(0,jsx_runtime.jsx)("div", { className: MeasurementElement_module.dot, style: getDotStyle() }), (0,jsx_runtime.jsxs)("div", { className: MeasurementElement_module.titleOrName, children: ["#", element.id, " ", element.metadata?.name] }), (0,jsx_runtime.jsx)("div", { className: MeasurementElement_module.descriptionWrapper, children: element.metadata?.description && ((0,jsx_runtime.jsx)(Tooltip/* default */.A, { title: (0,jsx_runtime.jsx)("div", { className: MeasurementElement_module.descriptionTooltip, children: element.metadata?.description ?? "" }), placement: "left-start", arrow: true, children: (0,jsx_runtime.jsx)("span", { children: (0,jsx_runtime.jsx)(InfoIcon, {}) }) })) })] }), (measurementSelected || cytoscapeNodeSelected) && ((0,jsx_runtime.jsxs)("div", { className: MeasurementElement_module.expandedContent, children: [(0,jsx_runtime.jsxs)("div", { className: MeasurementElement_module.runInfoAndParameters, children: [(0,jsx_runtime.jsx)(MeasurementElementStatusInfoAndParameters, { data: {
                                    Status: element.metadata?.status || "Unknown",
                                    ...(element.metadata?.run_start && { "Run start": formatDateTime(element.metadata?.run_start) }),
                                    ...(element.metadata?.run_end && { "Run end": formatDateTime(element.metadata?.run_end) }),
                                    ...(element.metadata?.run_duration && { "Run duration": `${element.metadata?.run_duration}s` }),
                                }, isInfoSection: true, className: MeasurementElement_module.runInfo, evenlySpaced: true }), (0,jsx_runtime.jsx)(MeasurementElementStatusInfoAndParameters, { title: "Parameters", data: element.data?.parameters || {}, filterEmpty: true, className: MeasurementElement_module.parameters })] }), (0,jsx_runtime.jsx)(MeasurementElementOutcomes, { outcomes: element.data?.outcomes })] }))] }));
};

;// ./src/modules/Nodes/context/NodesContext.tsx







const NodesContext = react.createContext({
    submitNodeResponseError: undefined,
    setSubmitNodeResponseError: helpers,
    runningNode: undefined,
    runningNodeInfo: undefined,
    setRunningNode: helpers,
    setRunningNodeInfo: helpers,
    allNodes: undefined,
    setAllNodes: helpers,
    isNodeRunning: false,
    setIsNodeRunning: helpers,
    results: undefined,
    setResults: helpers,
    fetchAllNodes: helpers,
    isAllStatusesUpdated: false,
    setIsAllStatusesUpdated: helpers,
    updateAllButtonPressed: false,
    setUpdateAllButtonPressed: helpers,
    runStatus: null,
    isRescanningNodes: false,
});
const useNodesContext = () => (0,react.useContext)(NodesContext);
const NodesContextProvider = ({ children }) => {
    const { runStatus } = useWebSocketData();
    const [allNodes, setAllNodes] = (0,react.useState)(undefined);
    const [runningNode, setRunningNode] = (0,react.useState)(undefined);
    const [runningNodeInfo, setRunningNodeInfo] = (0,react.useState)(undefined);
    const [isNodeRunning, setIsNodeRunning] = (0,react.useState)(false);
    const [results, setResults] = (0,react.useState)(undefined);
    const [submitNodeResponseError, setSubmitNodeResponseError] = (0,react.useState)(undefined);
    const [isAllStatusesUpdated, setIsAllStatusesUpdated] = (0,react.useState)(false);
    const [updateAllButtonPressed, setUpdateAllButtonPressed] = (0,react.useState)(false);
    const [isRescanningNodes, setIsRescanningNodes] = (0,react.useState)(false);
    const fetchAllNodes = async (rescan = false) => {
        setAllNodes(undefined);
        setIsRescanningNodes(true);
        const response = await NodesApi.fetchAllNodes(rescan);
        if (response.isOk) {
            setAllNodes(response.result);
        }
        else if (response.error) {
            console.log(response.error);
        }
        setIsRescanningNodes(false);
    };
    function parseDateString(dateString) {
        const [datePart, timePart] = dateString.split(" ");
        const [year, month, day] = datePart.split("/").map(Number);
        const [hours, minutes, seconds] = timePart.split(":").map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    const formatString = (str) => {
        return str
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };
    const fetchNodeResults = async () => {
        const lastRunResponse = await NodesApi.fetchLastRunInfo();
        if (lastRunResponse && lastRunResponse.isOk) {
            const lastRunResponseResult = lastRunResponse.result;
            if (lastRunResponseResult && lastRunResponseResult.status !== "error") {
                const idx = lastRunResponseResult.idx.toString();
                if (lastRunResponseResult.idx) {
                    const snapshotResponse = await SnapshotsApi.fetchSnapshotResult(idx);
                    if (snapshotResponse && snapshotResponse.isOk) {
                        const state_updates = {};
                        if (lastRunResponseResult.state_updates) {
                            Object.entries(lastRunResponseResult.state_updates).forEach(([key, graph]) => {
                                state_updates[key] = { ...graph, stateUpdated: false };
                            });
                        }
                        if (runningNodeInfo && runningNodeInfo.timestampOfRun) {
                            const startDateAndTime = parseDateString(runningNodeInfo?.timestampOfRun);
                            const now = new Date();
                            const diffInMs = now.getTime() - startDateAndTime.getTime();
                            const diffInSeconds = Math.floor(diffInMs / 1000);
                            setRunningNodeInfo({
                                ...runningNodeInfo,
                                runDuration: diffInSeconds.toFixed(2),
                                status: lastRunResponseResult.status,
                                idx: lastRunResponseResult.idx.toString(),
                                state_updates,
                            });
                        }
                        else if (!runningNodeInfo?.timestampOfRun) {
                            setRunningNodeInfo({
                                ...runningNodeInfo,
                                lastRunNodeName: lastRunResponseResult.name,
                                status: lastRunResponseResult.status,
                                idx: lastRunResponseResult.idx.toString(),
                                state_updates,
                            });
                            let parameters = {};
                            Object.entries(lastRunResponseResult.passed_parameters ?? {}).forEach(([key, value]) => {
                                parameters = {
                                    ...parameters,
                                    [key]: {
                                        default: value,
                                        title: formatString(key),
                                        type: "string",
                                    },
                                };
                            });
                            setRunningNode({
                                ...runningNode,
                                parameters,
                                // parameters: { sadada: { dadasda: "dadasda" } },
                            });
                        }
                        setResults(snapshotResponse.result);
                    }
                    else {
                        console.log("snapshotResponse error", snapshotResponse.error);
                    }
                }
                else {
                    console.log("last run idx is falsy = ", lastRunResponseResult.idx);
                }
            }
            else {
                const error = lastRunResponseResult && lastRunResponseResult.error ? lastRunResponseResult.error : undefined;
                if (!lastRunResponseResult) {
                    setRunningNodeInfo({
                        ...runningNodeInfo,
                        status: "pending",
                        error,
                    });
                }
                else if (lastRunResponseResult && lastRunResponseResult.status === "error") {
                    let parameters = {};
                    Object.entries(lastRunResponseResult.run_result?.parameters ?? {}).forEach(([key, value]) => {
                        parameters = {
                            ...parameters,
                            [key]: {
                                default: value,
                                title: formatString(key),
                                type: "string",
                            },
                        };
                    });
                    setRunningNode({
                        ...runningNode,
                        parameters,
                        // parameters: { sadada: { dadasda: "dadasda" } },
                    });
                    setRunningNodeInfo({
                        ...runningNodeInfo,
                        status: "error",
                        timestampOfRun: formatDateTime(lastRunResponseResult.run_result?.created_at ?? ""),
                        runDuration: lastRunResponseResult.run_result?.run_duration?.toString(),
                        state_updates: lastRunResponseResult.state_updates,
                        idx: lastRunResponseResult.idx.toString(),
                        // parameters: lastRunResponseResult.run_result?.parameters,
                        error,
                    });
                }
                console.log("last run status was error");
            }
        }
        else {
            console.log("lastRunResponse was ", lastRunResponse);
        }
    };
    (0,react.useEffect)(() => {
        if (!isNodeRunning) {
            fetchNodeResults();
            if (runningNodeInfo?.status === "running") {
                setRunningNodeInfo({
                    ...runningNodeInfo,
                    status: "finished",
                });
            }
        }
    }, [isNodeRunning]);
    (0,react.useEffect)(() => {
        if (runStatus && runStatus.runnable_type === "node") {
            setIsNodeRunning(runStatus.is_running);
        }
    }, [runStatus]);
    return ((0,jsx_runtime.jsx)(NodesContext.Provider, { value: {
            runningNode,
            setRunningNode,
            runningNodeInfo,
            setRunningNodeInfo,
            submitNodeResponseError,
            setSubmitNodeResponseError,
            allNodes,
            setAllNodes,
            isNodeRunning,
            setIsNodeRunning,
            results,
            setResults,
            fetchAllNodes,
            isAllStatusesUpdated,
            setIsAllStatusesUpdated,
            updateAllButtonPressed,
            setUpdateAllButtonPressed,
            runStatus,
            isRescanningNodes,
        }, children: children }));
};

;// ./src/ui-lib/loader/Loader.tsx


const yellowStates = [
    "M44.0676 51H29.9324C27.8068 51 26 49.1111 26 46.8889V45.1111C26 42.8889 27.8068 41 29.9324 41H44.0676C46.1932 41 48 42.8889 48 45.1111V46.8889C48 49.1111 46.1932 51 44.0676 51Z",
    "M51.9324 51H66.0676C68.1932 51 70 49.1111 70 46.8889V45.1111C70 42.8889 68.1932 41 66.0676 41H51.9324C49.8068 41 48 42.8889 48 45.1111V46.8889C48 49.1111 49.8068 51 51.9324 51Z",
    "M44.0676 51H29.9324C27.8068 51 26 49.1111 26 46.8889V45.1111C26 42.8889 27.8068 41 29.9324 41H44.0676C46.1932 41 48 42.8889 48 45.1111V46.8889C48 49.1111 46.1932 51 44.0676 51Z",
    "M51.9324 51H66.0676C68.1932 51 70 49.1111 70 46.8889V45.1111C70 42.8889 68.1932 41 66.0676 41H51.9324C49.8068 41 48 42.8889 48 45.1111V46.8889C48 49.1111 49.8068 51 51.9324 51Z",
    "M44.0676 51H29.9324C27.8068 51 26 49.1111 26 46.8889V45.1111C26 42.8889 27.8068 41 29.9324 41H44.0676C46.1932 41 48 42.8889 48 45.1111V46.8889C48 49.1111 46.1932 51 44.0676 51Z",
    "M44.0676 51H29.9324C27.8068 51 26 49.1111 26 46.8889V45.1111C26 42.8889 27.8068 41 29.9324 41H44.0676C46.1932 41 48 42.8889 48 45.1111V46.8889C48 49.1111 46.1932 51 44.0676 51Z",
    "M44.0676 51H29.9324C27.8068 51 26 49.1111 26 46.8889V45.1111C26 42.8889 27.8068 41 29.9324 41H44.0676C46.1932 41 48 42.8889 48 45.1111V46.8889C48 49.1111 46.1932 51 44.0676 51Z",
    "M44.0676 51H29.9324C27.8068 51 26 49.1111 26 46.8889V45.1111C26 42.8889 27.8068 41 29.9324 41H44.0676C46.1932 41 48 42.8889 48 45.1111V46.8889C48 49.1111 46.1932 51 44.0676 51Z",
    "M44.0676 51H29.9324C27.8068 51 26 49.1111 26 46.8889V45.1111C26 42.8889 27.8068 41 29.9324 41H44.0676C46.1932 41 48 42.8889 48 45.1111V46.8889C48 49.1111 46.1932 51 44.0676 51Z",
];
const greenStates = [
    "M 26 36 h 0 C 26 36 26 32 26 32 s -0 -5 -0 -5 H 26 C 26 27 26 27 26 27 v 6.111 c 0 1 0 1.778 0 1.778 z",
    "M 26 36 h 0 C 26 36 26 32 26 32 s -0 -5 -0 -5 H 26 C 26 27 26 27 26 27 v 6.111 c 0 1 0 1.778 0 1.778 z",
    "M 26 36 h 0 C 26 36 26 32 26 32 s -0 -5 -0 -5 H 26 C 26 27 26 27 26 27 v 6.111 c 0 1 0 1.778 0 1.778 z",
    "M 26 36 h 0 C 26 36 26 32 26 32 s -0 -5 -0 -5 H 26 C 26 27 26 27 26 27 v 6.111 c 0 1 0 1.778 0 1.778 z",
    "M 26 36 h 0 C 26 36 26 32 26 32 s -0 -5 -0 -5 H 26 C 26 27 26 27 26 27 v 6.111 c 0 1 0 1.778 0 1.778 z",
    "M27.571 36h26.715C56.905 36 59 33.778 59 31s-2.095-5-4.714-5H27.99C26.944 26 26 27 26 28.111v6.111c0 1 .733 1.778 1.571 1.778z",
    "M27.571 36h26.715C56.905 36 59 33.778 59 31s-2.095-5-4.714-5H27.99C26.944 26 26 27 26 28.111v6.111c0 1 .733 1.778 1.571 1.778z",
    "M27.571 36h26.715C56.905 36 59 33.778 59 31s-2.095-5-4.714-5H27.99C26.944 26 26 27 26 28.111v6.111c0 1 .733 1.778 1.571 1.778z",
    "M 26 36 h 0 C 26 36 26 32 26 32 s -0 -5 -0 -5 H 26 C 26 27 26 27 26 27 v 6.111 c 0 1 0 1.778 0 1.778 z",
];
const ANIMATE_TIME = "6s";
function Icon() {
    return ((0,jsx_runtime.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "99", height: "94", fill: "none", children: [(0,jsx_runtime.jsx)("path", { fill: "#2CCBE5", d: "M69.003 35C71.183 35 73 33.182 73 31s-1.817-4-3.997-4c-2.18 0-3.997 1.818-3.997 4-.121 2.182 1.695 4 3.997 4z" }), (0,jsx_runtime.jsx)("path", { fill: "#00D59A", d: "M27.571 36h26.715C56.905 36 59 33.778 59 31s-2.095-5-4.714-5H27.99C26.944 26 26 27 26 28.111v6.111c0 1 .733 1.778 1.571 1.778z", children: (0,jsx_runtime.jsx)("animate", { attributeName: "d", attributeType: "XML", values: greenStates.join(";"), dur: ANIMATE_TIME, repeatCount: "indefinite" }) }), (0,jsx_runtime.jsx)("g", { children: (0,jsx_runtime.jsx)("path", { fill: "#FF2463", "transform-origin": "26 58", d: "M26 65.202v-7.146C26 56.88 26.942 56 28.198 56h30.766c1.151 0 1.465 1.273.314 1.566L27.36 65.985c-.732.098-1.36-.294-1.36-.783z", children: (0,jsx_runtime.jsx)("animateTransform", { attributeName: "transform", type: "scale", values: "0;0;0;0;0;0;1;0;0", dur: ANIMATE_TIME, repeatCount: "indefinite" }) }) }), (0,jsx_runtime.jsx)("path", { fill: "#FFDB2C", d: "M44.068 51H29.932C27.807 51 26 49.111 26 46.889V45.11c0-2.22 1.807-4.11 3.932-4.11h14.136C46.193 41 48 42.889 48 45.111v1.778C48 49.11 46.193 51 44.068 51z", children: (0,jsx_runtime.jsx)("animate", { attributeName: "d", attributeType: "XML", values: yellowStates.join(";"), dur: ANIMATE_TIME, repeatCount: "indefinite" }) })] }));
}
/* harmony default export */ var Loader = (Icon);

;// ./src/ui-lib/loader/LoaderPage.tsx




function LoaderPage({ text }) {
    return ((0,jsx_runtime.jsxs)("div", { className: LoaderPage_module.container, children: [(0,jsx_runtime.jsx)(Loader, {}), text && (0,jsx_runtime.jsx)("div", { className: LoaderPage_module.text, children: text })] }));
}

;// ./src/modules/TopbarMenu/styles/TitleBarMenu.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var TitleBarMenu_module = ({"wrapper":"TitleBarMenu-module__wrapper","menuCardsWrapper":"TitleBarMenu-module__menuCardsWrapper","createProjectWrapper":"TitleBarMenu-module__createProjectWrapper","createProjectButton":"TitleBarMenu-module__createProjectButton","createProjectPanelWrapper":"TitleBarMenu-module__createProjectPanelWrapper"});
;// ./src/ui-lib/Icons/NewProjectButtonIcon.tsx


const NewProjectButtonIcon = ({ width = 160, height = 38, }) => {
    return ((0,jsx_runtime.jsxs)("svg", { width: width, height: height, viewBox: "0 0 160 38", fill: "none", children: [(0,jsx_runtime.jsx)("rect", { width: "160", height: "38", rx: "19", fill: "rgba(0, 147, 128, 0.6)" }), (0,jsx_runtime.jsx)("path", { d: "M26.583 17.917H32V20.083H26.583V25.5H24.417V20.083H19V17.917H24.417V12.5H26.583V17.917Z", fill: "white" }), (0,jsx_runtime.jsx)("text", { x: "40", y: "24", fill: "white", fontSize: "15", fontWeight: "bold", fontFamily: "Arial, sans-serif", children: "Create Project" })] }));
};
/* harmony default export */ var Icons_NewProjectButtonIcon = (NewProjectButtonIcon);

;// ./src/modules/Project/CreateNewProjectForm/CreateNewProjectForm.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var CreateNewProjectForm_module = ({"createProjectPanel":"CreateNewProjectForm-module__createProjectPanel","header":"CreateNewProjectForm-module__header","error":"CreateNewProjectForm-module__error","errorMessage":"CreateNewProjectForm-module__errorMessage","actions":"CreateNewProjectForm-module__actions","button":"CreateNewProjectForm-module__button","create":"CreateNewProjectForm-module__create","cancel":"CreateNewProjectForm-module__cancel"});
;// ./src/common/ui-components/common/Input/ProjectFormField.tsx



// eslint-disable-next-line css-modules/no-unused-class

const ProjectFormField = ({ id, label, placeholder, value, onChange, type = "text", error }) => {
    return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)("label", { htmlFor: id, className: error ? CreateNewProjectForm_module.error : undefined, children: label }), (0,jsx_runtime.jsx)(Input_InputField, { id: id, type: type, placeholder: placeholder, value: value, onChange: onChange, error: error })] }));
};
/* harmony default export */ var Input_ProjectFormField = (ProjectFormField);

;// ./src/ui-lib/hooks/useProjectFormValidation.ts

const useProjectFormValidation = () => {
    const validatePath = (0,react.useCallback)((value, fieldName) => {
        if (value.trim() === "")
            return `${fieldName} is required`;
        const trimmedValue = value.trim();
        if (!trimmedValue.startsWith("/") && !trimmedValue.startsWith("./") && !trimmedValue.startsWith("../")) {
            return `${fieldName} should be absolute or relative (starting with /, ./, or ../)`;
        }
        return undefined;
    }, []);
    const validateProjectName = (0,react.useCallback)((value) => {
        if (value.trim() === "")
            return "Project name is required";
        const trimmedValue = value.trim();
        if (trimmedValue.length < 2) {
            return "Project name must be at least 2 characters long";
        }
        if (trimmedValue.length > 50) {
            return "Project name must be no more than 50 characters long";
        }
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(trimmedValue)) {
            return "Project name cannot contain invalid characters: < > : \" / \\ | ? *";
        }
        for (let i = 0; i < trimmedValue.length; i++) {
            const charCode = trimmedValue.charCodeAt(i);
            if (charCode < 32) {
                return "Project name cannot contain control characters";
            }
        }
        const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9]|\.|\.\.)$/i;
        if (reservedNames.test(trimmedValue)) {
            return "Project name cannot be a reserved system name";
        }
        if (trimmedValue.startsWith(" ") || trimmedValue.endsWith(" ") ||
            trimmedValue.startsWith(".") || trimmedValue.endsWith(".")) {
            return "Project name cannot start or end with spaces or dots";
        }
        if (/\s{2,}/.test(trimmedValue) || /\.{2,}/.test(trimmedValue)) {
            return "Project name cannot contain consecutive spaces or dots";
        }
        const validPattern = /^[a-zA-Z0-9_\-\s.]+$/;
        if (!validPattern.test(trimmedValue)) {
            return "Project name can only contain letters, numbers, spaces, hyphens, underscores, and dots";
        }
        return undefined;
    }, []);
    return {
        validatePath,
        validateProjectName
    };
};

;// ./src/modules/Project/CreateNewProjectForm/CreateNewProjectForm.tsx


// eslint-disable-next-line css-modules/no-unused-class





const initialFormData = {
    projectName: "",
};
const CreateNewProjectForm = ({ closeNewProjectForm }) => {
    const [formData, setFormData] = (0,react.useState)(initialFormData);
    const [errors, setErrors] = (0,react.useState)({});
    const [isSubmitting, setIsSubmitting] = (0,react.useState)(false);
    const { validatePath, validateProjectName } = useProjectFormValidation();
    const { allProjects, setAllProjects } = useProjectContext();
    const validateField = (0,react.useCallback)((field, value) => {
        let error;
        if (field === "projectName") {
            error = validateProjectName(value);
        }
        else if (value.trim()) {
            const labelMap = {
                projectName: "Project name",
                dataPath: "Data path",
                quamPath: "QUAM path",
                calibrationPath: "Calibration path",
            };
            error = validatePath(value, labelMap[field]);
        }
        else {
            error = undefined;
        }
        setErrors((prev) => ({ ...prev, [field]: error }));
        return !error;
    }, [validatePath, validateProjectName]);
    const isFormValid = (0,react.useCallback)(() => {
        return !validateProjectName(formData.projectName);
    }, [formData.projectName, validateProjectName]);
    const handleCloseNewProjectForm = (0,react.useCallback)(() => {
        setFormData(initialFormData);
        setErrors({});
        closeNewProjectForm();
    }, [closeNewProjectForm]);
    const checkProjectNameExists = (0,react.useCallback)((projectName) => allProjects.some((project) => project.name === projectName), [allProjects]);
    const handleSubmit = (0,react.useCallback)(async (event) => {
        event.preventDefault();
        if (!isFormValid())
            return;
        setIsSubmitting(true);
        try {
            if (checkProjectNameExists(formData.projectName)) {
                setErrors((prev) => ({
                    ...prev,
                    projectName: "A project with this name already exists",
                }));
                return;
            }
            const { isOk, error, result } = await ProjectViewApi.createProject(formData);
            if (isOk) {
                console.log("Project created successfully:", result);
                if (result) {
                    setAllProjects([result, ...allProjects]);
                }
                handleCloseNewProjectForm();
            }
            else {
                console.error("Failed to create project:", error);
            }
        }
        catch (err) {
            console.error("Error creating project:", err);
        }
        finally {
            setIsSubmitting(false);
        }
    }, [formData, isFormValid, checkProjectNameExists, handleCloseNewProjectForm]);
    const createChangeHandler = (0,react.useCallback)((field) => (val) => {
        setFormData((prev) => ({ ...prev, [field]: val }));
        setTimeout(() => validateField(field, val), 300);
    }, [validateField]);
    const handleProjectNameChange = createChangeHandler("projectName");
    const handleDataPathChange = createChangeHandler("dataPath");
    const handleQuamPathChange = createChangeHandler("quamPath");
    const handleCalibrationPathChange = createChangeHandler("calibrationPath");
    return ((0,jsx_runtime.jsxs)("div", { className: CreateNewProjectForm_module.createProjectPanel, children: [(0,jsx_runtime.jsx)("h3", { className: CreateNewProjectForm_module.header, children: "Create New Project" }), (0,jsx_runtime.jsx)(Input_ProjectFormField, { id: "project_name", label: "Project name*", placeholder: "Enter project name", value: formData.projectName, onChange: handleProjectNameChange, error: errors.projectName }), (0,jsx_runtime.jsx)(Input_ProjectFormField, { id: "data_path", label: "Data path", placeholder: "Enter data path", value: formData.dataPath ?? "", onChange: handleDataPathChange, error: errors.dataPath }), (0,jsx_runtime.jsx)(Input_ProjectFormField, { id: "quam_state_path", label: "QUAM state path", placeholder: "Enter QUAM path", value: formData.quamPath ?? "", onChange: handleQuamPathChange, error: errors.quamPath }), (0,jsx_runtime.jsx)(Input_ProjectFormField, { id: "calibration_library_path", label: "Calibration library path", placeholder: "Enter calibration path", value: formData.calibrationPath ?? "", onChange: handleCalibrationPathChange, error: errors.calibrationPath }), (0,jsx_runtime.jsxs)("div", { className: CreateNewProjectForm_module.actions, children: [(0,jsx_runtime.jsx)("button", { type: "button", onClick: handleCloseNewProjectForm, className: CreateNewProjectForm_module.cancel, disabled: isSubmitting, children: "Cancel" }), (0,jsx_runtime.jsx)("button", { type: "submit", onClick: handleSubmit, className: CreateNewProjectForm_module.create, disabled: !isFormValid() || isSubmitting, children: isSubmitting ? "Creating..." : "Create" })] })] }));
};
/* harmony default export */ var CreateNewProjectForm_CreateNewProjectForm = (CreateNewProjectForm);

;// ./src/modules/TopbarMenu/ProjectTitleBar.tsx

 // eslint-disable-next-line css-modules/no-unused-class



const ProjectTitleBar = () => {
    const [showCreateNewProjectForm, setShowCreateNewProjectForm] = (0,react.useState)(false);
    const handleTogglePanel = (0,react.useCallback)(() => {
        setShowCreateNewProjectForm((prev) => !prev);
    }, []);
    const handleCancel = (0,react.useCallback)(() => {
        setShowCreateNewProjectForm(false);
    }, []);
    return ((0,jsx_runtime.jsxs)("div", { className: TitleBarMenu_module.createProjectWrapper, children: [(0,jsx_runtime.jsx)("button", { title: "Create new project", onClick: handleTogglePanel, className: TitleBarMenu_module.createProjectButton, children: (0,jsx_runtime.jsx)(Icons_NewProjectButtonIcon, {}) }), showCreateNewProjectForm && ((0,jsx_runtime.jsx)("div", { className: TitleBarMenu_module.createProjectPanelWrapper, children: (0,jsx_runtime.jsx)(CreateNewProjectForm_CreateNewProjectForm, { closeNewProjectForm: handleCancel }) }))] }));
};
/* harmony default export */ var TopbarMenu_ProjectTitleBar = (ProjectTitleBar);

;// ./src/modules/Project/index.tsx













// eslint-disable-next-line css-modules/no-unused-class

const Project_Project = () => {
    const { allProjects, activeProject, isScanningProjects } = useProjectContext();
    const { fetchAllNodes } = useNodesContext();
    const { fetchAllCalibrationGraphs, setWorkflowGraphElements } = useGraphContext();
    const [listedProjects, setListedProjects] = (0,react.useState)(allProjects);
    const [selectedProject, setSelectedProject] = (0,react.useState)(undefined);
    (0,react.useEffect)(() => {
        setSelectedProject(activeProject ?? undefined);
    }, [activeProject]);
    (0,react.useEffect)(() => {
        if (activeProject) {
            setWorkflowGraphElements(undefined);
            fetchAllNodes();
            fetchAllCalibrationGraphs();
        }
    }, [activeProject]);
    (0,react.useEffect)(() => {
        setListedProjects(allProjects);
    }, [allProjects, setListedProjects]);
    const handleSearchChange = (0,react.useCallback)((searchTerm) => {
        setListedProjects(allProjects.filter((p) => p.name.startsWith(searchTerm)));
    }, [allProjects]);
    if (isScanningProjects) {
        return (0,jsx_runtime.jsx)(LoaderPage, {});
    }
    return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsxs)("div", { className: Project_Project_module.projectPageWrapper, children: [(0,jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [(0,jsx_runtime.jsx)("div", { children: "Please select a Project" }), (0,jsx_runtime.jsx)(TopbarMenu_ProjectTitleBar, {})] }), (0,jsx_runtime.jsx)(Input_InputField, { name: "search", iconType: IconType.INNER, placeholder: "Project Name", className: Project_Project_module.searchProjectField, onChange: handleSearchChange, icon: (0,jsx_runtime.jsx)(SearchIcon, { height: 18, width: 18 }) })] }), (0,jsx_runtime.jsx)(components_ProjectList, { projects: listedProjects, selectedProject: selectedProject, setSelectedProject: setSelectedProject }), isScanningProjects && listedProjects?.length === 0 && ((0,jsx_runtime.jsx)("div", { className: Project_Project_module.splashNoProject, children: (0,jsx_runtime.jsx)(loader_LoadingBar, { icon: (0,jsx_runtime.jsx)(NoItemsIcon, { height: 204, width: 200 }), text: "No projects found" }) }))] }));
};
/* harmony default export */ var modules_Project = (Project_Project);

;// ./src/ui-lib/Icons/ProjectIcon.tsx


const ProjectIcon = ({ width = 24, height = 24, className, }) => {
    return ((0,jsx_runtime.jsxs)("svg", { className: className, xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 24 24", fill: "none", children: [(0,jsx_runtime.jsx)("rect", { x: "2", y: "11", width: "20", height: "10", rx: "2", stroke: "#fff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("path", { d: "M4 11V9C4 7.89543 4.89543 7 6 7H18C19.1046 7 20 7.89543 20 9V11", stroke: "#fff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("path", { d: "M7 7V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V7", stroke: "#fff", strokeWidth: "1.2" })] }));
};
/* harmony default export */ var Icons_ProjectIcon = (ProjectIcon);

;// ./src/ui-lib/Icons/NodeLibraryIcon.tsx


const GraphStatusIcon = ({ width = 24, height = 24, className, }) => {
    return ((0,jsx_runtime.jsxs)("svg", { className: className, xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 25 24", fill: "none", children: [(0,jsx_runtime.jsxs)("g", { clipPath: "url(#clip0)", children: [(0,jsx_runtime.jsx)("circle", { cx: "18.1734", cy: "6.64683", r: "4.5", transform: "rotate(-60 18.1734 6.64683)", stroke: "#ffffff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("circle", { cx: "13.2224", cy: "19.9547", r: "3", transform: "rotate(-60 13.2224 19.9547)", stroke: "#ffffff", strokeWidth: "1.5", strokeDasharray: "1 1" }), (0,jsx_runtime.jsx)("circle", { cx: "4.09803", cy: "9.09821", r: "3", transform: "rotate(-60 4.09803 9.09821)", stroke: "#ffffff", strokeWidth: "1.5", strokeDasharray: "1 1" }), (0,jsx_runtime.jsx)("path", { d: "M14.0394 15.808L16.3265 10.7776M13.5093 6.72617L6.99985 8.49902", stroke: "#ffffff", strokeWidth: "1.5", strokeDasharray: "1 1" })] }), (0,jsx_runtime.jsx)("defs", { children: (0,jsx_runtime.jsx)("clipPath", { id: "clip0", children: (0,jsx_runtime.jsx)("rect", { width: "25", height: "24", fill: "white" }) }) })] }));
};
/* harmony default export */ var NodeLibraryIcon = (GraphStatusIcon);

;// ./src/modules/Nodes/NodesPage.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var NodesPage_module = ({"wrapper":"NodesPage-module__wrapper","nodesAndRunningJobInfoWrapper":"NodesPage-module__nodesAndRunningJobInfoWrapper","nodesContainerTop":"NodesPage-module__nodesContainerTop","nodesContainerDown":"NodesPage-module__nodesContainerDown","nodeResultWrapper":"NodesPage-module__nodeResultWrapper","nodeRunningJobInfoWrapper":"NodesPage-module__nodeRunningJobInfoWrapper","refreshButtonWrapper":"NodesPage-module__refreshButtonWrapper","nodeElementListWrapper":"NodesPage-module__nodeElementListWrapper","listWrapper":"NodesPage-module__listWrapper","dot":"NodesPage-module__dot","loadingContainer":"NodesPage-module__loadingContainer","logsText":"NodesPage-module__logsText"});
;// ./src/modules/Nodes/components/NodeElement/NodeElement.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var NodeElement_module = ({"rowWrapper":"NodeElement-module__rowWrapper","nodeSelectedFinished":"NodeElement-module__nodeSelectedFinished","nodeSelectedRunning":"NodeElement-module__nodeSelectedRunning","nodeSelectedError":"NodeElement-module__nodeSelectedError","nodeSelectedPending":"NodeElement-module__nodeSelectedPending","row":"NodeElement-module__row","highlightRunningRow":"NodeElement-module__highlightRunningRow","dot":"NodeElement-module__dot","greyDot":"NodeElement-module__greyDot","redDot":"NodeElement-module__redDot","greenDot":"NodeElement-module__greenDot","runButton":"NodeElement-module__runButton","runButtonIcon":"NodeElement-module__runButtonIcon","runButtonText":"NodeElement-module__runButtonText","dotWrapper":"NodeElement-module__dotWrapper","titleOrNameWrapper":"NodeElement-module__titleOrNameWrapper","titleOrName":"NodeElement-module__titleOrName","descriptionTooltip":"NodeElement-module__descriptionTooltip","descriptionWrapper":"NodeElement-module__descriptionWrapper","description":"NodeElement-module__description","descriptionText":"NodeElement-module__descriptionText","updateAllButton":"NodeElement-module__updateAllButton"});
// EXTERNAL MODULE: ./node_modules/@mui/material/Checkbox/Checkbox.js + 6 modules
var Checkbox = __webpack_require__(4389);
// EXTERNAL MODULE: ./node_modules/@mui/material/CircularProgress/CircularProgress.js + 1 modules
var CircularProgress = __webpack_require__(3357);
;// ./src/modules/common/Parameters/Parameters.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Parameters_module = ({"parametersWrapper":"Parameters-module__parametersWrapper","arrowIconWrapper":"Parameters-module__arrowIconWrapper","nodeNotSelected":"Parameters-module__nodeNotSelected","parameterTitle":"Parameters-module__parameterTitle","parameterValues":"Parameters-module__parameterValues","parameterLabel":"Parameters-module__parameterLabel","parameterValue":"Parameters-module__parameterValue","descriptionWrapper":"Parameters-module__descriptionWrapper","descriptionTooltip":"Parameters-module__descriptionTooltip"});
;// ./src/utils/iconHelper.ts
const getSvgOptions = ({ rotationDegree }) => {
    return {
        style: {
            transform: `rotate(${rotationDegree || 0}deg)`,
            transition: "all 0.25s ease-in",
        },
    };
};

;// ./src/ui-lib/Icons/ArrowIcon.tsx




const ArrowIcon = ({ width = 10, height = 5, color = MAIN_TEXT_COLOR, options }) => {
    const svgOptions = getSvgOptions({
        rotationDegree: options?.rotationDegree || 0,
    });
    return ((0,jsx_runtime.jsx)("svg", { width: width, height: height, viewBox: "0 0 10 5", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...svgOptions, transform: "rotate(90)", children: (0,jsx_runtime.jsx)("path", { d: "M5 4.7998L9.33013 0.299805H0.669873L5 4.7998Z", fill: color }) }));
};

;// ./src/modules/common/Parameters/Parameters.tsx








const Parameters = ({ parametersExpanded = false, show = false, showTitle = true, title, currentItem, getInputElement, }) => {
    const { selectedNodeNameInWorkflow } = useGraphContext();
    const [expanded, setExpanded] = react.useState(selectedNodeNameInWorkflow === title || parametersExpanded);
    (0,react.useEffect)(() => {
        if (selectedNodeNameInWorkflow === title) {
            setExpanded(true);
        }
        else {
            setExpanded(false);
        }
    }, [selectedNodeNameInWorkflow]);
    return ((0,jsx_runtime.jsxs)("div", { className: classNames(Parameters_module.parametersWrapper, !show && Parameters_module.nodeNotSelected), "data-testid": "node-parameters-wrapper", children: [showTitle && Object.entries(currentItem?.parameters ?? {}).length > 0 && ((0,jsx_runtime.jsxs)("div", { className: Parameters_module.parameterTitle, children: [(0,jsx_runtime.jsx)("div", { className: Parameters_module.arrowIconWrapper, onClick: () => {
                            setExpanded(!expanded);
                        }, children: (0,jsx_runtime.jsx)(ArrowIcon, { options: { rotationDegree: expanded ? 0 : -90 } }) }), title ?? "Parameters"] })), expanded &&
                Object.entries(currentItem?.parameters ?? {}).map(([key, parameter]) => {
                    if (parameter.title.toLowerCase() !== "targets name") {
                        return ((0,jsx_runtime.jsxs)("div", { className: Parameters_module.parameterValues, "data-testid": `parameter-values-${key}`, children: [(0,jsx_runtime.jsxs)("div", { className: Parameters_module.parameterLabel, children: [parameter.title, ":"] }), (0,jsx_runtime.jsx)("div", { className: Parameters_module.parameterValue, "data-testid": "parameter-value", children: getInputElement(key, parameter, currentItem) }), (0,jsx_runtime.jsx)("div", { className: Parameters_module.descriptionWrapper, children: parameter.description && ((0,jsx_runtime.jsx)(Tooltip/* default */.A, { title: (0,jsx_runtime.jsxs)("div", { className: Parameters_module.descriptionTooltip, children: [parameter.description, " "] }), placement: "left-start", arrow: true, children: (0,jsx_runtime.jsx)("span", { children: (0,jsx_runtime.jsx)(InfoIcon, {}) }) })) })] }, key));
                    }
                })] }));
};

;// ./src/modules/common/Error/ErrorStatusWrapper.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var ErrorStatusWrapper_module = ({"statusErrorWrapper":"ErrorStatusWrapper-module__statusErrorWrapper","statusErrorHeaderWrapper":"ErrorStatusWrapper-module__statusErrorHeaderWrapper","statusErrorRowWrapper":"ErrorStatusWrapper-module__statusErrorRowWrapper"});
;// ./src/modules/common/Error/ErrorResponseWrapper.tsx


// eslint-disable-next-line css-modules/no-unused-class

const ErrorResponseWrapper = (props) => {
    const { error } = props;
    let errorMessage = error?.name;
    if (errorMessage) {
        errorMessage += "";
    }
    else {
        errorMessage += "Error message: ";
    }
    if (error?.msg) {
        errorMessage += error?.msg;
    }
    return ((0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: error && ((0,jsx_runtime.jsxs)("div", { className: ErrorStatusWrapper_module.statusErrorWrapper, children: [error?.name && (0,jsx_runtime.jsx)("div", { children: "Error occurred:" }), (0,jsx_runtime.jsxs)("div", { className: ErrorStatusWrapper_module.statusErrorWrapper, children: [" ", errorMessage] })] })) }));
};

;// ./src/ui-lib/Icons/RunIcon.tsx


const RunIcon = ({ className }) => ((0,jsx_runtime.jsx)("svg", { className: className, xmlns: "http://www.w3.org/2000/svg", width: "10", height: "10", viewBox: "0 0 12 13", fill: "none", children: (0,jsx_runtime.jsx)("path", { d: "M10.6579 5.71292C11.3246 6.09782 11.3246 7.06007 10.6579 7.44497L2.28947 12.2765C1.62281 12.6614 0.789476 12.1803 0.789476 11.4105L0.789476 1.74744C0.789476 0.977635 1.62281 0.496511 2.28948 0.881412L10.6579 5.71292Z", fill: "white" }) }));

;// ./src/ui-lib/Icons/CircularLoaderProgress.tsx

const CircularLoaderProgress = ({ percentage = 0, strokeColor = "#2CCBE5", size = 16, strokeWidth = 3, }) => {
    const normalized = Math.max(0, Math.min(percentage, 100)) / 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - normalized);
    return ((0,jsx_runtime.jsx)("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, fill: "none", children: (0,jsx_runtime.jsx)("path", { d: `
            M ${size / 2} ${strokeWidth / 2}
            A ${radius} ${radius} 0 1 1 ${(size / 2) - 0.01} ${strokeWidth / 2}
          `, stroke: strokeColor, strokeWidth: strokeWidth, strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: offset, fill: "none", style: {
                transition: "stroke-dashoffset 0.4s ease-in-out",
                transformOrigin: "center",
            } }) }));
};
/* harmony default export */ var Icons_CircularLoaderProgress = (CircularLoaderProgress);

;// ./src/modules/Nodes/components/NodeElement/NodeElementStatusVisuals.tsx


// eslint-disable-next-line css-modules/no-unused-class


const StatusVisuals = ({ status = "pending", percentage }) => {
    if (status === "running") {
        return (0,jsx_runtime.jsx)(Icons_CircularLoaderProgress, { percentage: percentage ?? 0 });
    }
    else if (status === "finished") {
        return (0,jsx_runtime.jsx)("div", { className: `${NodeElement_module.dot} ${NodeElement_module.greenDot}` });
    }
    else if (status === "error") {
        return (0,jsx_runtime.jsx)("div", { className: `${NodeElement_module.dot} ${NodeElement_module.redDot}` });
    }
    return (0,jsx_runtime.jsx)("div", { className: `${NodeElement_module.dot} ${NodeElement_module.greyDot}` });
};

;// ./src/modules/Nodes/components/NodeElement/helpers.ts
// eslint-disable-next-line css-modules/no-unused-class

const getNodeRowClass = ({ nodeName, selectedItemName, runStatus, }) => {
    const isSelected = selectedItemName === nodeName;
    const isLastRun = runStatus?.name === nodeName;
    const nodeStatus = isLastRun ? runStatus?.status : "pending";
    if (isLastRun && nodeStatus === "finished") {
        return `${NodeElement_module.rowWrapper} ${NodeElement_module.nodeSelectedFinished}`;
    }
    else if (isLastRun && nodeStatus === "error") {
        return `${NodeElement_module.rowWrapper} ${NodeElement_module.nodeSelectedError}`;
    }
    else if (isLastRun && nodeStatus === "running") {
        return `${NodeElement_module.rowWrapper} ${NodeElement_module.nodeSelectedRunning} ${NodeElement_module.highlightRunningRow}`;
    }
    else if (isSelected && nodeStatus === "pending") {
        return `${NodeElement_module.rowWrapper} ${NodeElement_module.nodeSelectedPending}`;
    }
    return NodeElement_module.rowWrapper;
};

;// ./src/modules/Nodes/components/NodeElement/NodeElement.tsx


// eslint-disable-next-line css-modules/no-unused-class
















const NodeElement_formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};
const NodeElement = ({ nodeKey, node }) => {
    const { selectedItemName, setSelectedItemName } = useSelectionContext();
    const { firstId, secondId, fetchOneSnapshot, trackLatestSidePanel } = useSnapshotsContext();
    const { setRunningNodeInfo, setSubmitNodeResponseError, submitNodeResponseError, setIsNodeRunning, setRunningNode, allNodes, setAllNodes, setIsAllStatusesUpdated, setUpdateAllButtonPressed, setResults, } = useNodesContext();
    const { runStatus } = useWebSocketData();
    const updateParameter = (paramKey, newValue) => {
        const updatedParameters = {
            ...node.parameters,
            [paramKey]: {
                ...node.parameters[paramKey],
                default: newValue,
            },
        };
        setAllNodes({ ...allNodes, [nodeKey]: { ...node, parameters: updatedParameters } });
    };
    const getInputElement = (key, parameter) => {
        switch (parameter.type) {
            case "boolean":
                return ((0,jsx_runtime.jsx)(Checkbox/* default */.A, { checked: parameter.default, onClick: () => updateParameter(key, !parameter.default), inputProps: { "aria-label": "controlled" }, "data-testid": `checkbox-${key}` }));
            default:
                return ((0,jsx_runtime.jsx)(Input_InputField, { placeholder: key, "data-testid": `input-field-${key}`, value: parameter.default ? parameter.default.toString() : "", onChange: (val) => {
                        updateParameter(key, val);
                    } }));
        }
    };
    const transformInputParameters = (parameters) => {
        return Object.entries(parameters).reduce((acc, [key, parameter]) => {
            acc[key] = parameter.default ?? null;
            return acc;
        }, {});
    };
    const handleClick = async () => {
        setIsNodeRunning(true);
        setResults({});
        setUpdateAllButtonPressed(false);
        setIsAllStatusesUpdated(false);
        setRunningNode(node);
        setSubmitNodeResponseError(undefined);
        const result = await NodesApi.submitNodeParameters(node.name, transformInputParameters(node.parameters));
        if (result.isOk) {
            setRunningNodeInfo({ timestampOfRun: NodeElement_formatDate(new Date()), status: "running" });
        }
        else {
            const errorWithDetails = result.error;
            setSubmitNodeResponseError({
                nodeName: node.name,
                name: `${errorWithDetails.detail[0].type ?? "Error msg"}: `,
                msg: errorWithDetails.detail[0].msg,
            });
            setRunningNodeInfo({
                timestampOfRun: NodeElement_formatDate(new Date()),
                status: "error",
            });
        }
        if (trackLatestSidePanel) {
            fetchOneSnapshot(Number(firstId), Number(secondId), false, true);
        }
    };
    const insertSpaces = (str, interval = 40) => str.replace(new RegExp(`(.{${interval}})`, "g"), "$1 ").trim();
    return ((0,jsx_runtime.jsxs)("div", { className: getNodeRowClass({
            nodeName: node.name,
            selectedItemName: selectedItemName ?? "",
            runStatus: runStatus && runStatus.node
                ? {
                    name: runStatus.node.name,
                    status: runStatus.node.status,
                }
                : null,
        }), "data-testid": `node-element-${nodeKey}`, onClick: () => {
            setSelectedItemName(node.name);
        }, children: [(0,jsx_runtime.jsxs)("div", { className: NodeElement_module.row, children: [(0,jsx_runtime.jsx)("div", { className: NodeElement_module.titleOrNameWrapper, children: (0,jsx_runtime.jsx)("div", { className: NodeElement_module.titleOrName, "data-testid": `title-or-name-${nodeKey}`, children: insertSpaces(node.title ?? node.name) }) }), (0,jsx_runtime.jsx)("div", { className: NodeElement_module.descriptionWrapper, children: node.description && ((0,jsx_runtime.jsx)(Tooltip/* default */.A, { title: (0,jsx_runtime.jsxs)("div", { className: NodeElement_module.descriptionTooltip, children: [node.description, " "] }), placement: "left-start", arrow: true, children: (0,jsx_runtime.jsx)("span", { children: (0,jsx_runtime.jsx)(InfoIcon, {}) }) })) }), (0,jsx_runtime.jsx)("div", { className: NodeElement_module.dotWrapper, "data-testid": `dot-wrapper-${nodeKey}`, children: (runStatus?.node?.name === node.name || (selectedItemName !== node.name && runStatus?.node?.status !== "pending")) && ((0,jsx_runtime.jsx)(StatusVisuals, { status: runStatus?.node?.name === node.name ? runStatus?.node?.status : "pending", percentage: Math.round(runStatus?.node?.percentage_complete ?? 0) })) }), !runStatus?.is_running && node.name === selectedItemName && ((0,jsx_runtime.jsxs)(Button_BlueButton, { className: NodeElement_module.runButton, "data-testid": "run-button", onClick: handleClick, children: [(0,jsx_runtime.jsx)(RunIcon, { className: NodeElement_module.runButtonIcon }), (0,jsx_runtime.jsx)("span", { className: NodeElement_module.runButtonText, children: "Run" })] })), runStatus?.is_running && node.name === selectedItemName && (0,jsx_runtime.jsx)(CircularProgress/* default */.A, { size: 32 })] }), node.name === selectedItemName && node.name === submitNodeResponseError?.nodeName && ((0,jsx_runtime.jsx)(ErrorResponseWrapper, { error: submitNodeResponseError })), Object.keys(node?.parameters ?? {}).length > 0 && ((0,jsx_runtime.jsx)(Parameters, { parametersExpanded: true, showTitle: true, show: selectedItemName === node.name, currentItem: node, getInputElement: getInputElement, "data-testid": `parameters-${nodeKey}` }, node.name))] }));
};

;// ./src/modules/Nodes/components/NodeElement/NodeElementList.tsx



// eslint-disable-next-line css-modules/no-unused-class



const NodeElementList = () => {
    const { allNodes, isRescanningNodes } = useNodesContext();
    if (isRescanningNodes) {
        return (0,jsx_runtime.jsx)(LoaderPage, {});
    }
    return (allNodes && ((0,jsx_runtime.jsx)("div", { className: NodesPage_module.listWrapper, "data-testid": "node-list-wrapper", children: Object.entries(allNodes).map(([key, node]) => {
            return (0,jsx_runtime.jsx)(NodeElement, { nodeKey: key, node: node, "data-testid": `node-element-${key}` }, key);
        }) })));
};

;// ./src/modules/Nodes/components/RunningJob/RunningJob.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var RunningJob_module = ({"wrapper":"RunningJob-module__wrapper","title":"RunningJob-module__title","runningJobWrapper":"RunningJob-module__runningJobWrapper","runningJobNameWrapper":"RunningJob-module__runningJobNameWrapper","runningJobName":"RunningJob-module__runningJobName","greenDot":"RunningJob-module__greenDot","redDot":"RunningJob-module__redDot","greyDot":"RunningJob-module__greyDot","stopButtonContainer":"RunningJob-module__stopButtonContainer","stopButtonWrapper":"RunningJob-module__stopButtonWrapper","stopButton":"RunningJob-module__stopButton","parameterStatesWrapper":"RunningJob-module__parameterStatesWrapper","parameterColumnWrapper":"RunningJob-module__parameterColumnWrapper","statesColumnWrapper":"RunningJob-module__statesColumnWrapper","runInfoWrapper":"RunningJob-module__runInfoWrapper","runInfoColumn":"RunningJob-module__runInfoColumn","jobInfoKey":"RunningJob-module__jobInfoKey","jobInfoKeySecondColumn":"RunningJob-module__jobInfoKeySecondColumn","jobInfoValue":"RunningJob-module__jobInfoValue","jobInfoValueText":"RunningJob-module__jobInfoValueText","runInfoRow":"RunningJob-module__runInfoRow","parametersWrapper":"RunningJob-module__parametersWrapper","parameterTitleWrapper":"RunningJob-module__parameterTitleWrapper","parameterValues":"RunningJob-module__parameterValues","parameterLabel":"RunningJob-module__parameterLabel","parameterValue":"RunningJob-module__parameterValue","stateWrapper":"RunningJob-module__stateWrapper","stateTitle":"RunningJob-module__stateTitle","updateAllButton":"RunningJob-module__updateAllButton","stateUpdatesTopWrapper":"RunningJob-module__stateUpdatesTopWrapper","stateUpdateWrapper":"RunningJob-module__stateUpdateWrapper","stateUpdateOrderNumberAndTitleWrapper":"RunningJob-module__stateUpdateOrderNumberAndTitleWrapper","stateUpdateOrderNumber":"RunningJob-module__stateUpdateOrderNumber","stateUpdateOrderKey":"RunningJob-module__stateUpdateOrderKey","stateUpdateValueWrapper":"RunningJob-module__stateUpdateValueWrapper","stateUpdateValueOld":"RunningJob-module__stateUpdateValueOld","stateUpdateRightArrowIconWrapper":"RunningJob-module__stateUpdateRightArrowIconWrapper","stateUpdateUndoIconWrapper":"RunningJob-module__stateUpdateUndoIconWrapper","stateUpdateValueNew":"RunningJob-module__stateUpdateValueNew","valueContainer":"RunningJob-module__valueContainer","valueContainerEditable":"RunningJob-module__valueContainerEditable","valueContainerDisabled":"RunningJob-module__valueContainerDisabled","stateUpdateIconBeforeWrapper":"RunningJob-module__stateUpdateIconBeforeWrapper","stateUpdateIconAfterWrapper":"RunningJob-module__stateUpdateIconAfterWrapper","stateUpdateComponentTextWrapper":"RunningJob-module__stateUpdateComponentTextWrapper","stateUpdateKeyText":"RunningJob-module__stateUpdateKeyText","upArrowIconWrapper":"RunningJob-module__upArrowIconWrapper","stateUpdateValueText":"RunningJob-module__stateUpdateValueText","stateUpdateValueTextWrapper":"RunningJob-module__stateUpdateValueTextWrapper","editIconWrapper":"RunningJob-module__editIconWrapper","newValueOfState":"RunningJob-module__newValueOfState","jobInfoContainer":"RunningJob-module__jobInfoContainer","topRow":"RunningJob-module__topRow","leftStatus":"RunningJob-module__leftStatus","nodeText":"RunningJob-module__nodeText","nodeName":"RunningJob-module__nodeName","rightStatus":"RunningJob-module__rightStatus","percentage":"RunningJob-module__percentage","loadingBarWrapper":"RunningJob-module__loadingBarWrapper","finishedText":"RunningJob-module__finishedText","errorText":"RunningJob-module__errorText","bar_running":"RunningJob-module__bar_running","barRunning":"RunningJob-module__bar_running","bar_pending":"RunningJob-module__bar_pending","barPending":"RunningJob-module__bar_pending","bar_finished":"RunningJob-module__bar_finished","barFinished":"RunningJob-module__bar_finished","bar_error":"RunningJob-module__bar_error","barError":"RunningJob-module__bar_error"});
;// ./src/ui-lib/Icons/CheckMarkBeforeIcon.tsx


const CheckMarkBeforeIcon = ({ width = 24, height = 24 }) => ((0,jsx_runtime.jsxs)("svg", { width: width, height: height, viewBox: "0 0 26 27", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0,jsx_runtime.jsx)("path", { opacity: "0.5", fillRule: "evenodd", clipRule: "evenodd", d: "M13 1.12549C6.37258 1.12549 1 6.49807 1 13.1255V13.1255C1 19.7529 6.37258 25.1255 13 25.1255V25.1255C19.6274 25.1255 25 19.7529 25 13.1255V13.1255C25 6.49807 19.6274 1.12549 13 1.12549V1.12549Z", stroke: "#3CDEF8", strokeWidth: "2" }), (0,jsx_runtime.jsx)("path", { d: "M8 13.8255L10.8571 16.6255L18 9.62549", stroke: "#3CDEF8", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })] }));

;// ./src/ui-lib/Icons/CheckMarkAfterIcon.tsx


const CheckMarkAfterIcon = ({ width = 24, height = 24 }) => ((0,jsx_runtime.jsx)("svg", { width: width, height: height, viewBox: "0 0 24 25", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0,jsx_runtime.jsx)("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M0 12.251C0 5.62356 5.37258 0.250977 12 0.250977C18.6274 0.250977 24 5.62356 24 12.251C24 18.8784 18.6274 24.251 12 24.251C5.37258 24.251 0 18.8784 0 12.251ZM17.6999 9.46519C18.0944 9.07863 18.1008 8.4455 17.7142 8.05105C17.3277 7.6566 16.6945 7.6502 16.3001 8.03676L9.85714 14.3508L7.69993 12.2368C7.30548 11.8502 6.67235 11.8566 6.28579 12.251C5.89923 12.6455 5.90562 13.2786 6.30007 13.6652L9.15721 16.4652C9.54604 16.8462 10.1682 16.8462 10.5571 16.4652L17.6999 9.46519Z", fill: "#00D59A" }) }));

;// ./src/ui-lib/Icons/RightArrowIcon.tsx


const RightArrowIcon = ({ width = 10, height = 10 }) => ((0,jsx_runtime.jsx)("svg", { width: width, height: height, viewBox: "0 0 10 8", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0,jsx_runtime.jsx)("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M7.29287 3.62553L5.14642 1.47908L5.85353 0.771973L8.85353 3.77197L9.20708 4.12553L8.85353 4.47908L5.85353 7.47908L5.14642 6.77197L7.29287 4.62553H0V3.62553H7.29287Z", fill: "var(--grey-highlight)" }) }));

;// ./src/ui-lib/Icons/UndoIcon.tsx


const UndoIcon = ({ width = 17, height = 17 }) => ((0,jsx_runtime.jsx)("svg", { width: width, height: height, viewBox: "0 0 17 17", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0,jsx_runtime.jsx)("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M5.38412 2.41501C5.59241 2.62328 5.59241 2.96097 5.38412 3.16924L4.16125 4.39212H9.807C12.458 4.39212 14.607 6.54116 14.607 9.19212C14.607 11.8431 12.458 13.9921 9.807 13.9921H5.54033C5.24579 13.9921 5.007 13.7533 5.007 13.4588C5.007 13.1643 5.24579 12.9255 5.54033 12.9255H9.807C11.8689 12.9255 13.5403 11.254 13.5403 9.19212C13.5403 7.13026 11.8689 5.45879 9.807 5.45879H4.16125L5.38412 6.68167C5.59241 6.88995 5.59241 7.22763 5.38412 7.43591C5.17584 7.6442 4.83816 7.6442 4.62988 7.43591L2.49655 5.30258C2.28826 5.0943 2.28826 4.75662 2.49655 4.54834L4.62988 2.41501C4.83816 2.20672 5.17584 2.20672 5.38412 2.41501Z", fill: "#3CDEF8" }) }));

;// ./src/modules/Nodes/components/StateUpdates/ValueComponent.tsx


// eslint-disable-next-line css-modules/no-unused-class


const ValueComponent = ({ inputRef, defaultValue, disabled, onClick, onChange, }) => {
    const adjustWidth = (0,react.useCallback)(() => {
        if (inputRef?.current) {
            const value = defaultValue.toString() || "";
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (context) {
                context.font = getComputedStyle(inputRef.current).font;
                const textWidth = context.measureText(value).width;
                inputRef.current.style.width = `${Math.ceil(textWidth)}px`;
            }
        }
    }, [defaultValue]);
    (0,react.useEffect)(() => {
        adjustWidth();
    }, [defaultValue, adjustWidth]);
    if (!onClick) {
        return ((0,jsx_runtime.jsx)("div", { className: RunningJob_module.valueContainer, "data-testid": "value-container", children: defaultValue }));
    }
    return ((0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: (0,jsx_runtime.jsx)(Tooltip/* default */.A, { title: "Edit", children: (0,jsx_runtime.jsx)("input", { ref: inputRef, className: disabled ? RunningJob_module.valueContainerDisabled : RunningJob_module.valueContainerEditable, "data-testid": "value-input", disabled: disabled, onBlur: (e) => {
                    onChange && onChange(e);
                }, defaultValue: defaultValue }) }) }));
};

;// ./src/modules/Nodes/components/StateUpdates/ValueRow.tsx


// eslint-disable-next-line css-modules/no-unused-class



 // export const ValueRow = ({
const ValueRow = ({ oldValue, previousValue, customValue, setCustomValue, parameterUpdated, setParameterUpdated, }) => {
    const inputRef = (0,react.useRef)(null);
    const handleChange = (event) => {
        setCustomValue(event.target.value);
    };
    return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdateValueOld, children: (0,jsx_runtime.jsx)(ValueComponent, { defaultValue: oldValue }) }), (0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdateRightArrowIconWrapper, children: (0,jsx_runtime.jsx)(RightArrowIcon, {}) }), !parameterUpdated && ((0,jsx_runtime.jsxs)("div", { className: RunningJob_module.stateUpdateValueNew, children: [(0,jsx_runtime.jsx)(ValueComponent, { inputRef: inputRef, defaultValue: customValue, onClick: () => {
                            setParameterUpdated(true);
                        }, onChange: handleChange }), customValue !== previousValue && ((0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdateUndoIconWrapper, "data-testid": "undo-icon-wrapper", onClick: () => {
                            if (inputRef.current) {
                                inputRef.current.value = previousValue.toString();
                            }
                            setCustomValue(previousValue);
                        }, children: (0,jsx_runtime.jsx)(UndoIcon, {}) }))] })), parameterUpdated && ((0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdateValueNew, children: (0,jsx_runtime.jsx)(ValueComponent, { defaultValue: customValue, disabled: parameterUpdated }) }))] }));
};

;// ./src/modules/Nodes/components/StateUpdates/StateUpdateElement.tsx


// eslint-disable-next-line css-modules/no-unused-class







const StateUpdateElement = (props) => {
    const { stateKey, index, stateUpdateObject, runningNodeInfo, setRunningNodeInfo, updateAllButtonPressed } = props;
    const [runningUpdate, setRunningUpdate] = react.useState(false);
    const [parameterUpdated, setParameterUpdated] = (0,react.useState)(false);
    const [customValue, setCustomValue] = (0,react.useState)(JSON.stringify(stateUpdateObject.val ?? stateUpdateObject.new ?? ""));
    const previousValue = JSON.stringify(stateUpdateObject.val ?? stateUpdateObject.new ?? "");
    const { secondId, fetchOneSnapshot, trackLatestSidePanel, latestSnapshotId } = useSnapshotsContext();
    const handleUpdateClick = async () => {
        if (runningNodeInfo && runningNodeInfo.idx && stateUpdateObject && ("val" in stateUpdateObject || "new" in stateUpdateObject)) {
            setRunningUpdate(true);
            const stateUpdateValue = customValue ? customValue : (stateUpdateObject.val ?? stateUpdateObject.new);
            const response = await SnapshotsApi.updateState(runningNodeInfo?.idx, stateKey, stateUpdateValue);
            const stateUpdate = { ...stateUpdateObject, stateUpdated: response.result };
            if (response.isOk && response.result && trackLatestSidePanel) {
                fetchOneSnapshot(Number(latestSnapshotId), Number(secondId), false, true);
            }
            if (setRunningNodeInfo) {
                setRunningNodeInfo({
                    ...runningNodeInfo,
                    state_updates: { ...runningNodeInfo.state_updates, [stateKey]: stateUpdate },
                });
            }
            setParameterUpdated(response.result);
            setRunningUpdate(false);
        }
    };
    return (
    // {!runningUpdate && !parameterUpdated && (
    (0,jsx_runtime.jsxs)("div", { className: RunningJob_module.stateUpdateWrapper, "data-testid": `state-update-wrapper-${stateKey}`, children: [(0,jsx_runtime.jsxs)("div", { className: RunningJob_module.stateUpdateOrderNumberAndTitleWrapper, children: [(0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdateOrderNumber, children: index + 1 }), (0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdateOrderKey, "data-testid": `state-update-key-${index}`, children: stateKey })] }), (0,jsx_runtime.jsxs)("div", { className: RunningJob_module.stateUpdateValueWrapper, "data-testid": `state-update-value-wrapper-${index}`, children: [(0,jsx_runtime.jsx)(ValueRow, { oldValue: JSON.stringify(stateUpdateObject.old), previousValue: previousValue, customValue: customValue, setCustomValue: setCustomValue, parameterUpdated: parameterUpdated || updateAllButtonPressed, setParameterUpdated: setParameterUpdated }), !runningUpdate && !parameterUpdated && !updateAllButtonPressed && ((0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdateIconBeforeWrapper, "data-testid": "update-before-icon", onClick: handleUpdateClick, children: (0,jsx_runtime.jsx)(CheckMarkBeforeIcon, {}) })), runningUpdate && !parameterUpdated && ((0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdateIconAfterWrapper, "data-testid": "update-in-progress", children: (0,jsx_runtime.jsx)(CircularProgress/* default */.A, { size: 17 }) })), (parameterUpdated || updateAllButtonPressed) && ((0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdateIconAfterWrapper, "data-testid": "update-after-icon", children: (0,jsx_runtime.jsx)(CheckMarkAfterIcon, {}) }))] })] }, `${stateKey}-wrapper`));
};

// EXTERNAL MODULE: ./node_modules/@mui/material/Button/Button.js + 3 modules
var Button = __webpack_require__(6990);
;// ./src/modules/Nodes/components/StateUpdates/StateUpdates.tsx



// eslint-disable-next-line css-modules/no-unused-class



// import { ErrorStatusWrapper } from "../../../common/Error/ErrorStatusWrapper";

const StateUpdates = (props) => {
    const { trackLatestSidePanel, fetchOneSnapshot, latestSnapshotId, secondId } = useSnapshotsContext();
    const { runningNodeInfo, setRunningNodeInfo, updateAllButtonPressed, setUpdateAllButtonPressed } = props;
    const handleClick = async (stateUpdates) => {
        const litOfUpdates = Object.entries(stateUpdates ?? {})
            .filter(([, stateUpdateObject]) => !stateUpdateObject.stateUpdated)
            .map(([key, stateUpdateObject]) => {
            return {
                data_path: key,
                value: stateUpdateObject.val ?? stateUpdateObject.new,
            };
        });
        const result = await SnapshotsApi.updateStates(runningNodeInfo?.idx ?? "", litOfUpdates);
        if (result.isOk) {
            setUpdateAllButtonPressed(result.result);
            if (result.result && trackLatestSidePanel) {
                fetchOneSnapshot(Number(latestSnapshotId), Number(secondId), false, true);
            }
        }
    };
    return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsxs)("div", { className: RunningJob_module.stateWrapper, "data-testid": "state-wrapper", children: [(0,jsx_runtime.jsxs)("div", { className: RunningJob_module.stateTitle, "data-testid": "state-title", children: ["State updates\u00A0", runningNodeInfo?.state_updates && Object.keys(runningNodeInfo?.state_updates).length > 0
                                ? `(${Object.keys(runningNodeInfo?.state_updates).length})`
                                : ""] }), updateAllButtonPressed ||
                        (Object.entries(runningNodeInfo?.state_updates ?? {}).filter(([, stateUpdateObject]) => !stateUpdateObject.stateUpdated).length >
                            0 && ((0,jsx_runtime.jsx)(Button/* default */.A, { className: RunningJob_module.updateAllButton, "data-testid": "update-all-button", disabled: updateAllButtonPressed, onClick: () => handleClick(runningNodeInfo?.state_updates ?? {}), children: "Accept All" })))] }), runningNodeInfo?.state_updates && ((0,jsx_runtime.jsx)("div", { className: RunningJob_module.stateUpdatesTopWrapper, "data-testid": "state-updates-top-wrapper", children: Object.entries(runningNodeInfo?.state_updates ?? {}).map(([key, stateUpdateObject], index) => ((0,jsx_runtime.jsx)(StateUpdateElement, { stateKey: key, index: index, stateUpdateObject: stateUpdateObject, runningNodeInfo: runningNodeInfo, setRunningNodeInfo: setRunningNodeInfo, updateAllButtonPressed: updateAllButtonPressed }, key))) }))] }));
};

;// ./src/ui-lib/components/Bar/LoadingBar.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var LoadingBar_module = ({"progress":"LoadingBar-module__progress"});
;// ./src/ui-lib/components/Bar/LoadingBar.tsx



const LoadingBar_LoadingBar = ({ percentage, trackColor = "#4E5058", progressColor, height = 4, }) => {
    const normalized = Math.max(0, Math.min(percentage, 100));
    const viewBoxWidth = 1000;
    const progressWidth = (normalized / 100) * viewBoxWidth;
    const rx = height / 2;
    return ((0,jsx_runtime.jsxs)("svg", { width: "100%", height: height, viewBox: `0 0 ${viewBoxWidth} ${height}`, preserveAspectRatio: "none", children: [(0,jsx_runtime.jsx)("rect", { x: 0, y: 0, width: viewBoxWidth, height: height, rx: rx, fill: trackColor }), (0,jsx_runtime.jsx)("rect", { className: LoadingBar_module.progress, x: 0, y: 0, width: progressWidth, height: height, rx: rx, fill: progressColor || "var(--progress-color)" })] }));
};
/* harmony default export */ var Bar_LoadingBar = (LoadingBar_LoadingBar);

;// ./src/ui-lib/Icons/CheckmarkIcon.tsx


const CheckmarkIcon = ({ width = 38, height = 38, className, ...props }) => {
    return ((0,jsx_runtime.jsxs)("svg", { className: className, width: width, height: height, viewBox: "0 0 38 38", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [(0,jsx_runtime.jsx)("circle", { cx: "19", cy: "19", r: "18", stroke: "#32FFC6", strokeWidth: "2", opacity: "0.3", vectorEffect: "non-scaling-stroke" }), (0,jsx_runtime.jsx)("path", { d: "M13 20.4L17 24L27 15", stroke: "#32FFC6", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" })] }));
};
/* harmony default export */ var Icons_CheckmarkIcon = (CheckmarkIcon);

;// ./src/ui-lib/Icons/ErrorIcon.tsx


const ErrorIcon = ({ width = 38, height = 38, ...props }) => ((0,jsx_runtime.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 38 38", fill: "none", ...props, children: [(0,jsx_runtime.jsx)("circle", { cx: "19", cy: "19", r: "18", stroke: "#FF6173", strokeWidth: "2", opacity: "0.3" }), (0,jsx_runtime.jsxs)("g", { transform: "translate(7 7)", children: [(0,jsx_runtime.jsx)("path", { d: "M10.4343 6.45598C10.4343 5.73199 10.8796 5.13512 11.5958 4.94721C12.3119 4.79246 13.028 5.10748 13.3349 5.72646C13.4372 5.94753 13.4733 6.16859 13.4733 6.41729C13.4552 6.76271 13.4297 7.10812 13.4041 7.45354C13.3785 7.79895 13.3529 8.14436 13.3349 8.48978C13.3018 9.02311 13.2672 9.55644 13.2326 10.0898C13.198 10.6231 13.1634 11.1564 13.1303 11.6897C13.0942 12.0379 13.0942 12.3529 13.0942 12.6955C13.0641 13.2648 12.5827 13.7014 11.9689 13.7014C11.355 13.7014 10.8796 13.2924 10.8435 12.7287C10.7924 11.897 10.7412 11.0735 10.6901 10.25C10.6389 9.42655 10.5878 8.60308 10.5366 7.77132C10.5186 7.55302 10.502 7.33333 10.4855 7.11365C10.4689 6.89397 10.4524 6.67428 10.4343 6.45598Z", fill: "#FF6173" }), (0,jsx_runtime.jsx)("path", { d: "M10.4592 17.7084C10.4592 16.9567 11.1452 16.3267 11.9636 16.3267C12.7881 16.3267 13.4681 16.9512 13.432 17.7415C13.4681 18.46 12.752 19.09 11.9636 19.09C11.1452 19.09 10.4592 18.46 10.4592 17.7084Z", fill: "#FF6173" })] })] }));
/* harmony default export */ var Icons_ErrorIcon = (ErrorIcon);

;// ./src/ui-lib/Icons/StopIcon.tsx


const StopIcon = () => ((0,jsx_runtime.jsxs)("svg", { width: "34", height: "34", viewBox: "0 0 34 34", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0,jsx_runtime.jsx)("path", { opacity: "0.7", fillRule: "evenodd", clipRule: "evenodd", d: "M17 1C8.16345 1 1 8.16344 1 17V17C1 25.8366 8.16345 33 17 33V33C25.8366 33 33 25.8366 33 17V17C33 8.16344 25.8366 1 17 1V1Z", stroke: "#FF4077", strokeWidth: "2" }), (0,jsx_runtime.jsx)("rect", { x: "11.9474", y: "11.9474", width: "10.1053", height: "10.1053", rx: "1", fill: "#FF4077" })] }));

;// ./src/modules/Nodes/components/RunningJob/RunningJobStatusLabel.tsx


// eslint-disable-next-line css-modules/no-unused-class




const RunningJobStatusLabel = ({ status, percentage = 0, onStop }) => {
    if (status === "finished") {
        return ((0,jsx_runtime.jsxs)("div", { className: RunningJob_module.finishedText, children: ["Finished ", (0,jsx_runtime.jsx)(Icons_CheckmarkIcon, { height: 30, width: 30 }), " "] }));
    }
    else if (status === "error") {
        return ((0,jsx_runtime.jsxs)("div", { className: RunningJob_module.errorText, children: ["Error ", (0,jsx_runtime.jsx)(Icons_ErrorIcon, { height: 22, width: 22 }), " "] }));
    }
    else if (status === "running") {
        return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsxs)("div", { className: RunningJob_module.percentage, children: [Math.round(percentage), "%"] }), (0,jsx_runtime.jsxs)("button", { className: RunningJob_module.stopButton, onClick: onStop, title: "Stop Node", children: [" ", (0,jsx_runtime.jsx)(StopIcon, {}), " "] })] }));
    }
    return null;
};

;// ./src/modules/Nodes/components/RunningJob/RunningJobStatusVisuals.tsx


// eslint-disable-next-line css-modules/no-unused-class


const RunningJobStatusVisuals = ({ status = "pending", percentage }) => {
    if (status === "running") {
        return (0,jsx_runtime.jsx)(Icons_CircularLoaderProgress, { percentage: percentage });
    }
    else if (status === "finished") {
        return (0,jsx_runtime.jsx)("div", { className: RunningJob_module.greenDot });
    }
    else if (status === "error") {
        return (0,jsx_runtime.jsx)("div", { className: RunningJob_module.redDot });
    }
    return (0,jsx_runtime.jsx)("div", { className: RunningJob_module.greyDot });
};

;// ./src/modules/Nodes/components/RunningJob/RunningJobNodeProgressTracker.tsx


// eslint-disable-next-line css-modules/no-unused-class






const RunningJobNodeProgressTracker = () => {
    const { setIsNodeRunning, runStatus } = useNodesContext();
    const handleStopClick = async () => {
        const res = await SnapshotsApi.stopNodeRunning();
        if (res.isOk && res.result) {
            setIsNodeRunning(false);
        }
    };
    return ((0,jsx_runtime.jsxs)("div", { className: RunningJob_module.jobInfoContainer, children: [(0,jsx_runtime.jsxs)("div", { className: RunningJob_module.topRow, children: [(0,jsx_runtime.jsxs)("div", { className: RunningJob_module.leftStatus, children: [(0,jsx_runtime.jsx)(RunningJobStatusVisuals, { status: runStatus?.node?.status, percentage: Math.round(runStatus?.node?.percentage_complete ?? 0) }), (0,jsx_runtime.jsxs)("div", { className: RunningJob_module.nodeText, children: ["Node: ", (0,jsx_runtime.jsx)("span", { className: RunningJob_module.nodeName, children: runStatus?.node?.name || "Unnamed" })] })] }), (0,jsx_runtime.jsx)("div", { className: RunningJob_module.rightStatus, children: (0,jsx_runtime.jsx)(RunningJobStatusLabel, { status: runStatus?.node?.status, percentage: runStatus?.node?.percentage_complete, onStop: handleStopClick }) })] }), (0,jsx_runtime.jsx)("div", { className: `${RunningJob_module.loadingBarWrapper} ${RunningJob_module[`bar_${runStatus?.node?.status}`]}`, children: (0,jsx_runtime.jsx)(Bar_LoadingBar, { percentage: Math.round(runStatus?.node?.percentage_complete ?? 0) }) })] }));
};

;// ./src/modules/Nodes/components/RunningJob/RunningJobParameters.tsx


// eslint-disable-next-line css-modules/no-unused-class


const RunningJobParameters = () => {
    const { runningNode } = useNodesContext();
    return ((0,jsx_runtime.jsx)("div", { className: RunningJob_module.parametersWrapper, "data-testid": "parameters-wrapper", children: (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)("div", { className: RunningJob_module.parameterTitleWrapper, "data-testid": "parameter-title", children: "Parameters" }), (0,jsx_runtime.jsx)("div", { "data-testid": "parameters-list", children: 
                    // expanded &&
                    Object.entries(runningNode?.parameters ?? {}).map(([key, parameter]) => ((0,jsx_runtime.jsxs)("div", { className: RunningJob_module.parameterValues, "data-testid": `parameter-item-${key}`, children: [(0,jsx_runtime.jsxs)("div", { className: RunningJob_module.parameterLabel, "data-testid": `parameter-label-${key}`, children: [parameter.title, ":"] }), (0,jsx_runtime.jsx)("div", { className: RunningJob_module.parameterValue, "data-testid": `parameter-value-${key}`, children: parameter.default?.toString() })] }, key))) })] }) }));
};

;// ./src/modules/Nodes/components/RunningJob/RunningJob.tsx


// eslint-disable-next-line css-modules/no-unused-class





const RunningJob = () => {
    const { runningNodeInfo, setRunningNodeInfo, updateAllButtonPressed, setUpdateAllButtonPressed, runStatus } = useNodesContext();
    return ((0,jsx_runtime.jsxs)("div", { className: RunningJob_module.wrapper, "data-testid": "running-job-wrapper", children: [runStatus?.node?.status !== undefined && (0,jsx_runtime.jsx)(RunningJobNodeProgressTracker, {}), (0,jsx_runtime.jsxs)("div", { className: RunningJob_module.parameterStatesWrapper, children: [(0,jsx_runtime.jsx)("div", { className: RunningJob_module.parameterColumnWrapper, children: (0,jsx_runtime.jsx)(RunningJobParameters, {}) }), (0,jsx_runtime.jsx)("div", { className: RunningJob_module.statesColumnWrapper, "data-testid": "states-column-wrapper", children: (0,jsx_runtime.jsx)(StateUpdates, { runningNodeInfo: runningNodeInfo, setRunningNodeInfo: setRunningNodeInfo, updateAllButtonPressed: updateAllButtonPressed, setUpdateAllButtonPressed: setUpdateAllButtonPressed }) })] })] }));
};

// EXTERNAL MODULE: ./node_modules/jsonpath/jsonpath.js
var jsonpath = __webpack_require__(5615);
var jsonpath_default = /*#__PURE__*/__webpack_require__.n(jsonpath);
// EXTERNAL MODULE: ./node_modules/@textea/json-viewer/dist/index.mjs + 2 modules
var json_viewer_dist = __webpack_require__(3663);
;// ./src/common/ui-components/common/ToggleSwitch/ToggleSwitch.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var ToggleSwitch_module = ({"firstRowWrapper":"ToggleSwitch-module__firstRowWrapper","switchWrapper":"ToggleSwitch-module__switchWrapper","switchOption":"ToggleSwitch-module__switchOption","selected":"ToggleSwitch-module__selected"});
;// ./src/common/ui-components/common/ToggleSwitch/ToggleSwitch.tsx


const ToggleSwitch = ({ title, activeTab, setActiveTab }) => {
    return ((0,jsx_runtime.jsxs)("div", { className: ToggleSwitch_module.firstRowWrapper, children: [(0,jsx_runtime.jsx)("h1", { children: title }), (0,jsx_runtime.jsxs)("div", { className: ToggleSwitch_module.switchWrapper, children: [(0,jsx_runtime.jsx)("div", { className: `${ToggleSwitch_module.switchOption} ${activeTab === "live" ? ToggleSwitch_module.selected : ""}`, onClick: () => setActiveTab("live"), children: "Live" }), (0,jsx_runtime.jsx)("div", { className: `${ToggleSwitch_module.switchOption} ${activeTab === "final" ? ToggleSwitch_module.selected : ""}`, onClick: () => setActiveTab("final"), children: "Final" })] })] }));
};
/* harmony default export */ var ToggleSwitch_ToggleSwitch = (ToggleSwitch);

;// ./src/common/ui-components/common/Iframe/Iframe.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Iframe_module = ({"notLoaded":"Iframe-module__notLoaded","iframe":"Iframe-module__iframe"});
;// ./src/common/ui-components/common/Iframe/Iframe.tsx




const Iframe = ({ targetUrl }) => {
    const [isAvailable, setIsAvailable] = (0,react.useState)(null);
    (0,react.useEffect)(() => {
        const checkURL = async () => {
            try {
                const response = await fetch(targetUrl, { method: "HEAD" });
                setIsAvailable(response.ok);
            }
            catch (error) {
                setIsAvailable(false);
            }
        };
        checkURL();
    }, [targetUrl]);
    if (isAvailable === null) {
        return (0,jsx_runtime.jsx)(CircularProgress/* default */.A, { size: "2rem" });
    }
    if (!isAvailable) {
        return (0,jsx_runtime.jsx)("div", { className: Iframe_module.notLoaded });
    }
    return (0,jsx_runtime.jsx)("iframe", { className: Iframe_module.iframe, src: targetUrl, title: "Embedded Page" });
};
/* harmony default export */ var Iframe_Iframe = (Iframe);

;// ./src/modules/Data/components/JSONEditor.tsx









const JSONEditor = ({ title, jsonDataProp, height, showSearch = true, toggleSwitch = false, pageName }) => {
    const { isNodeRunning } = useNodesContext();
    const [searchTerm, setSearchTerm] = (0,react.useState)("");
    const [jsonData, setJsonData] = (0,react.useState)(jsonDataProp);
    const [activeTab, setActiveTab] = (0,react.useState)("final");
    const { selectedPageName } = FlexLayoutContext_useFlexLayoutContext();
    (0,react.useEffect)(() => {
        setJsonData(jsonDataProp);
    }, [jsonDataProp]);
    // Listen for postMessage events to switch to live
    (0,react.useEffect)(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.action === "data-dashboard-update") {
                console.log("PostMessage indicates to switch to live tab and node is running.");
                setActiveTab("live");
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);
    // Switch back to final when a node finishes running
    (0,react.useEffect)(() => {
        if (!isNodeRunning) {
            console.log("Node is not running. Switching to final tab.");
            setActiveTab("final");
        }
    }, [isNodeRunning]);
    const filterData = (data, term) => {
        if (!term)
            return data;
        try {
            const jsonPathQuery = term.replace("#", "$").replace(/\*/g, "*").replace(/\//g, ".");
            const result = jsonpath_default().nodes(data, jsonPathQuery);
            return result.reduce((acc, { path, value, }) => {
                let current = acc;
                for (let i = 1; i < path.length - 1; i++) {
                    const key = path[i];
                    if (!current[key])
                        current[key] = {};
                    current = current[key];
                }
                const lastKey = path[path.length - 1];
                current[lastKey] = value;
                return acc;
            }, {});
        }
        catch (error) {
            console.error("Invalid JSONPath query:", error);
            return data;
        }
    };
    const handleSearch = (_val, e) => {
        setSearchTerm(e.target.value);
        const filteredData = filterData(jsonDataProp, e.target.value);
        setJsonData(filteredData);
    };
    const imageDataType = (0,json_viewer_dist/* defineDataType */.S3)({
        is: (value) => typeof value === "string" && value.startsWith("data:image"),
        Component: ({ value }) => {
            const handleImageClick = () => {
                const win = window.open();
                win?.document.write(`<img src='${value}' alt='${value}' style="max-width: 100%; height: auto;" />`);
            };
            return ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("br", {}), (0,jsx_runtime.jsx)("div", { className: "figure-container", children: (0,jsx_runtime.jsx)("a", { onClick: handleImageClick, style: { cursor: "pointer" }, children: (0,jsx_runtime.jsx)("img", { style: { maxWidth: "100%", height: "auto" }, src: value, alt: "Base64 figure" }) }) })] }));
        },
    });
    const handleOnSelect = async (path) => {
        let searchPath = "#";
        path.forEach((a) => {
            searchPath += "/" + a;
        });
        setSearchTerm(searchPath);
        const filteredData = filterData(jsonDataProp, searchPath);
        await navigator.clipboard.writeText(searchPath);
        setJsonData(filteredData);
    };
    const currentURL = new URL(window.location.pathname, "MISSING_ENV_VAR".DASHBOARD_APP_PATH ?? window.location.origin);
    const iframeURL = new URL("dashboards/data-dashboard", currentURL);
    return ((0,jsx_runtime.jsxs)("div", { style: {
            display: "flex",
            flexDirection: "column",
            flex: 1,
            color: "#d9d5d4",
            height: height,
            marginLeft: "20px",
            marginRight: "20px",
        }, children: [!toggleSwitch && (0,jsx_runtime.jsx)("h1", { style: { paddingTop: "10px", paddingBottom: "5px" }, children: title }), toggleSwitch && (0,jsx_runtime.jsx)(ToggleSwitch_ToggleSwitch, { title: title, activeTab: activeTab, setActiveTab: setActiveTab }), showSearch && ((0,jsx_runtime.jsx)(Input_InputField, { value: searchTerm, title: "Search", onChange: (_e, event) => handleSearch(event.target.value, event) })), (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)("div", { style: {
                            width: "100%",
                            height: "100%",
                            display: activeTab === "final" ? "block" : "none",
                            overflowY: "auto",
                        }, children: (0,jsx_runtime.jsx)(json_viewer_dist/* JsonViewer */.p2, { rootName: false, onSelect: (path) => handleOnSelect(path), theme: "dark", value: jsonData, valueTypes: [imageDataType], displayDataTypes: false, defaultInspectDepth: 3, style: { overflowY: "auto", height: "100%" } }) }), toggleSwitch && ((0,jsx_runtime.jsx)("div", { style: { width: "100%", height: "100%", display: activeTab === "live" ? "block" : "none" }, children: selectedPageName === pageName && (0,jsx_runtime.jsx)(Iframe_Iframe, { targetUrl: iframeURL.href }) }))] })] }));
};

;// ./src/modules/Nodes/components/Results/Results.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Results_module = ({"wrapper":"Results-module__wrapper","errorWrapper":"Results-module__errorWrapper","errorHeader":"Results-module__errorHeader","errorIcon":"Results-module__errorIcon","errorHeaderTitle":"Results-module__errorHeaderTitle","errorContent":"Results-module__errorContent","errorLabel":"Results-module__errorLabel","errorText":"Results-module__errorText"});
;// ./src/modules/Nodes/components/Results/Results.tsx





const ResultsError = ({ style, errorObject }) => {
    return ((0,jsx_runtime.jsxs)("div", { className: Results_module.errorWrapper, style: style, "data-testid": "results-wrapper", children: [(0,jsx_runtime.jsxs)("div", { className: Results_module.errorHeader, children: [(0,jsx_runtime.jsx)("div", { className: Results_module.errorIcon, children: (0,jsx_runtime.jsx)(Icons_ErrorIcon, { height: 20, width: 20 }) }), (0,jsx_runtime.jsx)("div", { className: Results_module.errorHeaderTitle, children: "Error" })] }), (0,jsx_runtime.jsxs)("div", { className: Results_module.errorContent, children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("div", { className: Results_module.errorLabel, children: "Error occurred:" }), (0,jsx_runtime.jsx)("div", { className: Results_module.errorText, children: errorObject.message })] }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("div", { className: Results_module.errorLabel, children: "Error traceback:" }), (0,jsx_runtime.jsx)("div", { className: Results_module.errorText, children: (errorObject.traceback ?? []).map((row, index) => ((0,jsx_runtime.jsx)("div", { children: row }, `${row}-${index}`))) })] })] })] }));
};
const Results = ({ title, jsonObject, showSearch = true, toggleSwitch = false, pageName, style, errorObject }) => {
    if (errorObject) {
        return (0,jsx_runtime.jsx)(ResultsError, { style: style, errorObject: errorObject });
    }
    return ((0,jsx_runtime.jsx)("div", { className: Results_module.wrapper, style: style, "data-testid": "results-wrapper", children: (0,jsx_runtime.jsx)(JSONEditor, { title: title ?? "Results", jsonDataProp: jsonObject, height: "100%", showSearch: showSearch, toggleSwitch: toggleSwitch, pageName: pageName }) }));
};

;// ./src/modules/Nodes/index.tsx



// eslint-disable-next-line css-modules/no-unused-class









const NodesPage = () => {
    const { runStatus } = useWebSocketData();
    const { fetchAllNodes, isRescanningNodes, results } = useNodesContext();
    const { topBarAdditionalComponents, setTopBarAdditionalComponents } = FlexLayoutContext_useFlexLayoutContext();
    const NodeTopBarRefreshButton = () => {
        return ((0,jsx_runtime.jsx)("div", { className: NodesPage_module.refreshButtonWrapper, "data-testid": "refresh-button", children: (0,jsx_runtime.jsx)(Button_BlueButton, { onClick: () => fetchAllNodes(true), children: "Refresh" }) }));
    };
    (0,react.useEffect)(() => {
        setTopBarAdditionalComponents({ ...topBarAdditionalComponents, nodes: (0,jsx_runtime.jsx)(NodeTopBarRefreshButton, {}) });
    }, []);
    return ((0,jsx_runtime.jsx)("div", { className: NodesPage_module.wrapper, "data-testid": "nodes-page-wrapper", children: (0,jsx_runtime.jsxs)("div", { className: NodesPage_module.nodesAndRunningJobInfoWrapper, "data-testid": "nodes-and-job-wrapper", children: [(0,jsx_runtime.jsx)("div", { className: NodesPage_module.nodesContainerTop, children: (0,jsx_runtime.jsxs)("div", { className: NodesPage_module.nodeElementListWrapper, children: [isRescanningNodes && ((0,jsx_runtime.jsxs)("div", { className: NodesPage_module.loadingContainer, children: [(0,jsx_runtime.jsx)(CircularProgress/* default */.A, { size: 32 }), "Node library scan in progress", (0,jsx_runtime.jsxs)("div", { children: ["See ", (0,jsx_runtime.jsx)("span", { className: NodesPage_module.logsText, children: "LOGS" }), " for details (bottomright)", " "] })] })), !isRescanningNodes && (0,jsx_runtime.jsx)(NodeElementList, {})] }) }), (0,jsx_runtime.jsxs)("div", { className: NodesPage_module.nodesContainerDown, children: [(0,jsx_runtime.jsx)("div", { className: NodesPage_module.nodeRunningJobInfoWrapper, children: (0,jsx_runtime.jsx)(RunningJob, {}) }), (0,jsx_runtime.jsx)(Results, { jsonObject: results ?? {}, showSearch: false, toggleSwitch: true, pageName: "nodes", errorObject: runStatus?.node?.run_results?.error })] })] }) }));
};
/* harmony default export */ var Nodes = (() => ((0,jsx_runtime.jsx)(SelectionContextProvider, { children: (0,jsx_runtime.jsx)(NodesPage, {}) })));

;// ./src/modules/GraphLibrary/GraphLibrary.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var GraphLibrary_module = ({"wrapper":"GraphLibrary-module__wrapper","nodesContainer":"GraphLibrary-module__nodesContainer","refreshButtonWrapper":"GraphLibrary-module__refreshButtonWrapper","searchAndRefresh":"GraphLibrary-module__searchAndRefresh","buttonWrapper":"GraphLibrary-module__buttonWrapper","listWrapper":"GraphLibrary-module__listWrapper","loadingContainer":"GraphLibrary-module__loadingContainer","logsText":"GraphLibrary-module__logsText"});
;// ./src/modules/GraphLibrary/components/GraphElement/GraphElement.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var GraphElement_module = ({"searchContainer":"GraphElement-module__searchContainer","wrapper":"GraphElement-module__wrapper","upperContainer":"GraphElement-module__upperContainer","bottomContainer":"GraphElement-module__bottomContainer","parametersContainer":"GraphElement-module__parametersContainer","graphContainer":"GraphElement-module__graphContainer","graphContainerVisible":"GraphElement-module__graphContainerVisible","leftContainer":"GraphElement-module__leftContainer","rightContainer":"GraphElement-module__rightContainer","runButtonWrapper":"GraphElement-module__runButtonWrapper","refreshButtonWrapper":"GraphElement-module__refreshButtonWrapper","calibrationGraphSelected":"GraphElement-module__calibrationGraphSelected"});
;// ./src/modules/common/Parameters/ParameterList.tsx






const ParameterList = ({ showParameters = false, mapOfItems }) => {
    const { allGraphs, setAllGraphs, selectedWorkflowName } = useGraphContext();
    const updateParameter = (paramKey, newValue, node) => {
        const updatedParameters = {
            ...node?.parameters,
            [paramKey]: {
                ...(node?.parameters)[paramKey],
                default: newValue,
            },
        };
        const changedNode = { ...node, parameters: updatedParameters };
        const nodeName = node?.name;
        if (nodeName && selectedWorkflowName && allGraphs?.[selectedWorkflowName]) {
            const changedNodeSInWorkflow = {
                ...allGraphs[selectedWorkflowName].nodes,
                [nodeName]: changedNode,
            };
            const updatedWorkflow = {
                ...allGraphs[selectedWorkflowName],
                nodes: changedNodeSInWorkflow,
            };
            const updatedCalibrationGraphs = {
                ...allGraphs,
                [selectedWorkflowName]: updatedWorkflow,
            };
            setAllGraphs(updatedCalibrationGraphs);
        }
    };
    const getInputElement = (key, parameter, node) => {
        switch (parameter.type) {
            case "boolean":
                return ((0,jsx_runtime.jsx)(Checkbox/* default */.A, { checked: parameter.default, onClick: () => updateParameter(key, !parameter.default, node), inputProps: { "aria-label": "controlled" } }));
            default:
                return ((0,jsx_runtime.jsx)(Input_InputField, { placeholder: key, value: parameter.default ? parameter.default.toString() : "", onChange: (val) => {
                        updateParameter(key, val, node);
                    } }));
        }
    };
    return ((0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: Object.entries(mapOfItems ?? {}).map(([key, parameter]) => {
            return ((0,jsx_runtime.jsx)(Parameters, { show: showParameters, showTitle: true, title: parameter.name, currentItem: parameter, getInputElement: getInputElement }, key));
        }) }));
};

// EXTERNAL MODULE: ./node_modules/cytoscape/dist/cytoscape.esm.mjs
var cytoscape_esm = __webpack_require__(165);
;// ./src/modules/GraphLibrary/components/CytoscapeGraph/config/Cytoscape.ts
const CytoscapeLayout = {
    name: "cose",
    fit: true,
    padding: 30,
    spacingFactor: 1.5,
    animate: true,
    klay: {
        direction: "RIGHT",
    },
};

;// ./src/modules/GraphLibrary/components/CytoscapeGraph/CytoscapeGraph.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var CytoscapeGraph_module = ({"wrapper":"CytoscapeGraph-module__wrapper"});
// EXTERNAL MODULE: ./node_modules/cytoscape-klay/cytoscape-klay.js
var cytoscape_klay = __webpack_require__(7503);
var cytoscape_klay_default = /*#__PURE__*/__webpack_require__.n(cytoscape_klay);
;// ./src/modules/GraphLibrary/components/CytoscapeGraph/CytoscapeGraph.tsx









cytoscape_esm/* default */.A.use((cytoscape_klay_default()));
cytoscape_esm/* default */.A.warnings(false);
function CytoscapeGraph({ elements, onNodeClick }) {
    const getNodeIcon = (nodeName) => {
        return `/assets/icons/${nodeName}.svg`;
    };
    const wrapCytoscapeElements = (elements) => {
        return elements.map((el) => {
            return {
                ...el,
                style: {
                    backgroundImage: getNodeIcon(el.group ? el.group.toString() : ""),
                },
            };
        });
    };
    const cytoscapeElements = wrapCytoscapeElements(elements);
    const { selectedNodeNameInWorkflow, setSelectedNodeNameInWorkflow } = useGraphContext();
    const { setSelectedItemName } = useSelectionContext();
    const { setTrackLatest } = useGraphStatusContext();
    const cy = (0,react.useRef)();
    const divRef = (0,react.useRef)(null);
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
    (0,react.useEffect)(() => {
        if (elements) {
            if (!cy.current) {
                cy.current = (0,cytoscape_esm/* default */.A)({
                    container: divRef.current,
                    elements: cytoscapeElements,
                    style,
                    layout: CytoscapeLayout,
                    zoom: 1,
                    minZoom: 0.1,
                    maxZoom: 1.6,
                    wheelSensitivity: 0.1,
                });
            }
            else {
                // update style around node if its status is changed
                cy.current.batch(() => {
                    const allElements = cy.current?.elements() ?? [];
                    allElements.forEach((element) => {
                        const newElement = elements?.find((s) => s.data.id === element.id());
                        if (newElement) {
                            element.classes(newElement.classes);
                        }
                    });
                });
            }
        }
    }, [elements]);
    (0,react.useEffect)(() => {
        if (selectedNodeNameInWorkflow) {
            cy.current?.nodes().unselect();
            const targetNode = cy.current?.getElementById(selectedNodeNameInWorkflow);
            if (targetNode) {
                targetNode.select();
            }
        }
        else {
            cy.current?.nodes().unselect();
        }
    }, [selectedNodeNameInWorkflow]);
    (0,react.useEffect)(() => {
        const onClickN = (e) => {
            setTrackLatest(false);
            setSelectedNodeNameInWorkflow(e.target.data().id);
            if (onNodeClick) {
                onNodeClick(e.target.data().id);
            }
        };
        cy.current?.nodes().on("click", onClickN);
        return () => {
            cy.current?.nodes().off("click", "node");
        };
    }, [setSelectedNodeNameInWorkflow, cy.current]);
    (0,react.useEffect)(() => {
        const onClick = (e) => {
            if (e.target === cy.current) {
                setSelectedItemName(undefined);
                setSelectedNodeNameInWorkflow(undefined);
            }
        };
        cy.current?.on("click", onClick);
        return () => {
            cy.current?.off("click", onClick);
        };
    }, [setSelectedNodeNameInWorkflow, cy.current]);
    return (0,jsx_runtime.jsx)("div", { ref: divRef, className: CytoscapeGraph_module.wrapper });
}

;// ./src/modules/GraphLibrary/components/GraphElementErrorWrapper/GraphElementErrorWrapper.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var GraphElementErrorWrapper_module = ({"wrapper":"GraphElementErrorWrapper-module__wrapper","titleAndIconWrapper":"GraphElementErrorWrapper-module__titleAndIconWrapper","arrowIconWrapper":"GraphElementErrorWrapper-module__arrowIconWrapper","errorObjectWrapper":"GraphElementErrorWrapper-module__errorObjectWrapper"});
;// ./src/modules/GraphLibrary/components/GraphElementErrorWrapper/GraphElementErrorWrapper.tsx




const GraphElementErrorWrapper = ({ errorObject }) => {
    const [expanded, setExpanded] = react.useState(!!errorObject);
    (0,react.useEffect)(() => {
        if (errorObject) {
            setExpanded(true);
        }
        else {
            setExpanded(false);
        }
    }, [errorObject]);
    return ((0,jsx_runtime.jsxs)("div", { className: GraphElementErrorWrapper_module.wrapper, children: [errorObject !== undefined && ((0,jsx_runtime.jsxs)("div", { className: GraphElementErrorWrapper_module.titleAndIconWrapper, children: [(0,jsx_runtime.jsx)("div", { className: GraphElementErrorWrapper_module.arrowIconWrapper, onClick: () => {
                            setExpanded(!expanded);
                        }, children: (0,jsx_runtime.jsx)(ArrowIcon, { options: { rotationDegree: expanded ? 0 : -90 } }) }), "Error"] })), expanded && (0,jsx_runtime.jsx)("div", { className: GraphElementErrorWrapper_module.errorObjectWrapper, children: JSON.stringify(errorObject) })] }));
};

;// ./src/modules/GraphLibrary/components/GraphElement/GraphElement.tsx


// eslint-disable-next-line css-modules/no-unused-class













const GraphElement = ({ calibrationGraphKey, calibrationGraph }) => {
    const [errorObject, setErrorObject] = (0,react.useState)(undefined);
    const { selectedItemName, setSelectedItemName } = useSelectionContext();
    const { workflowGraphElements, setSelectedWorkflowName, allGraphs, setAllGraphs, selectedWorkflowName, lastRunInfo, setLastRunInfo, fetchWorkflowGraph, } = useGraphContext();
    const { openTab, setActiveTabsetName } = FlexLayoutContext_useFlexLayoutContext();
    const updateParameter = (paramKey, newValue, workflow) => {
        const updatedParameters = {
            ...workflow?.parameters,
            [paramKey]: {
                ...(workflow?.parameters)[paramKey],
                default: newValue,
            },
        };
        if (selectedWorkflowName && allGraphs?.[selectedWorkflowName]) {
            const updatedWorkflow = {
                ...allGraphs[selectedWorkflowName],
                parameters: updatedParameters,
            };
            const updatedCalibrationGraphs = {
                ...allGraphs,
                [selectedWorkflowName]: updatedWorkflow,
            };
            setAllGraphs(updatedCalibrationGraphs);
        }
    };
    const getInputElement = (key, parameter, node) => {
        switch (parameter.type) {
            case "boolean":
                return ((0,jsx_runtime.jsx)(Checkbox/* default */.A, { checked: parameter.default, 
                    // onClick={() => updateParameter(key, !parameter.default, node)}
                    inputProps: { "aria-label": "controlled" } }));
            default:
                return ((0,jsx_runtime.jsx)(Input_InputField, { placeholder: key, value: parameter.default ? parameter.default.toString() : "", onChange: (val) => {
                        updateParameter(key, val, node);
                    } }));
        }
    };
    const transformDataForSubmit = () => {
        const input = allGraphs?.[selectedWorkflowName ?? ""];
        const workflowParameters = input?.parameters;
        const transformParameters = (params) => {
            let transformedParams = {};
            for (const key in params) {
                transformedParams = { ...transformedParams, [key]: params[key].default };
            }
            return transformedParams;
        };
        const transformedGraph = {
            parameters: transformParameters(workflowParameters),
            nodes: {},
        };
        for (const nodeKey in input?.nodes) {
            const node = input?.nodes[nodeKey];
            transformedGraph.nodes[nodeKey] = {
                parameters: transformParameters(node.parameters),
            };
        }
        return transformedGraph;
    };
    const handleSubmit = async () => {
        if (selectedWorkflowName) {
            setLastRunInfo({
                ...lastRunInfo,
                active: true,
            });
            const response = await GraphLibraryApi.submitWorkflow(selectedWorkflowName, transformDataForSubmit());
            if (response.isOk) {
                openTab("graph-status");
                setActiveTabsetName("graph-status");
            }
            else {
                setErrorObject(response.error);
            }
        }
    };
    const show = selectedItemName === calibrationGraphKey;
    return ((0,jsx_runtime.jsxs)("div", { className: classNames(GraphElement_module.wrapper, show ? GraphElement_module.calibrationGraphSelected : ""), onClick: async () => {
            await fetchWorkflowGraph(calibrationGraphKey);
            setSelectedItemName(calibrationGraphKey);
            setSelectedWorkflowName(calibrationGraphKey);
        }, children: [(0,jsx_runtime.jsxs)("div", { className: GraphElement_module.upperContainer, children: [(0,jsx_runtime.jsxs)("div", { className: GraphElement_module.leftContainer, children: [(0,jsx_runtime.jsx)("div", { children: calibrationGraphKey }), (0,jsx_runtime.jsx)("div", { className: GraphElement_module.runButtonWrapper, children: (0,jsx_runtime.jsx)(Button_BlueButton, { disabled: !show, onClick: handleSubmit, children: "Run" }) })] }), "\u00A0 \u00A0 \u00A0 \u00A0", calibrationGraph?.description && ((0,jsx_runtime.jsx)("div", { className: GraphElement_module.rightContainer, children: (0,jsx_runtime.jsx)("div", { children: calibrationGraph?.description }) }))] }), (0,jsx_runtime.jsxs)("div", { className: GraphElement_module.bottomContainer, children: [(0,jsx_runtime.jsxs)("div", { className: GraphElement_module.parametersContainer, children: [(0,jsx_runtime.jsx)(GraphElementErrorWrapper, { errorObject: errorObject }), (0,jsx_runtime.jsx)(Parameters, { show: show, showTitle: true, currentItem: calibrationGraph, getInputElement: getInputElement }, calibrationGraphKey), (0,jsx_runtime.jsx)(ParameterList, { showParameters: show, mapOfItems: calibrationGraph.nodes })] }), show && ((0,jsx_runtime.jsx)("div", { className: GraphElement_module.graphContainer, children: workflowGraphElements && (0,jsx_runtime.jsx)(CytoscapeGraph, { elements: workflowGraphElements }) }))] })] }));
};

;// ./src/modules/GraphLibrary/components/GraphList.tsx


// eslint-disable-next-line css-modules/no-unused-class



const GraphList = () => {
    const { allGraphs } = useGraphContext();
    if (!allGraphs || Object.entries(allGraphs).length === 0)
        return (0,jsx_runtime.jsx)("div", { children: "No calibration graphs" });
    return ((0,jsx_runtime.jsx)("div", { className: GraphLibrary_module.listWrapper, children: Object.entries(allGraphs ?? {}).map(([key, graph]) => {
            return (0,jsx_runtime.jsx)(GraphElement, { calibrationGraphKey: key, calibrationGraph: graph }, key);
        }) }));
};

;// ./src/modules/GraphLibrary/index.tsx


// eslint-disable-next-line css-modules/no-unused-class







const GraphLibrary = () => {
    const { fetchAllCalibrationGraphs, isRescanningGraphs } = useGraphContext();
    const { topBarAdditionalComponents, setTopBarAdditionalComponents } = FlexLayoutContext_useFlexLayoutContext();
    const GraphLibraryTopBarRefreshButton = () => {
        const onClickHandler = (0,react.useCallback)(() => fetchAllCalibrationGraphs(true), [fetchAllCalibrationGraphs]);
        return ((0,jsx_runtime.jsx)("div", { className: GraphLibrary_module.buttonWrapper, children: (0,jsx_runtime.jsx)(Button_BlueButton, { onClick: onClickHandler, children: "Refresh" }) }));
    };
    (0,react.useEffect)(() => {
        setTopBarAdditionalComponents({
            ...topBarAdditionalComponents,
            "graph-library": (0,jsx_runtime.jsx)(GraphLibraryTopBarRefreshButton, {}),
        });
    }, []);
    return ((0,jsx_runtime.jsx)("div", { className: GraphLibrary_module.wrapper, children: (0,jsx_runtime.jsxs)("div", { className: GraphLibrary_module.nodesContainer, children: [isRescanningGraphs && ((0,jsx_runtime.jsxs)("div", { className: GraphLibrary_module.loadingContainer, children: [(0,jsx_runtime.jsx)(CircularProgress/* default */.A, { size: 32 }), "Graph library scan in progress", (0,jsx_runtime.jsxs)("div", { children: ["See ", (0,jsx_runtime.jsx)("span", { className: GraphLibrary_module.logsText, children: "LOGS" }), " for details (bottomright)"] })] })), (0,jsx_runtime.jsx)(GraphList, {})] }) }));
};
/* harmony default export */ var modules_GraphLibrary = (() => ((0,jsx_runtime.jsx)(SelectionContextProvider, { children: (0,jsx_runtime.jsx)(GraphLibrary, {}) })));

;// ./src/ui-lib/Icons/GraphLibraryIcon.tsx


const GraphLibraryIcon = ({ width = 25, height = 24, className, }) => {
    return ((0,jsx_runtime.jsxs)("svg", { className: className, xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 25 24", fill: "none", children: [(0,jsx_runtime.jsxs)("g", { clipPath: "url(#clip0)", children: [(0,jsx_runtime.jsx)("circle", { cx: "20.5", cy: "19.5", r: "3.5", stroke: "#ffffff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("circle", { cx: "13", cy: "12", r: "3.5", stroke: "#ffffff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("circle", { cx: "4.5", cy: "4.5", r: "3.5", stroke: "#ffffff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("path", { d: "M7 7L10.5 10", stroke: "#ffffff", strokeWidth: "1.5" }), (0,jsx_runtime.jsx)("path", { d: "M15.5 14L18.5 17", stroke: "#ffffff", strokeWidth: "1.5" }), (0,jsx_runtime.jsx)("path", { d: "M24.5 2.63398C25.1667 3.01888 25.1667 3.98113 24.5 4.36603L20.75 6.53109C20.0833 6.91599 19.25 6.43486 19.25 5.66506L19.25 1.33493C19.25 0.565134 20.0833 0.0840107 20.75 0.468911L24.5 2.63398Z", fill: "#18DAA4" })] }), (0,jsx_runtime.jsx)("defs", { children: (0,jsx_runtime.jsx)("clipPath", { id: "clip0", children: (0,jsx_runtime.jsx)("rect", { width: "25", height: "24", fill: "white" }) }) })] }));
};
/* harmony default export */ var Icons_GraphLibraryIcon = (GraphLibraryIcon);

;// ./src/ui-lib/Icons/GraphStatusIcon.tsx


const GraphStatusIcon_GraphStatusIcon = ({ width = 25, height = 24, className, }) => {
    return ((0,jsx_runtime.jsxs)("svg", { className: className, xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 25 24", fill: "none", children: [(0,jsx_runtime.jsxs)("g", { clipPath: "url(#clip0)", children: [(0,jsx_runtime.jsx)("circle", { cx: "20.5", cy: "19.5", r: "3.5", stroke: "#ffffff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("circle", { cx: "13", cy: "12", r: "3.5", stroke: "#ffffff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("circle", { cx: "4.5", cy: "4.5", r: "3.5", stroke: "#ffffff", strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("path", { d: "M7 7L10.5 10", stroke: "#ffffff", strokeWidth: "1.5" }), (0,jsx_runtime.jsx)("path", { d: "M15.5 14L18.5 17", stroke: "#ffffff", strokeWidth: "1.5" }), (0,jsx_runtime.jsx)("path", { d: "M19 3.5C19 4.88071 20.1193 6 21.5 6C22.8807 6 24 4.88071 24 3.5C24 2.11929 22.8807 1 21.5 1", stroke: "#3CDEF8", strokeWidth: "1.6", strokeLinecap: "round" })] }), (0,jsx_runtime.jsx)("defs", { children: (0,jsx_runtime.jsx)("clipPath", { id: "clip0", children: (0,jsx_runtime.jsx)("rect", { width: "25", height: "24", fill: "white" }) }) })] }));
};
/* harmony default export */ var Icons_GraphStatusIcon = (GraphStatusIcon_GraphStatusIcon);

;// ./src/modules/GraphLibrary/components/GraphStatus/GraphStatus.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var GraphStatus_module = ({"wrapper":"GraphStatus-module__wrapper","graphContainer":"GraphStatus-module__graphContainer","graphAndHistoryWrapper":"GraphStatus-module__graphAndHistoryWrapper","leftContainer":"GraphStatus-module__leftContainer","rightContainer":"GraphStatus-module__rightContainer"});
;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementHistory/MeasurementHistory.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var MeasurementHistory_module = ({"wrapper":"MeasurementHistory-module__wrapper","titleRow":"MeasurementHistory-module__titleRow","title":"MeasurementHistory-module__title","trackLatestWrapper":"MeasurementHistory-module__trackLatestWrapper","toggleSwitch":"MeasurementHistory-module__toggleSwitch","toggleOn":"MeasurementHistory-module__toggleOn","toggleOff":"MeasurementHistory-module__toggleOff","toggleKnob":"MeasurementHistory-module__toggleKnob","contentContainer":"MeasurementHistory-module__contentContainer","lowerContainer":"MeasurementHistory-module__lowerContainer"});
;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementElementList/MeasurementElementList.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var MeasurementElementList_module = ({"wrapper":"MeasurementElementList-module__wrapper"});
;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementElementList/MeasurementElementList.tsx




const MeasurementElementList = ({ listOfMeasurements }) => {
    return ((0,jsx_runtime.jsx)("div", { className: MeasurementElementList_module.wrapper, children: listOfMeasurements.map((el, index) => ((0,jsx_runtime.jsx)(MeasurementElement, { element: el, dataMeasurementId: el.metadata?.name ?? "" }, `${el.id ?? el.metadata?.name ?? "-"}-${index}`))) }));
};

;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementHistory/MeasurementHistory.tsx








const MeasurementHistory = ({ title = "Execution history" }) => {
    const { allMeasurements, trackLatest, setTrackLatest } = useGraphStatusContext();
    const { trackLatestSidePanel, fetchOneSnapshot, setLatestSnapshotId, setResult, setDiffData } = useSnapshotsContext();
    const { setSelectedNodeNameInWorkflow } = useGraphContext();
    const { setSelectedItemName } = useSelectionContext();
    const [latestId, setLatestId] = (0,react.useState)();
    const [latestName, setLatestName] = (0,react.useState)();
    const handleOnClick = () => {
        setTrackLatest(!trackLatest);
    };
    (0,react.useEffect)(() => {
        if (trackLatest) {
            if (allMeasurements) {
                const element = allMeasurements[0];
                // if (element) {
                if (element && (element.id !== latestId || element.metadata?.name !== latestName)) {
                    setLatestId(element.id);
                    setLatestName(element.metadata?.name);
                    setSelectedItemName(element?.metadata?.name);
                    setSelectedNodeNameInWorkflow(allMeasurements[0]?.metadata?.name);
                    if (element.id) {
                        setLatestSnapshotId(element.id);
                        if (trackLatestSidePanel) {
                            fetchOneSnapshot(element.id, element.id - 1, true, true);
                        }
                        else {
                            fetchOneSnapshot(element.id);
                        }
                        // if (trackLatestSidePanel) {
                        //   fetchOneSnapshot(element.id, element.id - 1, true);
                        // } else {
                        //   fetchOneSnapshot(element.id);
                        // }
                    }
                    else {
                        setResult({});
                        setDiffData({});
                    }
                }
            }
        }
    }, [trackLatest, setTrackLatest, allMeasurements, latestId, latestName]);
    return ((0,jsx_runtime.jsxs)("div", { className: MeasurementHistory_module.wrapper, children: [(0,jsx_runtime.jsxs)("div", { className: MeasurementHistory_module.titleRow, children: [(0,jsx_runtime.jsx)("div", { className: MeasurementHistory_module.title, children: title }), (0,jsx_runtime.jsxs)("div", { className: MeasurementHistory_module.trackLatestWrapper, children: [(0,jsx_runtime.jsx)("span", { children: "Track latest" }), (0,jsx_runtime.jsx)("div", { className: `${MeasurementHistory_module.toggleSwitch} ${trackLatest ? MeasurementHistory_module.toggleOn : MeasurementHistory_module.toggleOff}`, onClick: handleOnClick, children: (0,jsx_runtime.jsx)("div", { className: `${MeasurementHistory_module.toggleKnob} ${trackLatest ? MeasurementHistory_module.toggleOn : MeasurementHistory_module.toggleOff}` }) })] })] }), allMeasurements && allMeasurements?.length > 0 && ((0,jsx_runtime.jsx)("div", { className: MeasurementHistory_module.contentContainer, children: (0,jsx_runtime.jsx)(MeasurementElementList, { listOfMeasurements: allMeasurements }) })), (!allMeasurements || allMeasurements?.length === 0) && ((0,jsx_runtime.jsx)("div", { className: MeasurementHistory_module.contentContainer, children: (0,jsx_runtime.jsx)("div", { className: MeasurementHistory_module.lowerContainer, children: "No measurements found" }) }))] }));
};

;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementElementGraph/MeasurementElementGraph.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var MeasurementElementGraph_module = ({"calibrationTitle":"MeasurementElementGraph-module__calibrationTitle","dot":"MeasurementElementGraph-module__dot","defaultBlue":"MeasurementElementGraph-module__defaultBlue","blinkingYellow":"MeasurementElementGraph-module__blinkingYellow","blink-animation":"MeasurementElementGraph-module__blink-animation","blinkAnimation":"MeasurementElementGraph-module__blink-animation","solidGreen":"MeasurementElementGraph-module__solidGreen","wrapper":"MeasurementElementGraph-module__wrapper","insideWrapper":"MeasurementElementGraph-module__insideWrapper","lowerContainer":"MeasurementElementGraph-module__lowerContainer","lowerUpperContainer":"MeasurementElementGraph-module__lowerUpperContainer","label":"MeasurementElementGraph-module__label","tuneUpName":"MeasurementElementGraph-module__tuneUpName","lowerUpperLeftContainer":"MeasurementElementGraph-module__lowerUpperLeftContainer","lowerUpperRightContainer":"MeasurementElementGraph-module__lowerUpperRightContainer","lowerLowerContainer":"MeasurementElementGraph-module__lowerLowerContainer"});
;// ./src/modules/GraphLibrary/components/GraphStatus/components/MeasurementElementGraph/MeasurementElementGraph.tsx









const MeasurementElementGraph = ({ workflowGraphElements, onCytoscapeNodeClick }) => {
    const { runStatus } = useWebSocketData();
    const isRunning = runStatus?.graph?.status === "running";
    const graphProgressMessage = runStatus?.graph?.finished_nodes && runStatus?.graph?.total_nodes
        ? `${runStatus?.graph?.finished_nodes}/${runStatus?.graph?.total_nodes} node${runStatus?.graph?.finished_nodes > 1 ? "s" : ""} completed`
        : "-";
    const handleStopClick = (0,react.useCallback)(() => {
        SnapshotsApi.stopNodeRunning();
    }, []);
    return ((0,jsx_runtime.jsxs)("div", { className: MeasurementElementGraph_module.wrapper, children: [(0,jsx_runtime.jsxs)("div", { className: MeasurementElementGraph_module.calibrationTitle, children: [(0,jsx_runtime.jsx)("span", { className: classNames(MeasurementElementGraph_module.dot, isRunning ? MeasurementElementGraph_module.blinkingYellow : runStatus?.graph?.status === "finished" ? MeasurementElementGraph_module.solidGreen : MeasurementElementGraph_module.defaultBlue) }), (0,jsx_runtime.jsx)("span", { className: MeasurementElementGraph_module.label, children: "Active Calibration Graph:" }), (0,jsx_runtime.jsx)("span", { className: MeasurementElementGraph_module.tuneUpName, children: runStatus?.graph?.name || "Unknown Tune-up" })] }), (0,jsx_runtime.jsx)("div", { className: MeasurementElementGraph_module.insideWrapper, children: (0,jsx_runtime.jsxs)("div", { className: MeasurementElementGraph_module.lowerContainer, children: [(0,jsx_runtime.jsxs)("div", { className: MeasurementElementGraph_module.lowerUpperContainer, children: [(0,jsx_runtime.jsxs)("div", { className: MeasurementElementGraph_module.lowerUpperLeftContainer, children: [(0,jsx_runtime.jsxs)("div", { children: ["Status: ", runStatus?.graph?.status] }), (0,jsx_runtime.jsxs)("div", { children: ["Run duration:\u00A0", runStatus?.graph?.run_duration ? `${runStatus?.graph?.run_duration}s` : undefined] }), (0,jsx_runtime.jsxs)("div", { children: ["Graph progress:\u00A0", graphProgressMessage ?? (0,jsx_runtime.jsx)(CircularProgress/* default */.A, { size: "2rem" })] })] }), (0,jsx_runtime.jsx)("div", { className: MeasurementElementGraph_module.lowerUpperRightContainer, children: runStatus?.graph?.status === "running" && (0,jsx_runtime.jsx)(Button_BlueButton, { onClick: handleStopClick, children: "Stop" }) })] }), (0,jsx_runtime.jsx)("div", { className: MeasurementElementGraph_module.lowerLowerContainer, children: (0,jsx_runtime.jsx)(CytoscapeGraph, { elements: workflowGraphElements, onNodeClick: onCytoscapeNodeClick }) })] }) })] }));
};

;// ./src/modules/GraphLibrary/components/GraphStatus/GraphStatus.tsx


// eslint-disable-next-line css-modules/no-unused-class









const GraphStatus = () => {
    const { runStatus } = useWebSocketData();
    const { selectedItemName, setSelectedItemName } = useSelectionContext();
    const { workflowGraphElements, lastRunInfo } = useGraphContext();
    const { allMeasurements, fetchAllMeasurements, setTrackLatest } = useGraphStatusContext();
    const { result, fetchOneSnapshot, setResult, setDiffData, setSelectedSnapshotId, setClickedForSnapshotSelection } = useSnapshotsContext();
    const getMeasurementId = (measurementName, measurements) => {
        return measurements?.find((measurement) => measurement.metadata?.name === measurementName)?.id;
    };
    const setupAllMeasurements = async () => {
        if (!allMeasurements || allMeasurements.length === 0) {
            return await fetchAllMeasurements();
        }
        return [];
    };
    const handleOnCytoscapeNodeClick = async (name) => {
        const temp = await setupAllMeasurements();
        const measurements = temp && temp.length > 0 ? temp : (allMeasurements ?? []);
        setTrackLatest(false);
        setSelectedItemName(undefined);
        const measurementId = getMeasurementId(name, measurements);
        if (measurementId) {
            setSelectedItemName(name);
            setSelectedSnapshotId(measurementId);
            setClickedForSnapshotSelection(true);
            fetchOneSnapshot(measurementId, measurementId - 1, true, true);
        }
        else {
            setResult({});
            setDiffData({});
        }
    };
    return ((0,jsx_runtime.jsxs)("div", { className: GraphStatus_module.wrapper, children: [(0,jsx_runtime.jsx)("div", { className: GraphStatus_module.leftContainer, children: (0,jsx_runtime.jsxs)("div", { className: GraphStatus_module.graphAndHistoryWrapper, children: [workflowGraphElements && ((0,jsx_runtime.jsx)(MeasurementElementGraph, { workflowGraphElements: workflowGraphElements, onCytoscapeNodeClick: handleOnCytoscapeNodeClick }, `${runStatus?.graph?.name}-${runStatus?.graph?.total_nodes}`)), (0,jsx_runtime.jsx)(MeasurementHistory, {})] }) }), (0,jsx_runtime.jsx)("div", { className: GraphStatus_module.rightContainer, children: (0,jsx_runtime.jsx)(Results, { jsonObject: selectedItemName && allMeasurements && allMeasurements.length > 0 && result ? result : {}, toggleSwitch: true, pageName: "graph-status", style: { height: "100%", flex: "0 1 auto" }, errorObject: selectedItemName === lastRunInfo?.activeNodeName ? lastRunInfo?.error : undefined }) })] }));
};
/* harmony default export */ var GraphStatus_GraphStatus = (() => ((0,jsx_runtime.jsx)(GraphStatusContextProvider, { children: (0,jsx_runtime.jsx)(SelectionContextProvider, { children: (0,jsx_runtime.jsx)(GraphStatus, {}) }) })));

;// ./src/modules/Data/Data.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Data_module = ({"wrapper":"Data-module__wrapper","dataWrapper":"Data-module__dataWrapper","data":"Data-module__data","explorer":"Data-module__explorer","viewer":"Data-module__viewer"});
// EXTERNAL MODULE: ./node_modules/@mui/material/Pagination/Pagination.js + 8 modules
var Pagination = __webpack_require__(6378);
;// ./src/modules/Pagination/PaginationWrapper.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var PaginationWrapper_module = ({"wrapper":"PaginationWrapper-module__wrapper"});
;// ./src/modules/Pagination/PaginationWrapper.tsx




const PaginationWrapper = ({ numberOfPages, defaultPage = 1, siblingCount = 0, boundaryCount = 2, setPageNumber, }) => {
    return ((0,jsx_runtime.jsx)("div", { className: PaginationWrapper_module.wrapper, children: (0,jsx_runtime.jsx)(Pagination/* default */.A, { sx: {
                "& .Mui-selected": {
                    opacity: "initial",
                    color: "#2CCBE5",
                    backgroundColor: "transparent !important",
                },
            }, count: numberOfPages, defaultPage: defaultPage, siblingCount: siblingCount, boundaryCount: boundaryCount, onChange: (event, page) => {
                setPageNumber(page);
            } }) }));
};
/* harmony default export */ var Pagination_PaginationWrapper = (PaginationWrapper);

;// ./src/modules/Data/components/SnapshotElement/SnapshotElement.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var SnapshotElement_module = ({"wrapper":"SnapshotElement-module__wrapper","headerWrapper":"SnapshotElement-module__headerWrapper","titleWrapper":"SnapshotElement-module__titleWrapper","idWrapper":"SnapshotElement-module__idWrapper","nameWrapper":"SnapshotElement-module__nameWrapper","additionalWidth":"SnapshotElement-module__additionalWidth","outcomesWrapper":"SnapshotElement-module__outcomesWrapper"});
;// ./src/modules/Data/components/SnapshotElement/SnapshotElement.tsx



// eslint-disable-next-line css-modules/no-unused-class





const SnapshotElement = ({ el, isSelected, handleOnClick, }) => {
    const { jsonData } = useSnapshotsContext();
    return ((0,jsx_runtime.jsxs)("div", { className: SnapshotElement_module.wrapper, children: [(0,jsx_runtime.jsxs)("div", { className: SnapshotElement_module.headerWrapper, onClick: handleOnClick, children: [(0,jsx_runtime.jsx)("div", { className: SnapshotElement_module.titleWrapper, children: (0,jsx_runtime.jsx)("div", { className: MeasurementElement_module.dot }) }), (0,jsx_runtime.jsxs)("div", { className: SnapshotElement_module.idWrapper, children: ["#", el.id] }), (0,jsx_runtime.jsx)("div", { className: SnapshotElement_module.nameWrapper, children: el.metadata?.name })] }), isSelected && ((0,jsx_runtime.jsxs)("div", { className: MeasurementElement_module.expandedContent, children: [(0,jsx_runtime.jsxs)("div", { className: MeasurementElement_module.runInfoAndParameters, children: [(0,jsx_runtime.jsx)(MeasurementElementStatusInfoAndParameters, { data: {
                                    ...(el.status && { Status: el.status }),
                                    ...(el.metadata?.run_duration && { "Run duration": `${el.metadata?.run_duration}s` }),
                                    ...(el.metadata?.run_start && {
                                        "Run start": formatDateTime(el.metadata?.run_start),
                                    }),
                                    ...((el.metadata?.run_end || el.created_at) && {
                                        "Run end": formatDateTime(el.metadata?.run_end ?? el.created_at),
                                    }),
                                }, isInfoSection: true, className: classNames(MeasurementElement_module.runInfo, SnapshotElement_module.additionalWidth), evenlySpaced: true }), (0,jsx_runtime.jsx)(MeasurementElementStatusInfoAndParameters, { title: "Parameters", data: jsonData?.parameters?.model, filterEmpty: true, className: classNames(MeasurementElement_module.parameters, SnapshotElement_module.additionalWidth) })] }), (0,jsx_runtime.jsx)("div", { className: SnapshotElement_module.outcomesWrapper, children: (0,jsx_runtime.jsx)(MeasurementElementOutcomes, { outcomes: jsonData?.outcomes }) })] }))] }));
};

;// ./src/modules/Data/components/SnapshotsTimeline/SnapshotsTimeline.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var SnapshotsTimeline_module = ({"wrapper":"SnapshotsTimeline-module__wrapper"});
;// ./src/modules/Data/components/SnapshotsTimeline/SnapshotsTimeline.tsx





const SnapshotsTimeline = () => {
    const { allSnapshots, selectedSnapshotId, setSelectedSnapshotId, setClickedForSnapshotSelection, fetchOneSnapshot } = useSnapshotsContext();
    const handleOnClick = (id) => {
        setSelectedSnapshotId(id);
        setClickedForSnapshotSelection(true);
        fetchOneSnapshot(id);
    };
    return (allSnapshots?.length > 0 && ((0,jsx_runtime.jsx)("div", { className: SnapshotsTimeline_module.wrapper, children: allSnapshots.map((snapshot) => {
            return ((0,jsx_runtime.jsx)(SnapshotElement, { el: snapshot, isSelected: snapshot.id === selectedSnapshotId, handleOnClick: () => handleOnClick(snapshot.id) }, snapshot.id));
        }) })));
};

;// ./src/modules/Data/index.tsx







const Data = () => {
    const { totalPages, setPageNumber, result } = useSnapshotsContext();
    return ((0,jsx_runtime.jsx)("div", { className: Data_module.wrapper, children: (0,jsx_runtime.jsxs)("div", { className: Data_module.explorer, children: [(0,jsx_runtime.jsxs)("div", { className: Data_module.dataWrapper, children: [(0,jsx_runtime.jsx)("div", { className: Data_module.data, children: (0,jsx_runtime.jsx)(SnapshotsTimeline, {}) }), (0,jsx_runtime.jsx)(Pagination_PaginationWrapper, { numberOfPages: totalPages, setPageNumber: setPageNumber })] }), (0,jsx_runtime.jsx)("div", { className: Data_module.viewer, children: result && (0,jsx_runtime.jsx)(JSONEditor, { title: "RESULTS", jsonDataProp: result, height: "100%" }) })] }) }));
};

;// ./src/ui-lib/Icons/HelpIcon.tsx



const HelpIcon = ({ width = 24, height = 24, color = ACCENT_COLOR_LIGHT }) => ((0,jsx_runtime.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 24 24", fill: "none", children: [(0,jsx_runtime.jsx)("circle", { cx: "12", cy: "12", r: "10.4", stroke: color, strokeWidth: "1.2" }), (0,jsx_runtime.jsx)("path", { fill: color, d: "M12.795 14.89h-1.826c-.005-.26-.007-.417-.007-.474 0-.585.098-1.066.293-1.444.196-.377.587-.802 1.175-1.274.587-.471.938-.78 1.052-.927a1.23 1.23 0 00.265-.764c0-.387-.157-.717-.472-.99-.31-.279-.73-.418-1.26-.418-.511 0-.939.144-1.283.432-.343.287-.58.726-.709 1.316l-1.847-.227c.052-.844.415-1.561 1.088-2.15.678-.59 1.566-.886 2.664-.886 1.156 0 2.075.3 2.757.9.683.594 1.025 1.287 1.025 2.08 0 .438-.127.854-.38 1.245-.248.392-.783.925-1.604 1.6-.425.349-.69.63-.795.842-.1.212-.146.592-.136 1.14zm-1.826 2.675v-1.989h2.012v1.99H10.97z" })] }));

;// ./src/routing/ModulesRegistry.ts












const DATA_KEY = "data";
const NODES_KEY = "nodes";
const PROJECT_KEY = "project";
const GRAPH_LIBRARY_KEY = "graph-library";
const GRAPH_STATUS_KEY = "graph-status";
const HELP_KEY = "help";
const TOGGLE_SIDEBAR_KEY = "toggle";
const ModulesRegistry = [
    {
        keyId: NODES_KEY,
        path: "nodes",
        Component: Nodes,
        menuItem: {
            sideBarTitle: "Node Library",
            title: "Run calibration node",
            icon: NodeLibraryIcon,
            dataCy: utils_cyKeys.NODES_TAB,
        },
    },
    {
        keyId: GRAPH_LIBRARY_KEY,
        path: "GRAPH_LIBRARY",
        Component: modules_GraphLibrary,
        menuItem: {
            sideBarTitle: "Graph Library",
            title: "Run calibration graph",
            icon: Icons_GraphLibraryIcon,
            dataCy: utils_cyKeys.CALIBRATION_TAB,
        },
    },
    {
        keyId: GRAPH_STATUS_KEY,
        path: "graph-status",
        Component: GraphStatus_GraphStatus,
        menuItem: {
            sideBarTitle: "Graph Status",
            title: "Graph Status",
            icon: Icons_GraphStatusIcon,
            dataCy: utils_cyKeys.NODES_TAB,
        },
    },
    {
        keyId: DATA_KEY,
        path: "data",
        Component: Data,
        menuItem: {
            sideBarTitle: "Data",
            title: "Data",
            icon: Icons_DataIcon,
            dataCy: utils_cyKeys.DATA_TAB,
        },
    },
    {
        keyId: PROJECT_KEY,
        path: "projects",
        Component: modules_Project,
        menuItem: {
            sideBarTitle: "Projects",
            title: "Projects",
            icon: Icons_ProjectIcon,
            dataCy: utils_cyKeys.PROJECT_TAB,
            atBottom: true,
        },
    },
    {
        keyId: HELP_KEY,
        path: "help",
        Component: Data,
        menuItem: {
            sideBarTitle: "Help",
            icon: HelpIcon,
            title: "Help",
            dataCy: utils_cyKeys.HELP_TAB,
            atBottom: true,
        },
    },
    {
        keyId: TOGGLE_SIDEBAR_KEY,
        path: "toggle",
        Component: Data,
        menuItem: {
            dataCy: utils_cyKeys.TOGGLE_SIDEBAR,
            atBottom: true,
        },
    },
];
const modulesMap = {};
ModulesRegistry.map((el) => {
    modulesMap[el.keyId] = el;
});
/* harmony default export */ var routing_ModulesRegistry = (modulesMap);
// export const getSelectedTabName(key: string) => {
//   return modulesMap[key] ?? null;
// };
const bottomMenuItems = ModulesRegistry.filter((m) => m.menuItem && m.menuItem.atBottom);
const menuItems = ModulesRegistry.filter((m) => m.menuItem && !m.menuItem.atBottom);

;// ./src/routing/flexLayout/FlexLayoutFactory.tsx

// eslint-disable-next-line css-modules/no-unused-class


const flexLayoutFactory = (node) => {
    const module = routing_ModulesRegistry[node.getName()];
    if (!module || !module.Component) {
        return (0,jsx_runtime.jsx)("div", { children: "Module not found" });
    }
    return module.Component();
};
const flexClassNameMapper = (defaultClassName) => {
    switch (defaultClassName) {
        case "flexlayout__layout":
            return Layout_module.layout;
        case "flexlayout__tabset_tabbar_outer":
            return `${Layout_module.header} ${defaultClassName}`;
        case "flexlayout__tabset_tabbar_inner_tab_container":
            return `${Layout_module.header_panel} ${defaultClassName}`;
        case "flexlayout__tab_button":
            return `${Layout_module.header_panel_widget} ${defaultClassName}`;
        case "flexlayout__tab_button--selected":
            return `${Layout_module.header_panel_widget_selected}`;
        case "flexlayout__tabset_sizer":
            return `${Layout_module._tabset_header_sizer}`;
        default:
            return defaultClassName;
    }
};

;// ./src/modules/SidebarMenu/styles/MenuItem.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var MenuItem_module = ({"itemWrapper":"MenuItem-module__itemWrapper","selected":"MenuItem-module__selected"});
;// ./src/modules/SidebarMenu/MenuItem.tsx







const MenuItem = ({ menuItem, keyId, hideText, onClick, isSelected = false, isDisabled = false }) => {
    const { openTab } = FlexLayoutContext_useFlexLayoutContext();
    if (!menuItem) {
        return null;
    }
    const { dataCy, title, sideBarTitle, icon: Icon, atBottom } = menuItem;
    const displayTitle = sideBarTitle || title;
    const handleClick = () => {
        if (!atBottom) {
            openTab(keyId);
        }
        onClick?.();
    };
    const button = ((0,jsx_runtime.jsxs)("button", { disabled: isDisabled, onClick: handleClick, className: classNames(MenuItem_module.itemWrapper, isSelected && MenuItem_module.selected), "data-cy": dataCy, "data-testid": `menu-item-${keyId}`, children: [Icon && (0,jsx_runtime.jsx)(Icon, { color: MENU_TEXT_COLOR }), !hideText && displayTitle && (0,jsx_runtime.jsxs)("div", { "data-testid": `menu-item-title-${keyId}`, children: [" ", displayTitle, " "] })] }));
    return isDisabled ? ((0,jsx_runtime.jsx)(Tooltip/* default */.A, { title: "Please select a project before accessing these pages", placement: "right", children: (0,jsx_runtime.jsx)("span", { children: button }) })) : (button);
};
/* harmony default export */ var SidebarMenu_MenuItem = (MenuItem);

;// ./src/modules/SidebarMenu/styles/SidebarMenu.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var SidebarMenu_module = ({"container":"SidebarMenu-module__container","sidebarMenu":"SidebarMenu-module__sidebarMenu","opened":"SidebarMenu-module__opened","collapsed":"SidebarMenu-module__collapsed","expanded":"SidebarMenu-module__expanded","qualibrateLogo":"SidebarMenu-module__qualibrateLogo","menuContent":"SidebarMenu-module__menuContent","menuBottomContent":"SidebarMenu-module__menuBottomContent","menuUpperContent":"SidebarMenu-module__menuUpperContent","themeToggleContainer":"SidebarMenu-module__themeToggleContainer"});
;// ./src/modules/themeModule/prismColors.ts
const prismColors = {
    "--code-highlight-comment-color": { light: "#008000", dark: "#6272a4" },
    "--code-highlight-prolog-color": { light: "#008000", dark: "#cfcfc2" },
    "--code-highlight-doctype-color": { light: "#008000", dark: "#6272a4" },
    "--code-highlight-cdata-color": { light: "#008000", dark: "#6272a4" },
    "--code-highlight-tag-color": { light: "#c92c2c", dark: "#dc68aa" },
    "--code-highlight-entity-color": { light: "#a67f59", dark: "#8be9fd" },
    "--code-highlight-atrule-color": { light: "#00f", dark: "#62ef75" },
    "--code-highlight-url-color": { light: "#a67f59", dark: "#66d9ef" },
    "--code-highlight-selector-color": { light: "#2f9c0a", dark: "#cfcfc2" },
    "--code-highlight-string-color": { light: "#2f9c0a", dark: "#f1fa8c" },
    "--code-highlight-property-color": { light: "#c92c2c", dark: "#ffb86c" },
    "--code-highlight-important-color": { light: "#e90", dark: "#ff79c6" },
    "--code-highlight-punctuation-color": { light: "#5f6364", dark: "#e6db74" },
    "--code-highlight-number-color": { light: "#c92c2c", dark: "#bd93f9" },
    "--code-highlight-function-color": { light: "#2f9c0a", dark: "#50fa7b" },
    "--code-highlight-class-name-color": { light: "#00f", dark: "#ffb86c" },
    "--code-highlight-keyword-color": { light: "#00f", dark: "#ff79c6" },
    "--code-highlight-boolean-color": { light: "#c92c2c", dark: "#ffb86c" },
    "--code-highlight-operator-color": { light: "#a67f59", dark: "#8be9fd" },
    "--code-highlight-char-color": { light: "#2f9c0a", dark: "#ff879d" },
    "--code-highlight-regex-color": { light: "#e90", dark: "#50fa7b" },
    "--code-highlight-variable-color": { light: "#a67f59", dark: "#50fa7b" },
    "--code-highlight-constant-color": { light: "#c92c2c", dark: "#ffb86c" },
    "--code-highlight-symbol-color": { light: "#c92c2c", dark: "#ffb86c" },
    "--code-highlight-function-name-color": { light: "#c92c2c", dark: "#ffb86c" },
    "--code-highlight-builtin-color": { light: "#2f9c0a", dark: "#ff79c6" },
    "--code-highlight-attr-name-color": { light: "#2f9c0a", dark: "#cfcfc2" },
    "--code-highlight-attr-value-color": { light: "#00f", dark: "#7ec699" },
    "--code-highlight-inserted-color": { light: "#2f9c0a", dark: "#7ec699" },
    "--code-highlight-deleted-color": { light: "#c92c2c", dark: "#e2777a" },
    "--code-highlight-namespace-color": { light: "#c92c2c", dark: "#e2777a" },
};
/* harmony default export */ var themeModule_prismColors = (prismColors);

;// ./src/modules/themeModule/diffColors.ts
const diffColors = {
    "--diff-gutter-delete-background-color": {
        dark: "#9b2147",
        light: "#ff8989",
    },
    "--diff-gutter-insert-background-color": {
        dark: "#0c8466",
        light: "#76e9c8",
    },
    "--diff-gutter-selected-background-color": {
        dark: "#736628",
        light: "#d99e0a",
    },
    "--diff-code-delete-background-color": {
        dark: "#37212b",
        light: "#ffeded",
    },
    "--diff-code-insert-background-color": {
        dark: "#1f3331",
        light: "#ebfcf7",
    },
    "--diff-code-selected-background-color": {
        dark: "#383427",
        light: "#fcf3bf",
    },
    "--diff-code-insert-edit-background-color": {
        dark: "#156451",
        light: "#bcf4e4",
    },
    "--diff-code-delete-edit-background-color": {
        dark: "#73223c",
        light: "#ffc5c5",
    },
};
/* harmony default export */ var themeModule_diffColors = (diffColors);

;// ./src/modules/themeModule/themeHelper.ts


const DARK = "dark";
const LIGHT = "light";
function updateColorTheme() {
    const theme = getColorTheme();
    const arrayOfVariableKeys = Object.keys(colors);
    const arrayOfVariableValues = Object.values(colors);
    arrayOfVariableKeys.forEach((cssVariableKey, index) => {
        document.documentElement.style.setProperty(cssVariableKey, arrayOfVariableValues[index][theme]);
    });
}
function toggleColorTheme() {
    const cur = getColorTheme();
    return setColorTheme(cur === LIGHT ? DARK : LIGHT);
}
function setColorTheme(theme) {
    localStorage.setItem("colorTheme", theme);
    updateColorTheme();
    return theme;
}
function getColorTheme() {
    const color = localStorage.getItem("colorTheme") || "";
    if (![DARK, LIGHT].includes(color)) {
        return DARK;
    }
    return color;
}
const colors = {
    ...themeModule_prismColors,
    ...themeModule_diffColors,
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
// export const colorAliases = {
//   BACKGROUND_COLOR: "var(--background-color)",
// };

;// ./src/modules/themeModule/GlobalThemeContext.tsx



const GlobalThemeContext = react.createContext(null);
function GlobalThemeContextProvider(props) {
    const { children } = props;
    const [theme, _setTheme] = (0,react.useState)(getColorTheme());
    const [pinSideMenu, setPinSideMenu] = (0,react.useState)(true);
    const toggleTheme = (0,react.useCallback)(() => {
        _setTheme(toggleColorTheme());
    }, [_setTheme]);
    return ((0,jsx_runtime.jsx)(GlobalThemeContext.Provider, { value: {
            theme,
            toggleTheme,
            pinSideMenu,
            setPinSideMenu,
        }, children: children }));
}
function useGlobalThemeContext() {
    const context = (0,react.useContext)(GlobalThemeContext);
    if (!context) {
        throw new Error("useGlobalThemeContext must be used within a GlobalThemeContextProvider");
    }
    return context;
}
/* harmony default export */ var themeModule_GlobalThemeContext = (GlobalThemeContext);

;// ./src/ui-lib/Icons/QUAlibrateLogoIcon.tsx


const QUAlibrateLogoIcon = ({ width = 149, height = 75 }) => {
    return ((0,jsx_runtime.jsxs)("svg", { width: width, height: height, viewBox: "0 0 600 304", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0,jsx_runtime.jsxs)("g", { clipPath: "url(#clip0_34438_91)", children: [(0,jsx_runtime.jsx)("path", { d: "M341.742 204.266C350.541 204.027 357.849 211.049 358.087 219.931V220.516C358.064 224.164 356.824 227.693 354.618 230.566L358.171 233.785L354.892 237.457L351.375 233.976C348.585 236.062 345.199 237.135 341.742 237.088C332.836 237.147 325.564 229.91 325.504 220.933V220.504C325.397 211.634 332.431 204.373 341.229 204.266H341.742ZM341.742 231.842C343.697 231.842 345.617 231.246 347.262 230.161L343.745 226.811L347.024 223.198L350.457 226.632C351.59 224.784 352.186 222.674 352.186 220.504C352.436 214.721 348.013 209.821 342.279 209.547C336.544 209.285 331.692 213.756 331.417 219.538V220.48C331.095 226.405 335.59 231.46 341.48 231.782H341.754V231.83L341.742 231.842Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M363.607 204.802H369.342V225.153C369.342 229.04 372.477 232.2 376.328 232.2C380.179 232.2 383.315 229.04 383.315 225.153V204.802H389.025V225.153C389.025 232.271 383.935 237.1 376.352 237.1C368.77 237.1 363.572 232.271 363.572 225.153L363.619 204.802H363.607Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M411.082 228.42H400.042L397.383 236.563H391.481L402.557 204.802H408.566L419.642 236.563H413.764L411.082 228.42ZM405.55 210.31C405.55 210.31 404.846 213.422 404.203 215.234L401.413 223.83H409.675L406.861 215.234C406.289 213.434 405.621 210.31 405.621 210.31H405.538H405.55Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M423.338 204.802H429.072L441.006 223.151C441.96 224.736 442.842 226.37 443.605 228.074C443.605 228.074 443.283 225.022 443.283 223.151V204.802H448.97V236.563H443.391L431.457 218.262C430.503 216.677 429.621 215.043 428.834 213.339C428.834 213.339 429.156 216.391 429.156 218.262V236.563H423.421L423.338 204.802Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M463.158 209.774H452.821V204.814H479.217V209.774H468.881V236.563H463.146V209.774H463.158Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M482.746 204.802H488.481V225.153C488.481 229.04 491.616 232.2 495.467 232.2C499.318 232.2 502.453 229.04 502.453 225.153V204.802H508.188V225.153C508.188 232.271 503.073 237.1 495.407 237.1C487.741 237.1 482.627 232.271 482.627 225.153L482.758 204.802H482.746Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M516.665 204.802H522.805L528.969 220.504C529.696 222.376 530.566 225.142 530.566 225.142H530.673C530.673 225.142 531.508 222.376 532.211 220.504L538.387 204.802H544.503L547.043 236.563H541.38L540.032 218.799C539.901 216.653 540.032 213.875 540.032 213.875C540.032 213.875 539.09 216.975 538.351 218.799L533.106 231.115H528.098L523.031 218.799C522.28 216.975 521.303 213.839 521.303 213.839V218.799L519.955 236.563H514.245L516.677 204.802H516.665Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M350.851 253.755H356.967L363.142 269.456C363.846 271.328 364.74 274.094 364.74 274.094C364.74 274.094 365.586 271.328 366.29 269.456L372.442 253.755H378.582L381.121 285.528H375.434L374.111 267.763C373.968 265.617 374.111 262.84 374.111 262.84C374.111 262.84 373.193 265.916 372.43 267.763L367.339 280.079H362.308L357.253 267.763C356.49 265.916 355.524 262.804 355.524 262.804V267.763L354.093 285.528H348.359L350.827 253.755H350.851Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M404.036 277.385H392.996L390.337 285.528H384.435L395.511 253.755H401.52L412.596 285.528H406.694L404.036 277.385ZM398.492 259.251C398.492 259.251 397.788 262.387 397.144 264.175L394.355 272.771H402.617L399.803 264.175C399.231 262.387 398.563 259.251 398.563 259.251H398.48H398.492Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M429.513 253.218C433.793 253.051 437.978 254.589 441.149 257.51L438.383 261.802C435.999 259.74 432.995 258.56 429.859 258.452C424.208 258.214 419.439 262.661 419.201 268.36V269.516C418.855 275.441 423.338 280.52 429.215 280.866H429.859C433.317 280.735 436.571 279.292 439.003 276.824L442.008 280.997C438.753 284.347 434.27 286.219 429.633 286.159C420.87 286.434 413.561 279.495 413.311 270.672V269.516C413.12 260.706 420.047 253.397 428.798 253.206H429.501L429.525 253.23L429.513 253.218Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M446.419 253.755H452.13V267.227H466.556V253.755H472.29V285.528H466.556V272.187H452.13V285.528H446.419V253.755Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M479.825 253.755H485.536V285.528H479.825V253.755Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M492.975 253.755H498.71L510.644 272.103C511.598 273.689 512.48 275.322 513.267 277.027C513.267 277.027 512.945 273.975 512.945 272.103V253.755H518.632V285.528H512.945L501.142 267.227C500.188 265.641 499.306 264.008 498.519 262.303C498.519 262.303 498.841 265.331 498.841 267.227V285.528H493.106L492.975 253.755Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M526.238 253.755H545.099V258.786H531.973V267.096H542.631V272.079H531.973V280.675H545.886V285.659H526.322L526.238 253.755Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M552.277 277.385C554.423 279.388 557.2 280.568 560.121 280.735C562.53 280.735 564.699 279.471 564.699 276.884C564.699 271.185 549.785 272.175 549.785 262.422C549.785 257.141 554.327 253.206 560.443 253.206C563.901 253.075 567.287 254.303 569.862 256.628L567.394 261.337C565.439 259.656 562.983 258.679 560.419 258.571C557.761 258.571 555.674 260.145 555.674 262.374C555.674 268.002 570.589 266.666 570.589 276.765C570.589 281.832 566.75 286.088 560.193 286.088C556.139 286.171 552.241 284.621 549.32 281.796L552.277 277.396V277.385Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M319.054 286.47L319.018 286.386L281.499 193.202C280.2 190.007 277.159 187.933 273.75 187.909C270.316 187.909 267.276 189.959 265.976 193.119L249.786 232.224L248.689 234.882L247.592 232.224L231.402 193.119C230.09 189.947 227.05 187.909 223.664 187.909C220.278 187.909 217.191 189.983 215.879 193.202L183.284 274.118L182.664 275.644L181.4 274.583L175.582 269.683L174.879 269.099L175.272 268.276C179.028 260.265 180.935 251.716 180.935 242.87C180.911 209.989 154.396 183.247 121.801 183.247C89.2055 183.247 62.6905 209.989 62.6905 242.858C62.6905 275.728 89.2055 302.469 121.801 302.469C138.075 302.469 153.264 295.9 164.554 283.954L165.329 283.131L166.187 283.859L180.721 296.079C182.223 297.343 184.13 298.034 186.086 298.034C186.789 298.034 187.48 297.951 188.112 297.796C190.711 297.14 192.857 295.256 193.859 292.765L222.627 221.327L223.712 218.62L224.833 221.315L240.904 260.133C240.904 260.133 240.928 260.157 240.94 260.181C241.011 260.3 241.083 260.42 241.13 260.551C241.273 260.861 241.464 261.254 241.691 261.588C241.762 261.683 241.87 261.803 241.965 261.934C242.036 262.017 242.096 262.101 242.168 262.172C242.227 262.244 242.299 262.339 242.382 262.434C242.501 262.589 242.621 262.744 242.752 262.864C242.907 263.019 243.11 263.174 243.336 263.341H243.36L243.396 263.376C243.479 263.448 243.574 263.531 243.67 263.603C243.789 263.71 243.92 263.817 244.051 263.913C244.254 264.032 244.457 264.139 244.671 264.247L244.993 264.414C245.089 264.473 245.172 264.521 245.244 264.569C245.279 264.592 245.315 264.616 245.363 264.64L245.506 264.688C246.066 264.914 246.567 265.069 247.044 265.153C247.223 265.189 247.366 265.2 247.521 265.212C247.652 265.212 247.795 265.236 247.938 265.248C248.069 265.248 248.2 265.272 248.331 265.296C248.463 265.308 248.582 265.332 248.713 265.332C248.904 265.332 249.106 265.308 249.357 265.272L249.691 265.236L249.941 265.212C250.084 265.212 250.215 265.2 250.299 265.177C250.954 265.034 251.443 264.89 251.896 264.688L252.087 264.604C252.087 264.604 252.111 264.592 252.123 264.58L252.278 264.485L252.313 264.461L252.361 264.437C252.755 264.247 253.076 264.08 253.375 263.889C253.518 263.794 253.649 263.674 253.792 263.555L253.971 263.4C254.054 263.329 254.149 263.245 254.245 263.174C254.388 263.066 254.519 262.959 254.65 262.84C254.769 262.721 254.865 262.589 254.96 262.458C255.032 262.363 255.115 262.256 255.199 262.16C255.258 262.089 255.33 262.005 255.401 261.922C255.497 261.815 255.592 261.707 255.676 261.576C255.854 261.302 256.009 260.992 256.176 260.646L256.248 260.503C256.295 260.384 256.367 260.277 256.427 260.169C256.439 260.145 256.462 260.122 256.474 260.098L272.534 221.303L273.654 218.608L274.739 221.315L303.507 292.753C304.795 295.972 307.859 298.046 311.293 298.046C312.342 298.046 313.439 297.832 314.452 297.426C318.732 295.686 320.807 290.762 319.09 286.422L319.054 286.47ZM161.991 256.14L161.442 257.821L160.083 256.676L149.532 247.806C148.03 246.542 146.122 245.851 144.155 245.851C141.651 245.851 139.303 246.959 137.705 248.879C134.736 252.467 135.213 257.833 138.766 260.825L151.404 271.436L152.405 272.27L151.487 273.188C144.191 280.461 134.713 284.729 124.543 285.397L124.626 285.48L121.789 285.504C98.4572 285.504 79.477 266.369 79.477 242.846C79.477 219.324 98.4691 200.2 121.801 200.2C145.133 200.2 164.113 219.336 164.113 242.858C164.113 247.341 163.398 251.8 161.991 256.14Z", fill: "#EBEBEC" })] }), (0,jsx_runtime.jsx)("path", { d: "M68.3063 135.381L54.8502 120.822C51.5413 121.778 47.9016 122.255 43.9309 122.255C36.7984 122.255 30.2174 120.601 24.1879 117.292C18.2319 113.91 13.4892 109.241 9.95972 103.285C6.50378 97.255 4.77581 90.4902 4.77581 82.9901C4.77581 75.4899 6.50378 68.7619 9.95972 62.8059C13.4892 56.8499 18.2319 52.2175 24.1879 48.9086C30.2174 45.5262 36.7984 43.835 43.9309 43.835C51.1369 43.835 57.7179 45.5262 63.6739 48.9086C69.7034 52.2175 74.4461 56.8499 77.9021 62.8059C81.358 68.7619 83.086 75.4899 83.086 82.9901C83.086 90.049 81.5419 96.4462 78.4536 102.182C75.4388 107.843 71.2476 112.402 65.8798 115.858L84.2993 135.381H68.3063ZM17.6804 82.9901C17.6804 88.6519 18.7834 93.652 20.9893 97.9903C23.2688 102.255 26.3938 105.564 30.3645 107.917C34.3351 110.196 38.8573 111.336 43.9309 111.336C49.0045 111.336 53.5267 110.196 57.4973 107.917C61.468 105.564 64.5563 102.255 66.7622 97.9903C69.0416 93.652 70.1814 88.6519 70.1814 82.9901C70.1814 77.3282 69.0416 72.3649 66.7622 68.1001C64.5563 63.8353 61.468 60.5632 57.4973 58.2838C53.5267 56.0043 49.0045 54.8646 43.9309 54.8646C38.8573 54.8646 34.3351 56.0043 30.3645 58.2838C26.3938 60.5632 23.2688 63.8353 20.9893 68.1001C18.7834 72.3649 17.6804 77.3282 17.6804 82.9901ZM107.143 44.8276V93.6888C107.143 99.4977 108.65 103.873 111.665 106.814C114.753 109.755 119.018 111.226 124.459 111.226C129.974 111.226 134.239 109.755 137.253 106.814C140.342 103.873 141.886 99.4977 141.886 93.6888V44.8276H154.46V93.4682C154.46 99.7183 153.099 105.013 150.379 109.351C147.658 113.689 144.018 116.924 139.459 119.057C134.9 121.189 129.864 122.255 124.349 122.255C118.834 122.255 113.797 121.189 109.238 119.057C104.753 116.924 101.187 113.689 98.5395 109.351C95.8924 105.013 94.5688 99.7183 94.5688 93.4682V44.8276H107.143ZM212.633 105.821H180.537L175.022 121.483H161.897L189.361 44.7174H203.92L231.383 121.483H218.148L212.633 105.821ZM209.104 95.5638L196.64 59.9382L184.066 95.5638H209.104ZM250.494 39.8643V121.483H242.773V39.8643H250.494ZM270.735 49.9013C269.191 49.9013 267.867 49.3498 266.764 48.2468C265.661 47.1439 265.11 45.7835 265.11 44.1659C265.11 42.5482 265.661 41.2246 266.764 40.1952C267.867 39.0923 269.191 38.5408 270.735 38.5408C272.279 38.5408 273.603 39.0923 274.706 40.1952C275.809 41.2246 276.36 42.5482 276.36 44.1659C276.36 45.7835 275.809 47.1439 274.706 48.2468C273.603 49.3498 272.279 49.9013 270.735 49.9013ZM274.595 61.2618V121.483H266.875V61.2618H274.595ZM298.586 74.6076C300.572 70.4163 303.623 66.9972 307.741 64.3501C311.932 61.7029 316.859 60.3794 322.521 60.3794C328.035 60.3794 332.962 61.6662 337.3 64.2397C341.639 66.7398 345.021 70.3428 347.447 75.0488C349.948 79.6812 351.198 85.0857 351.198 91.2623C351.198 97.4389 349.948 102.88 347.447 107.586C345.021 112.292 341.602 115.932 337.19 118.505C332.852 121.079 327.962 122.366 322.521 122.366C316.785 122.366 311.822 121.079 307.631 118.505C303.513 115.858 300.498 112.439 298.586 108.248V121.483H290.976V39.8643H298.586V74.6076ZM343.367 91.2623C343.367 86.2622 342.374 81.9607 340.389 78.3576C338.477 74.6811 335.83 71.8869 332.447 69.9751C329.065 68.0633 325.241 67.1074 320.976 67.1074C316.859 67.1074 313.072 68.1001 309.616 70.0854C306.234 72.0708 303.55 74.9017 301.564 78.5782C299.579 82.2548 298.586 86.5196 298.586 91.3726C298.586 96.2256 299.579 100.49 301.564 104.167C303.55 107.843 306.234 110.674 309.616 112.66C313.072 114.645 316.859 115.638 320.976 115.638C325.241 115.638 329.065 114.682 332.447 112.77C335.83 110.785 338.477 107.954 340.389 104.277C342.374 100.527 343.367 96.1888 343.367 91.2623ZM372.022 71.9605C373.713 68.2104 376.287 65.306 379.743 63.2471C383.272 61.1882 387.574 60.1588 392.647 60.1588V68.2104H390.552C384.963 68.2104 380.478 69.7178 377.096 72.7325C373.713 75.7473 372.022 80.7842 372.022 87.8431V121.483H364.301V61.2618H372.022V71.9605ZM399.63 91.2623C399.63 85.0857 400.843 79.6812 403.269 75.0488C405.769 70.3428 409.189 66.7398 413.527 64.2397C417.939 61.6662 422.902 60.3794 428.417 60.3794C434.152 60.3794 439.079 61.7029 443.197 64.3501C447.388 66.9972 450.403 70.3796 452.241 74.4973V61.2618H459.962V121.483H452.241V108.138C450.329 112.255 447.277 115.674 443.086 118.395C438.968 121.042 434.042 122.366 428.307 122.366C422.865 122.366 417.939 121.079 413.527 118.505C409.189 115.932 405.769 112.292 403.269 107.586C400.843 102.88 399.63 97.4389 399.63 91.2623ZM452.241 91.3726C452.241 86.5196 451.248 82.2548 449.263 78.5782C447.277 74.9017 444.557 72.0708 441.101 70.0854C437.718 68.1001 433.968 67.1074 429.851 67.1074C425.586 67.1074 421.762 68.0633 418.38 69.9751C414.997 71.8869 412.314 74.6811 410.328 78.3576C408.416 81.9607 407.461 86.2622 407.461 91.2623C407.461 96.1888 408.416 100.527 410.328 104.277C412.314 107.954 414.997 110.785 418.38 112.77C421.762 114.682 425.586 115.638 429.851 115.638C433.968 115.638 437.718 114.645 441.101 112.66C444.557 110.674 447.277 107.843 449.263 104.167C451.248 100.49 452.241 96.2256 452.241 91.3726ZM486.521 67.7692V105.16C486.521 108.836 487.22 111.373 488.617 112.77C490.014 114.167 492.477 114.866 496.007 114.866H503.066V121.483H494.794C489.352 121.483 485.308 120.233 482.661 117.733C480.014 115.16 478.69 110.969 478.69 105.16V67.7692H470.308V61.2618H478.69V46.1512H486.521V61.2618H503.066V67.7692H486.521ZM569.182 88.2843C569.182 90.9314 569.109 92.9535 568.962 94.3506H518.997C519.218 98.9095 520.321 102.807 522.306 106.042C524.292 109.277 526.902 111.741 530.137 113.432C533.373 115.049 536.902 115.858 540.726 115.858C545.726 115.858 549.917 114.645 553.3 112.219C556.755 109.792 559.035 106.52 560.138 102.402H568.3C566.829 108.285 563.667 113.101 558.814 116.851C554.035 120.527 548.005 122.366 540.726 122.366C535.064 122.366 529.99 121.116 525.505 118.616C521.02 116.042 517.49 112.439 514.916 107.807C512.416 103.101 511.166 97.6227 511.166 91.3726C511.166 85.1225 512.416 79.6444 514.916 74.9385C517.417 70.2325 520.909 66.6295 525.395 64.1295C529.88 61.6294 534.99 60.3794 540.726 60.3794C546.461 60.3794 551.461 61.6294 555.726 64.1295C560.064 66.6295 563.373 70.0119 565.653 74.2767C568.006 78.4679 569.182 83.1371 569.182 88.2843ZM561.351 88.0637C561.425 83.5783 560.506 79.7547 558.594 76.5929C556.755 73.4311 554.219 71.0413 550.983 69.4237C547.748 67.806 544.218 66.9972 540.395 66.9972C534.659 66.9972 529.77 68.8354 525.726 72.512C521.681 76.1885 519.439 81.3724 518.997 88.0637H561.351Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("path", { d: "M24.1927 201.14C25.453 201.339 26.5972 201.853 27.6254 202.683C28.6866 203.512 29.5158 204.54 30.1128 205.767C30.7429 206.994 31.058 208.304 31.058 209.697C31.058 211.455 30.6102 213.047 29.7148 214.473C28.8193 215.866 27.5093 216.977 25.7847 217.806C24.0932 218.602 22.0867 219 19.7651 219H6.83061V184.326H19.2677C21.6224 184.326 23.6289 184.723 25.2872 185.519C26.9455 186.282 28.1892 187.327 29.0183 188.654C29.8474 189.98 30.262 191.473 30.262 193.131C30.262 195.187 29.6982 196.895 28.5706 198.255C27.4761 199.582 26.0168 200.543 24.1927 201.14ZM11.3577 199.3H18.9692C21.0918 199.3 22.7334 198.802 23.8942 197.807C25.055 196.812 25.6354 195.436 25.6354 193.678C25.6354 191.92 25.055 190.544 23.8942 189.549C22.7334 188.554 21.0586 188.057 18.8697 188.057H11.3577V199.3ZM19.3672 215.269C21.6224 215.269 23.3802 214.738 24.6405 213.677C25.9007 212.616 26.5309 211.14 26.5309 209.249C26.5309 207.326 25.8676 205.817 24.541 204.722C23.2143 203.595 21.44 203.031 19.2179 203.031H11.3577V215.269H19.3672ZM59.6274 184.326L48.3346 205.916V219H43.8075V205.916L32.4649 184.326H37.4895L46.0462 201.887L54.6029 184.326H59.6274Z", fill: "#EBEBEC" }), (0,jsx_runtime.jsx)("defs", { children: (0,jsx_runtime.jsx)("clipPath", { id: "clip0_34438_91", children: (0,jsx_runtime.jsx)("rect", { width: "509.079", height: "121.607", fill: "white", transform: "translate(61.4982 182.055)" }) }) })] }));
};
/* harmony default export */ var Icons_QUAlibrateLogoIcon = (QUAlibrateLogoIcon);

;// ./src/ui-lib/Icons/QualibrateLogoSmall.tsx


const QualibrateLogoSmallIcon = ({ width = 26, height = 23 }) => {
    return ((0,jsx_runtime.jsx)("svg", { width: width, height: height, viewBox: "0 0 215.53 100", xmlns: "http://www.w3.org/2000/svg", fill: "#ebebec", children: (0,jsx_runtime.jsx)("path", { d: "M215.03,86.58l-.03-.07-31.47-78.16c-1.09-2.68-3.64-4.42-6.5-4.44-2.88,0-5.43,1.72-6.52,4.37l-13.58,32.8-.92,2.23-.92-2.23-13.58-32.8c-1.1-2.66-3.65-4.37-6.49-4.37s-5.43,1.74-6.53,4.44l-27.34,67.87-.52,1.28-1.06-.89-4.88-4.11-.59-.49.33-.69c3.15-6.72,4.75-13.89,4.75-21.31C99.16,22.43,76.92,0,49.58,0S0,22.43,0,50s22.24,50,49.58,50c13.65,0,26.39-5.51,35.86-15.53l.65-.69.72.61,12.19,10.25c1.26,1.06,2.86,1.64,4.5,1.64.59,0,1.17-.07,1.7-.2,2.18-.55,3.98-2.13,4.82-4.22l24.13-59.92.91-2.27.94,2.26,13.48,32.56s.02.02.03.04c.06.1.12.2.16.31.12.26.28.59.47.87.06.08.15.18.23.29.06.07.11.14.17.2.05.06.11.14.18.22.1.13.2.26.31.36.13.13.3.26.49.4h.02s.03.03.03.03c.07.06.15.13.23.19.1.09.21.18.32.26.17.1.34.19.52.28l.27.14c.08.05.15.09.21.13.03.02.06.04.1.06l.12.04c.47.19.89.32,1.29.39.15.03.27.04.4.05.11,0,.23.02.35.03.11,0,.22.02.33.04.11.01.21.03.32.03.16,0,.33-.02.54-.05l.28-.03.21-.02c.12,0,.23-.01.3-.03.55-.12.96-.24,1.34-.41l.16-.07s.02-.01.03-.02l.13-.08.03-.02.04-.02c.33-.16.6-.3.85-.46.12-.08.23-.18.35-.28l.15-.13c.07-.06.15-.13.23-.19.12-.09.23-.18.34-.28.1-.1.18-.21.26-.32.06-.08.13-.17.2-.25.05-.06.11-.13.17-.2.08-.09.16-.18.23-.29.15-.23.28-.49.42-.78l.06-.12c.04-.1.1-.19.15-.28.01-.02.03-.04.04-.06l13.47-32.54.94-2.26.91,2.27,24.13,59.92c1.08,2.7,3.65,4.44,6.53,4.44.88,0,1.8-.18,2.65-.52,3.59-1.46,5.33-5.59,3.89-9.23ZM83.29,61.14l-.46,1.41-1.14-.96-8.85-7.44c-1.26-1.06-2.86-1.64-4.51-1.64-2.1,0-4.07.93-5.41,2.54-2.49,3.01-2.09,7.51.89,10.02l10.6,8.9.84.7-.77.77c-6.12,6.1-14.07,9.68-22.6,10.24l.07.07-2.38.02c-19.57,0-35.49-16.05-35.49-35.78S30.01,14.22,49.58,14.22s35.49,16.05,35.49,35.78c0,3.76-.6,7.5-1.78,11.14Z" }) }));
};
/* harmony default export */ var QualibrateLogoSmall = (QualibrateLogoSmallIcon);

;// ./src/ui-lib/Icons/ExpandSideMenuIcon.tsx


const ExpandSideMenuIcon = () => {
    return ((0,jsx_runtime.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", style: { width: "16px", height: "16px", flexShrink: 0 }, children: [(0,jsx_runtime.jsx)("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M6.73722 8L0 0.655904L0.684604 0L8.02352 8L0.684604 16L0 15.3441L6.73722 8Z", fill: "var(--grey-highlight)" }), (0,jsx_runtime.jsx)("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M14.7137 8L7.97648 0.655904L8.66108 0L16 8L8.66108 16L7.97648 15.3441L14.7137 8Z", fill: "var(--grey-highlight)" })] }));
};
/* harmony default export */ var Icons_ExpandSideMenuIcon = (ExpandSideMenuIcon);

;// ./src/ui-lib/Icons/CollapseSideMenuIcon.tsx


const CollapseSideMenuIcon = () => {
    return ((0,jsx_runtime.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", style: { width: "16px", height: "16px", flexShrink: 0 }, children: [(0,jsx_runtime.jsx)("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M9.26278 8L16 15.3441L15.3154 16L7.97648 8L15.3154 0L16 0.655904L9.26278 8Z", fill: "var(--grey-highlight)" }), (0,jsx_runtime.jsx)("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1.2863 8L8.02352 15.3441L7.33892 16L0 8L7.33892 0L8.02352 0.655904L1.2863 8Z", fill: "var(--grey-highlight)" })] }));
};
/* harmony default export */ var Icons_CollapseSideMenuIcon = (CollapseSideMenuIcon);

;// ./src/modules/SidebarMenu/SidebarMenu.tsx





// import { THEME_TOGGLE_VISIBLE } from "../../dev.config";
// import ThemeToggle from "../themeModule/ThemeToggle";













const SidebarMenu = () => {
    const { pinSideMenu } = (0,react.useContext)(themeModule_GlobalThemeContext);
    const [minify, setMinify] = (0,react.useState)(true);
    const { activeTabsetName, setActiveTabsetName, openTab } = FlexLayoutContext_useFlexLayoutContext();
    const containerClassName = classNames(SidebarMenu_module.sidebarMenu, minify ? SidebarMenu_module.collapsed : SidebarMenu_module.expanded);
    const { activeProject, shouldGoToProjectPage } = useProjectContext();
    const handleProjectClick = (0,react.useCallback)(() => {
        openTab(PROJECT_KEY);
    }, [openTab]);
    const handleHelpClick = (0,react.useCallback)(() => {
        window.open("https://qua-platform.github.io/qualibrate/", "_blank", "noopener,noreferrer,width=800,height=600");
    }, []);
    (0,react.useEffect)(() => {
        setMinify(!pinSideMenu);
    }, [pinSideMenu]);
    return ((0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: (0,jsx_runtime.jsxs)("div", { className: containerClassName, children: [(0,jsx_runtime.jsx)("button", { className: SidebarMenu_module.qualibrateLogo, "data-cy": utils_cyKeys.HOME_PAGE, children: minify ? (0,jsx_runtime.jsx)(QualibrateLogoSmall, {}) : (0,jsx_runtime.jsx)(Icons_QUAlibrateLogoIcon, {}) }), (0,jsx_runtime.jsxs)("div", { className: SidebarMenu_module.menuContent, children: [(0,jsx_runtime.jsx)("div", { className: SidebarMenu_module.menuUpperContent, children: menuItems.map((item) => {
                                return ((0,react.createElement)(SidebarMenu_MenuItem, { ...item, key: item.keyId, hideText: minify, onClick: () => setActiveTabsetName(item.keyId), isSelected: activeTabsetName === item.keyId, isDisabled: !activeProject || shouldGoToProjectPage, "data-testid": `menu-item-${item.keyId}` }));
                            }) }), (0,jsx_runtime.jsx)("div", { className: SidebarMenu_module.menuBottomContent, children: bottomMenuItems.map((item) => {
                                const menuItem = { ...item.menuItem };
                                let handleOnClick = () => { };
                                if (item.keyId === TOGGLE_SIDEBAR_KEY) {
                                    handleOnClick = () => setMinify(!minify);
                                    menuItem.icon = minify ? Icons_ExpandSideMenuIcon : Icons_CollapseSideMenuIcon;
                                }
                                else if (item.keyId === HELP_KEY) {
                                    handleOnClick = handleHelpClick;
                                }
                                else if (item.keyId === PROJECT_KEY) {
                                    handleOnClick = handleProjectClick;
                                    if (activeProject) {
                                        menuItem.sideBarTitle = activeProject.name;
                                        menuItem.icon = () => ((0,jsx_runtime.jsx)(Icons_ProjectFolderIcon, { initials: extractInitials(activeProject.name), fillColor: colorPalette[getColorIndex(activeProject.name)], width: 28, height: 28, fontSize: 13 }));
                                    }
                                }
                                return ((0,react.createElement)(SidebarMenu_MenuItem, { ...item, menuItem: menuItem, key: item.keyId, hideText: minify, isSelected: item.keyId === PROJECT_KEY && activeTabsetName === PROJECT_KEY, onClick: handleOnClick }));
                            }) })] })] }) }));
};
/* harmony default export */ var SidebarMenu_SidebarMenu = (SidebarMenu);

// EXTERNAL MODULE: ./node_modules/react-toastify/dist/react-toastify.esm.mjs
var react_toastify_esm = __webpack_require__(9571);
// EXTERNAL MODULE: ./node_modules/react-toastify/dist/ReactToastify.css
var ReactToastify = __webpack_require__(7333);
;// ./src/modules/toastModule/ToastComponent.tsx




const ToastComponent = () => {
    return ((0,jsx_runtime.jsx)(react_toastify_esm/* ToastContainer */.N9, { position: "bottom-center", autoClose: 5000, hideProgressBar: true, newestOnTop: false, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, pauseOnHover: true, theme: "dark" }));
};
/* harmony default export */ var toastModule_ToastComponent = (ToastComponent);

;// ./src/common/ui-components/common/Page/Page.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Page_module = ({"pageName":"Page-module__pageName","pageSection":"Page-module__pageSection","sectionName":"Page-module__sectionName","sectionContent":"Page-module__sectionContent"});
;// ./src/common/ui-components/common/Page/PageName.tsx


// eslint-disable-next-line css-modules/no-unused-class

const PageName = ({ children }) => {
    return (0,jsx_runtime.jsx)("h1", { className: Page_module.pageName, children: children });
};
/* harmony default export */ var Page_PageName = (PageName);

;// ./src/modules/TopbarMenu/TitleBarGraphCard/styles/TitleBarGraphCard.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var TitleBarGraphCard_module = ({"graphCardWrapper":"TitleBarGraphCard-module__graphCardWrapper","defaultGraphCardContent":"TitleBarGraphCard-module__defaultGraphCardContent","running":"TitleBarGraphCard-module__running","finished":"TitleBarGraphCard-module__finished","error":"TitleBarGraphCard-module__error","pending":"TitleBarGraphCard-module__pending","indicatorWrapper":"TitleBarGraphCard-module__indicatorWrapper","textWrapper":"TitleBarGraphCard-module__textWrapper","hoverRegion":"TitleBarGraphCard-module__hoverRegion","graphTitleDefault":"TitleBarGraphCard-module__graphTitleDefault","graphTitle":"TitleBarGraphCard-module__graphTitle","graphStatusRow":"TitleBarGraphCard-module__graphStatusRow","statusText":"TitleBarGraphCard-module__statusText","statusRunning":"TitleBarGraphCard-module__statusRunning","statusFinished":"TitleBarGraphCard-module__statusFinished","statusError":"TitleBarGraphCard-module__statusError","statusPending":"TitleBarGraphCard-module__statusPending","nodeCount":"TitleBarGraphCard-module__nodeCount","graphCardContent":"TitleBarGraphCard-module__graphCardContent","stopAndTimeWrapper":"TitleBarGraphCard-module__stopAndTimeWrapper","stopButton":"TitleBarGraphCard-module__stopButton","nodeStopButton":"TitleBarGraphCard-module__nodeStopButton","timeRemaining":"TitleBarGraphCard-module__timeRemaining","timeElapsedText":"TitleBarGraphCard-module__timeElapsedText"});
;// ./src/modules/TopbarMenu/TitleBarNodeCard/styles/TitleBarNodeCard.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var TitleBarNodeCard_module = ({"wrapper":"TitleBarNodeCard-module__wrapper","hoverRegion":"TitleBarNodeCard-module__hoverRegion","indicatorWrapper":"TitleBarNodeCard-module__indicatorWrapper","textWrapper":"TitleBarNodeCard-module__textWrapper","topRowWrapper":"TitleBarNodeCard-module__topRowWrapper","bottomRowWrapper":"TitleBarNodeCard-module__bottomRowWrapper","statusContainer":"TitleBarNodeCard-module__statusContainer","running":"TitleBarNodeCard-module__running","timeRemainingText":"TitleBarNodeCard-module__timeRemainingText","statusRunning":"TitleBarNodeCard-module__statusRunning","statusRunningValue":"TitleBarNodeCard-module__statusRunningValue","finished":"TitleBarNodeCard-module__finished","statusFinished":"TitleBarNodeCard-module__statusFinished","error":"TitleBarNodeCard-module__error","statusError":"TitleBarNodeCard-module__statusError","pending":"TitleBarNodeCard-module__pending","statusPending":"TitleBarNodeCard-module__statusPending","nodeRunningLabel":"TitleBarNodeCard-module__nodeRunningLabel","noNodeRunningLabel":"TitleBarNodeCard-module__noNodeRunningLabel"});
;// ./src/modules/TopbarMenu/styles/TitleBarTooltipContent.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var TitleBarTooltipContent_module = ({"tooltipContent":"TitleBarTooltipContent-module__tooltipContent","tooltipRow":"TitleBarTooltipContent-module__tooltipRow","tooltipLabel":"TitleBarTooltipContent-module__tooltipLabel","tooltipValue":"TitleBarTooltipContent-module__tooltipValue"});
;// ./src/modules/TopbarMenu/TitleBarNodeCard/TitleBarNodeTooltipContent.tsx





const TitleBarTooltipContent = () => {
    const { runStatus } = useWebSocketData();
    return ((0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipContent, children: [(0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipRow, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipLabel, children: "Run start:" }), (0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipValue, children: formatDate(runStatus?.node?.run_start) })] }), (0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipRow, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipLabel, children: "Status:" }), (0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipValue, children: capitalize(runStatus?.node?.status ?? "") })] }), (0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipRow, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipLabel, children: "Run duration:" }), (0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipValue, children: formatTime(runStatus?.node?.run_duration ?? 0) })] }), runStatus?.node?.id && runStatus?.node?.id !== -1 && ((0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipRow, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipLabel, children: "idx:" }), (0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipValue, children: runStatus?.node?.id })] }))] }));
};
/* harmony default export */ var TitleBarNodeTooltipContent = (TitleBarTooltipContent);

;// ./src/ui-lib/Icons/CircularLoaderPercentage.tsx


const CircularLoaderPercentage = ({ percentage = 0, color = "#3CDEF8", width = 30, height = 30, }) => {
    const normalizedPercentage = Math.max(0, Math.min(percentage, 100));
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - normalizedPercentage / 100);
    return ((0,jsx_runtime.jsxs)("svg", { xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 30 30", fill: "none", children: [(0,jsx_runtime.jsx)("circle", { cx: "15", cy: "15", r: "14", stroke: "#42424C", strokeWidth: "1", fill: "none" }), (0,jsx_runtime.jsx)("circle", { cx: "15", cy: "15", r: "14", stroke: color, strokeWidth: "1.8", fill: "none", strokeDasharray: circumference, strokeDashoffset: offset, strokeLinecap: "round", style: {
                    transition: "stroke-dashoffset 0.5s ease-in-out",
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                } }), (0,jsx_runtime.jsxs)("text", { x: "50%", y: "52%", textAnchor: "middle", dominantBaseline: "middle", fill: color, fontFamily: "Roboto, sans-serif", fontSize: "9px", fontWeight: "700", children: [Math.round(normalizedPercentage), "%"] })] }));
};
/* harmony default export */ var Icons_CircularLoaderPercentage = (CircularLoaderPercentage);

;// ./src/ui-lib/Icons/NoGraphRunningIcon.tsx


const NoGraphRunningIcon = ({ width = 28, height = 28 }) => {
    return ((0,jsx_runtime.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", width: width, height: height, viewBox: "0 0 28 28", fill: "none", children: (0,jsx_runtime.jsx)("path", { opacity: "0.5", d: "M20.5 20.5L16.6765 16.6765M11.3235 11.3235L7.5 7.5M19.3529 23.1765C19.3529 25.2881 21.0648 27 23.1765 27C25.2881 27 27 25.2881 27 23.1765C27 21.0648 25.2881 19.3529 23.1765 19.3529C21.0648 19.3529 19.3529 21.0648 19.3529 23.1765ZM10.1765 14C10.1765 16.1117 11.8883 17.8235 14 17.8235C16.1117 17.8235 17.8235 16.1117 17.8235 14C17.8235 11.8883 16.1117 10.1765 14 10.1765C11.8883 10.1765 10.1765 11.8883 10.1765 14ZM1 4.82353C1 6.93521 2.71185 8.64706 4.82353 8.64706C6.93521 8.64706 8.64706 6.93521 8.64706 4.82353C8.64706 2.71185 6.93521 1 4.82353 1C2.71185 1 1 2.71185 1 4.82353Z", stroke: "#A5ACB6", strokeWidth: "1.6" }) }));
};
/* harmony default export */ var Icons_NoGraphRunningIcon = (NoGraphRunningIcon);

;// ./src/ui-lib/Icons/NoNodeRunningIcon.tsx


const NoNodeRunningIcon = ({ className, width = 28, height = 28, }) => {
    return ((0,jsx_runtime.jsxs)("svg", { className: className, width: width, height: height, viewBox: "0 0 28 28", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0,jsx_runtime.jsxs)("g", { opacity: "0.5", children: [(0,jsx_runtime.jsx)("path", { d: "M19.3529 23.1765C19.3529 25.2881 21.0648 27 23.1765 27C25.2881 27 27 25.2881 27 23.1765C27 21.0648 25.2881 19.3529 23.1765 19.3529C21.0648 19.3529 19.3529 21.0648 19.3529 23.1765Z", stroke: "var(--grey-highlight)", strokeWidth: "1.6", strokeDasharray: "1 1" }), (0,jsx_runtime.jsx)("path", { d: "M1 4.82353C1 6.93521 2.71185 8.64706 4.82353 8.64706C6.93521 8.64706 8.64706 6.93521 8.64706 4.82353C8.64706 2.71185 6.93521 1 4.82353 1C2.71185 1 1 2.71185 1 4.82353Z", stroke: "var(--grey-highlight)", strokeWidth: "1.6", strokeDasharray: "1 1" })] }), (0,jsx_runtime.jsx)("circle", { opacity: "0.5", cx: "14", cy: "14", r: "6", stroke: "#A5ACB6", strokeWidth: "1.6" })] }));
};
/* harmony default export */ var Icons_NoNodeRunningIcon = (NoNodeRunningIcon);

;// ./src/modules/TopbarMenu/TitleBarNodeCard/TitleBarStatusIndicator.tsx







const StatusIndicator = (status, percentage, sizes, useNodeIcons = false) => {
    if (status === "Running") {
        const { width = 48, height = 48 } = sizes?.Running || {};
        return (0,jsx_runtime.jsx)(Icons_CircularLoaderPercentage, { percentage: percentage ?? 0, width: width, height: height });
    }
    if (status === "Finished") {
        const { width = 48, height = 48 } = sizes?.Finished || {};
        return (0,jsx_runtime.jsx)(Icons_CheckmarkIcon, { width: width, height: height });
    }
    if (status === "Error") {
        const { width = 48, height = 48 } = sizes?.Error || {};
        return (0,jsx_runtime.jsx)(Icons_ErrorIcon, { width: width, height: height });
    }
    if (status === "Pending") {
        const { width = 32, height = 32 } = sizes?.Pending || {};
        const PendingIcon = useNodeIcons ? Icons_NoNodeRunningIcon : Icons_NoGraphRunningIcon;
        return (0,jsx_runtime.jsx)(PendingIcon, { width: width, height: height });
    }
    return null;
};

;// ./src/modules/TopbarMenu/TitleBarNodeCard/TitleBarGetStatusLabelElement.tsx


/* eslint-disable css-modules/no-unused-class */


const getStatusLabelElement = (status, currentAction) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === "running") {
        return ((0,jsx_runtime.jsxs)("div", { className: classNames(TitleBarNodeCard_module.statusContainer, TitleBarNodeCard_module.statusRunning), children: ["Running", (0,jsx_runtime.jsx)("span", { className: TitleBarNodeCard_module.statusRunningValue, children: currentAction ? `: ${currentAction}` : "" })] }));
    }
    if (normalizedStatus === "finished") {
        return (0,jsx_runtime.jsx)("div", { className: classNames(TitleBarNodeCard_module.statusContainer, TitleBarNodeCard_module.statusFinished), children: "Finished" });
    }
    if (normalizedStatus === "error") {
        return (0,jsx_runtime.jsx)("div", { className: classNames(TitleBarNodeCard_module.statusContainer, TitleBarNodeCard_module.statusError), children: "Error" });
    }
    return (0,jsx_runtime.jsx)("div", { className: classNames(TitleBarNodeCard_module.statusContainer, TitleBarNodeCard_module.statusPending), children: "Select and Run Node" });
};

;// ./src/modules/TopbarMenu/constants.ts
const DEFAULT_TOOLTIP_SX = {
    backgroundColor: "#42424C",
    padding: "12px",
    borderRadius: "6px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
};

;// ./src/modules/TopbarMenu/TitleBarNodeCard/TitleBarNodeCard.tsx


/* eslint-disable css-modules/no-unused-class */










const TitleBarNodeCard = () => {
    const { openTab, setActiveTabsetName } = FlexLayoutContext_useFlexLayoutContext();
    const { runStatus } = useWebSocketData();
    const handleOnClick = (0,react.useCallback)(() => {
        openTab("nodes");
        setActiveTabsetName("nodes");
    }, [openTab, setActiveTabsetName]);
    return ((0,jsx_runtime.jsx)(Tooltip/* default */.A, { title: (0,jsx_runtime.jsx)(TitleBarNodeTooltipContent, {}), placement: "bottom", componentsProps: { tooltip: { sx: DEFAULT_TOOLTIP_SX } }, children: (0,jsx_runtime.jsx)("div", { onClick: handleOnClick, className: TitleBarNodeCard_module.hoverRegion, children: (0,jsx_runtime.jsxs)("div", { className: classNames(TitleBarNodeCard_module.wrapper, getWrapperClass(runStatus?.node?.status ?? "", TitleBarNodeCard_module)), children: [(0,jsx_runtime.jsx)("div", { className: TitleBarNodeCard_module.indicatorWrapper, children: StatusIndicator(capitalize(runStatus?.node?.status ?? "pending"), runStatus?.node?.percentage_complete ?? 0, {
                            Running: { width: 30, height: 30 },
                            Finished: { width: 38, height: 38 },
                            Error: { width: 20, height: 20 },
                            Pending: { width: 26, height: 26 },
                        }, true) }), (0,jsx_runtime.jsxs)("div", { className: TitleBarNodeCard_module.textWrapper, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarNodeCard_module.topRowWrapper, children: runStatus?.node?.status?.toLowerCase() === "pending" ? ((0,jsx_runtime.jsx)("div", { className: TitleBarNodeCard_module.noNodeRunningLabel, children: "No node is running" })) : ((0,jsx_runtime.jsxs)("div", { className: TitleBarNodeCard_module.nodeRunningLabel, children: [runStatus?.node?.id || runStatus?.node?.name ? "Active Node:" : "No node is running", "\u00A0\u00A0", runStatus?.node?.id === -1
                                            ? runStatus?.node?.name
                                            : runStatus?.node?.id && runStatus?.node?.name
                                                ? `#${runStatus?.node?.id} ${runStatus?.node?.name}`
                                                : ""] })) }), (0,jsx_runtime.jsxs)("div", { className: TitleBarNodeCard_module.bottomRowWrapper, children: [getStatusLabelElement(runStatus?.node?.status ?? undefined, runStatus?.node?.current_action ?? undefined), runStatus?.node?.status?.toLowerCase() === "running" && runStatus?.node?.percentage_complete > 0 && ((0,jsx_runtime.jsxs)("div", { className: TitleBarNodeCard_module.timeRemainingText, children: [formatTime(runStatus?.node?.time_remaining ?? 0), "\u00A0left"] }))] })] })] }) }) }));
};
/* harmony default export */ var TitleBarNodeCard_TitleBarNodeCard = (TitleBarNodeCard);

;// ./src/ui-lib/Icons/StopButtonIcon.tsx


const StopButtonIcon = ({ className, height = 24 }) => {
    return ((0,jsx_runtime.jsxs)("svg", { className: className, height: height, viewBox: "0 0 42 18", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [(0,jsx_runtime.jsx)("rect", { x: "0.5", y: "0.5", width: "41", height: "17", rx: "8", stroke: "#FF5586", strokeOpacity: "0.4", strokeWidth: "1" ///* <--- thinner stroke */
                , fill: "none" }), (0,jsx_runtime.jsx)("rect", { x: "6", y: "6", width: "6", height: "6", rx: "0.5", fill: "#FF5586" }), (0,jsx_runtime.jsx)("text", { x: "16", y: "12", fill: "#FF5586", fontSize: "8", fontWeight: "500", fontFamily: "Roboto, sans-serif", textAnchor: "start", dominantBaseline: "center", children: "STOP" })] }));
};
/* harmony default export */ var Icons_StopButtonIcon = (StopButtonIcon);

;// ./src/modules/TopbarMenu/TitleBarGraphCard/TitleBarGraphTooltipContent.tsx





const TitleBarGraphTooltipContent = () => {
    const { runStatus } = useWebSocketData();
    return ((0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipContent, children: [(0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipRow, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipLabel, children: "Run start:" }), (0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipValue, children: formatDate(runStatus?.graph?.run_start) })] }), (0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipRow, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipLabel, children: "Status:" }), (0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipValue, children: capitalize(runStatus?.graph?.status ?? "pending") })] }), (0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipRow, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipLabel, children: "Run duration:" }), (0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipValue, children: formatTime(runStatus?.graph?.run_duration ?? 0) })] }), (0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipRow, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarTooltipContent_module.tooltipLabel, children: "Graph progress:" }), (0,jsx_runtime.jsxs)("div", { className: TitleBarTooltipContent_module.tooltipValue, children: [runStatus?.graph?.finished_nodes, "/", runStatus?.graph?.total_nodes, " nodes completed"] })] })] }));
};
/* harmony default export */ var TitleBarGraphCard_TitleBarGraphTooltipContent = (TitleBarGraphTooltipContent);

;// ./src/modules/TopbarMenu/TitleBarGraphCard/TitleBarGraphCard.tsx


/* eslint-disable css-modules/no-unused-class */











const TitleBarGraphCard = () => {
    const { runStatus } = useWebSocketData();
    const { openTab, setActiveTabsetName } = FlexLayoutContext_useFlexLayoutContext();
    const handleOnClick = (0,react.useCallback)(() => {
        openTab(runStatus?.graph?.status === "pending" ? "graph-library" : "graph-status");
        setActiveTabsetName(runStatus?.graph?.status === "pending" ? "graph-library" : "graph-status");
    }, [openTab, setActiveTabsetName, runStatus?.graph?.status]);
    const renderElapsedTime = (time) => ((0,jsx_runtime.jsx)("div", { className: TitleBarGraphCard_module.stopAndTimeWrapper, children: (0,jsx_runtime.jsxs)("div", { className: TitleBarGraphCard_module.timeRemaining, children: [(0,jsx_runtime.jsx)("div", { children: "Elapsed time:" }), (0,jsx_runtime.jsx)("div", { className: TitleBarGraphCard_module.timeElapsedText, children: formatTime(time) })] }) }));
    const handleStopClick = async () => {
        SnapshotsApi.stopNodeRunning();
    };
    return ((0,jsx_runtime.jsx)("div", { className: `${TitleBarGraphCard_module.graphCardWrapper} ${getWrapperClass(runStatus?.graph?.status ?? "pending", TitleBarGraphCard_module)}`, children: (0,jsx_runtime.jsxs)("div", { className: runStatus?.graph?.status === "pending" ? TitleBarGraphCard_module.defaultGraphCardContent : TitleBarGraphCard_module.graphCardContent, children: [(0,jsx_runtime.jsx)(Tooltip/* default */.A, { title: (0,jsx_runtime.jsx)(TitleBarGraphCard_TitleBarGraphTooltipContent, {}), placement: "bottom", componentsProps: { tooltip: { sx: DEFAULT_TOOLTIP_SX } }, children: (0,jsx_runtime.jsxs)("div", { onClick: handleOnClick, className: TitleBarGraphCard_module.hoverRegion, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarGraphCard_module.indicatorWrapper, children: StatusIndicator(capitalize(runStatus?.graph?.status ?? "pending"), runStatus?.graph?.percentage_complete ?? 0, {
                                    Running: { width: 48, height: 48 },
                                    Finished: { width: 48, height: 48 },
                                    Error: { width: 48, height: 48 },
                                    Pending: { width: 32, height: 32 },
                                }, false) }), (0,jsx_runtime.jsx)("div", { className: TitleBarGraphCard_module.textWrapper, children: !runStatus?.graph?.status ? ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)("div", { className: TitleBarGraphCard_module.graphTitleDefault, children: "No graph is running" }), (0,jsx_runtime.jsx)("div", { className: TitleBarGraphCard_module.graphStatusRow, children: (0,jsx_runtime.jsx)("div", { className: TitleBarGraphCard_module.statusPending, children: "Select and Run Calibration Graph" }) })] })) : ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsxs)("div", { className: TitleBarGraphCard_module.graphTitle, children: ["Graph: ", runStatus?.graph?.name || "No graph is running"] }), (0,jsx_runtime.jsxs)("div", { className: TitleBarGraphCard_module.graphStatusRow, children: [(0,jsx_runtime.jsx)("div", { className: `${TitleBarGraphCard_module.statusText} ${getStatusClass(runStatus?.graph?.status ?? "pending", TitleBarGraphCard_module)}`, children: runStatus?.graph?.status }), runStatus?.graph?.status !== "finished" && ((0,jsx_runtime.jsxs)("div", { className: TitleBarGraphCard_module.nodeCount, children: [runStatus?.graph?.finished_nodes, "/", runStatus?.graph?.total_nodes, " nodes finished"] }))] })] })) })] }) }), (0,jsx_runtime.jsx)(TitleBarNodeCard_TitleBarNodeCard, {}), runStatus?.graph?.status === "running" && ((0,jsx_runtime.jsxs)("div", { className: TitleBarGraphCard_module.stopAndTimeWrapper, children: [(0,jsx_runtime.jsx)("div", { className: TitleBarGraphCard_module.stopButton, onClick: handleStopClick, children: (0,jsx_runtime.jsx)(Icons_StopButtonIcon, {}) }), runStatus?.graph?.time_remaining && ((0,jsx_runtime.jsxs)("div", { className: TitleBarGraphCard_module.timeRemaining, children: [formatTime(runStatus?.graph?.time_remaining), " left"] }))] })), ["finished", "error"].includes(runStatus?.graph?.status ?? "pending") &&
                    runStatus?.graph?.run_duration &&
                    runStatus?.graph?.run_duration > 0 &&
                    renderElapsedTime(runStatus?.graph?.run_duration), runStatus?.graph?.status === "pending" && runStatus?.node?.status === "running" && ((0,jsx_runtime.jsx)("div", { className: TitleBarGraphCard_module.nodeStopButton, onClick: handleStopClick, children: (0,jsx_runtime.jsx)(Icons_StopButtonIcon, {}) })), runStatus?.graph?.status === "pending" &&
                    ["finished", "error"].includes(runStatus?.node?.status ?? "pending") &&
                    runStatus?.node?.run_duration &&
                    runStatus?.node?.run_duration > 0 &&
                    renderElapsedTime(runStatus?.node?.run_duration)] }) }));
};
/* harmony default export */ var TitleBarGraphCard_TitleBarGraphCard = (TitleBarGraphCard);

;// ./src/modules/TopbarMenu/TitleBarMenu.tsx


// eslint-disable-next-line css-modules/no-unused-class





const TopBar = () => {
    const { activeTab } = FlexLayoutContext_useFlexLayoutContext();
    return activeTab === PROJECT_KEY ? null : (0,jsx_runtime.jsx)(TitleBarGraphCard_TitleBarGraphCard, {});
};
const TitleBarMenu = () => {
    const { activeTab, topBarAdditionalComponents } = FlexLayoutContext_useFlexLayoutContext();
    return ((0,jsx_runtime.jsxs)("div", { className: TitleBarMenu_module.wrapper, children: [(0,jsx_runtime.jsx)(Page_PageName, { children: routing_ModulesRegistry[activeTab ?? ""]?.menuItem?.title ?? "" }), topBarAdditionalComponents && topBarAdditionalComponents[activeTab ?? ""], (0,jsx_runtime.jsx)("div", { className: TitleBarMenu_module.menuCardsWrapper, children: (0,jsx_runtime.jsx)(TopBar, {}) })] }));
};
/* harmony default export */ var TopbarMenu_TitleBarMenu = (TitleBarMenu);

;// ./src/contexts/TitleBarMenuContext.tsx


const TitleBarContext = react.createContext(null);
function TitleBarContextProvider(props) {
    const { children } = props;
    const [menuCards, setMenuCards] = (0,react.useState)([]);
    const addMenuCard = (menuCard, place) => {
        if (place !== undefined) {
            const updatedMenuCards = [...menuCards];
            updatedMenuCards.splice(place, 0, menuCard);
            setMenuCards(updatedMenuCards);
            return;
        }
        setMenuCards([...menuCards, menuCard]);
    };
    const removeMenuCard = (id) => {
        setMenuCards(menuCards.filter((m) => m.id !== id));
    };
    return ((0,jsx_runtime.jsx)(TitleBarContext.Provider, { value: {
            actions: {
                addMenuCard,
                removeMenuCard,
            },
            values: {
                menuCards,
            },
        }, children: children }));
}
function useTitleBarContextProvider() {
    const context = useContext(TitleBarContext);
    if (!context) {
        throw new Error("useTitleBarContextProvider must be used within a TitleBarContextProvider");
    }
    return context;
}

;// ./src/modules/RightSidebar/context/RightSidePanelContext.tsx



const RightSidePanelContext = react.createContext({
    logs: [],
});
const useRightSidePanelContext = () => (0,react.useContext)(RightSidePanelContext);
function RightSidePanelContextProvider(props) {
    const [logs, setLogs] = (0,react.useState)([]);
    const checkNewLogs = async () => {
        const maxNumberOfLogs = 300;
        const after = logs.length > 0 ? logs[logs.length - 1]?.asctime : null;
        const response = await NodesApi.getLogs(after, null, maxNumberOfLogs.toString());
        if (response.isOk && response.result) {
            const newLogs = response.result;
            if (newLogs.length === maxNumberOfLogs) {
                setLogs(newLogs);
            }
            else if (newLogs.length > 0) {
                const updatedLogs = [...newLogs, ...logs].slice(0, maxNumberOfLogs);
                setLogs(updatedLogs);
            }
        }
    };
    (0,react.useEffect)(() => {
        const checkInterval = setInterval(async () => checkNewLogs(), 1000);
        return () => clearInterval(checkInterval);
    }, [logs]);
    return ((0,jsx_runtime.jsx)(RightSidePanelContext.Provider, { value: {
            logs,
        }, children: props.children }));
}

;// ./src/modules/RightSidebar/styles/RightSidePanel.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var RightSidePanel_module = ({"wrapper":"RightSidePanel-module__wrapper","tabContainer":"RightSidePanel-module__tabContainer","tabContainerSelected":"RightSidePanel-module__tabContainerSelected","sliderPanelWrapperLogger":"RightSidePanel-module__sliderPanelWrapperLogger","sliderPanelWrapper":"RightSidePanel-module__sliderPanelWrapper"});
;// ./src/modules/RightSidebar/Logs/styles/LogsPanel.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var LogsPanel_module = ({"panelHeader":"LogsPanel-module__panelHeader","panelHeaderSpan":"LogsPanel-module__panelHeaderSpan","panelContent":"LogsPanel-module__panelContent","logsTimestamp":"LogsPanel-module__logsTimestamp","logsMessage":"LogsPanel-module__logsMessage"});
;// ./src/modules/RightSidebar/Logs/LogsPanel.tsx





const LogsPanel = () => {
    const { logs } = useRightSidePanelContext();
    return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)("div", { className: LogsPanel_module.panelHeader, children: (0,jsx_runtime.jsx)("span", { className: LogsPanel_module.panelHeaderSpan, children: "LOGS" }) }), (0,jsx_runtime.jsx)("div", { className: LogsPanel_module.panelContent, children: logs.map((log, index) => {
                    return ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("div", { className: LogsPanel_module.logsTimestamp, children: `${formatDateTime(log.asctime)} - ${log.name} - ${log.levelname}` }), (0,jsx_runtime.jsxs)("div", { className: LogsPanel_module.logsMessage, children: [log.message?.split("\\n").map((item, idx) => {
                                        return ((0,jsx_runtime.jsxs)("span", { children: [item, (0,jsx_runtime.jsx)("br", {})] }, idx));
                                    }), log.exc_info ? (0,jsx_runtime.jsx)("br", {}) : "", log.exc_info?.split("\\n").map((item, idx) => {
                                        return ((0,jsx_runtime.jsxs)("span", { children: [item, (0,jsx_runtime.jsx)("br", {})] }, idx));
                                    })] })] }, `${log.name}_${index}`));
                }) })] }));
};

;// ./src/modules/RightSidebar/QuamPanel/styles/QuamPanel.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var QuamPanel_module = ({"panelHeader":"QuamPanel-module__panelHeader","panelHeaderContent":"QuamPanel-module__panelHeaderContent","panelContent":"QuamPanel-module__panelContent","trackLatestWrapper":"QuamPanel-module__trackLatestWrapper","idWrapper":"QuamPanel-module__idWrapper"});
;// ./src/modules/RightSidebar/QuamPanel/components/PanelHeader/PanelHeader.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var PanelHeader_module = ({"panelHeader":"PanelHeader-module__panelHeader","panelHeaderSpan":"PanelHeader-module__panelHeaderSpan","panelHeaderContent":"PanelHeader-module__panelHeaderContent","trackLatestWrapper":"PanelHeader-module__trackLatestWrapper","idWrapper":"PanelHeader-module__idWrapper","title":"PanelHeader-module__title"});
;// ./src/common/ui-components/common/ToggleSwitchRightPanel/ToggleSwitchRightPanel.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var ToggleSwitchRightPanel_module = ({"toggleSwitch":"ToggleSwitchRightPanel-module__toggleSwitch","toggleOn":"ToggleSwitchRightPanel-module__toggleOn","toggleOff":"ToggleSwitchRightPanel-module__toggleOff","toggleKnob":"ToggleSwitchRightPanel-module__toggleKnob"});
;// ./src/common/ui-components/common/ToggleSwitchRightPanel/ToggleSwitchRightPanel.tsx



const ToggleSwitchRightPanel = ({ isOn, onToggle }) => ((0,jsx_runtime.jsx)("div", { className: `${ToggleSwitchRightPanel_module.toggleSwitch} ${isOn ? ToggleSwitchRightPanel_module.toggleOn : ToggleSwitchRightPanel_module.toggleOff}`, onClick: onToggle, children: (0,jsx_runtime.jsx)("div", { className: `${ToggleSwitchRightPanel_module.toggleKnob} ${isOn ? ToggleSwitchRightPanel_module.toggleOn : ToggleSwitchRightPanel_module.toggleOff}` }) }));

;// ./src/modules/RightSidebar/QuamPanel/components/IdInputField/IdInputField.tsx



const IdInputField = ({ onChange, onConfirm, value, isFirstId, disabled, onFocus }) => ((0,jsx_runtime.jsx)(Input_InputField, { disabled: disabled, value: value, placeholder: "", onChange: onChange, onFocus: onFocus, onKeyDown: (e) => {
        if (e.key === "Enter" && onConfirm) {
            onConfirm(e.target.value, !!isFirstId);
        }
    } }));

;// ./src/modules/RightSidebar/QuamPanel/components/PanelHeader/PanelHeader.tsx


// eslint-disable-next-line css-modules/no-unused-class



const PanelHeader = ({ trackLatest, onToggleTrackLatest, onIdChange, idValue, onConfirm, onFocus }) => ((0,jsx_runtime.jsxs)("div", { className: PanelHeader_module.panelHeader, children: [(0,jsx_runtime.jsx)("span", { className: PanelHeader_module.panelHeaderSpan, children: "QUAM" }), (0,jsx_runtime.jsx)("div", { className: PanelHeader_module.panelHeaderContent, children: (0,jsx_runtime.jsxs)("div", { className: PanelHeader_module.trackLatestWrapper, children: [(0,jsx_runtime.jsx)("span", { children: "Track latest" }), (0,jsx_runtime.jsx)(ToggleSwitchRightPanel, { isOn: trackLatest, onToggle: onToggleTrackLatest })] }) }), (0,jsx_runtime.jsxs)("div", { className: PanelHeader_module.idWrapper, children: [(0,jsx_runtime.jsx)("div", { children: "ID:" }), (0,jsx_runtime.jsx)(IdInputField, { onChange: onIdChange, value: idValue, onConfirm: onConfirm, isFirstId: true, disabled: trackLatest, onFocus: onFocus })] })] }));

;// ./src/modules/RightSidebar/QuamPanel/components/PanelUpdates/PanelUpdates.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var PanelUpdates_module = ({"panelUpdates":"PanelUpdates-module__panelUpdates","panelHeaderSpan":"PanelUpdates-module__panelHeaderSpan","panelHeaderContent":"PanelUpdates-module__panelHeaderContent","idWrapper":"PanelUpdates-module__idWrapper","trackLatestWrapper":"PanelUpdates-module__trackLatestWrapper"});
;// ./src/modules/RightSidebar/QuamPanel/components/PanelUpdates/PanelUpdates.tsx


// eslint-disable-next-line css-modules/no-unused-class



const PanelUpdates = ({ previousSnapshot, onTogglePrevious, onSecondIdChange, idValue, onConfirm }) => ((0,jsx_runtime.jsxs)("div", { className: PanelUpdates_module.panelUpdates, children: [(0,jsx_runtime.jsx)("div", { children: (0,jsx_runtime.jsx)("span", { className: PanelUpdates_module.panelHeaderSpan, children: "QUAM Updates" }) }), (0,jsx_runtime.jsx)("div", { className: PanelUpdates_module.panelHeaderContent, children: (0,jsx_runtime.jsxs)("div", { className: PanelUpdates_module.idWrapper, children: [(0,jsx_runtime.jsx)("div", { children: "Compare with:" }), (0,jsx_runtime.jsxs)("div", { className: PanelUpdates_module.trackLatestWrapper, children: [(0,jsx_runtime.jsx)("span", { children: "Prev" }), (0,jsx_runtime.jsx)(ToggleSwitchRightPanel, { isOn: previousSnapshot, onToggle: onTogglePrevious })] }), (0,jsx_runtime.jsxs)("div", { className: PanelUpdates_module.idWrapper, children: [(0,jsx_runtime.jsx)("div", { children: "ID:" }), (0,jsx_runtime.jsx)(IdInputField, { onChange: onSecondIdChange, value: idValue, onConfirm: onConfirm, disabled: previousSnapshot })] })] }) })] }));

;// ./src/modules/RightSidebar/QuamPanel/QuamPanel.tsx

 // eslint-disable-next-line css-modules/no-unused-class





const QuamPanel = () => {
    // const [trackLatestSidePanel, setTrackLatestSidePanel] = useState(true);
    // const [trackPreviousSnapshot, setTrackPreviousSnapshot] = useState(true);
    const [firstIdSelectionMode, setFirstIdSelectionMode] = (0,react.useState)("latest");
    const { trackLatestSidePanel, setTrackLatestSidePanel, trackPreviousSnapshot, setTrackPreviousSnapshot, jsonDataSidePanel, diffData, fetchOneSnapshot, latestSnapshotId, selectedSnapshotId, clickedForSnapshotSelection, setClickedForSnapshotSelection, firstId, setFirstId, secondId, setSecondId, } = useSnapshotsContext();
    // const { selectedPageName } = useFlexLayoutContext();
    (0,react.useEffect)(() => {
        if (clickedForSnapshotSelection) {
            setFirstIdSelectionMode("selection");
            setTrackLatestSidePanel(false);
            if (trackPreviousSnapshot) {
                fetchOneSnapshot(Number(selectedSnapshotId), Number(selectedSnapshotId) - 1, false, true);
            }
            else {
                fetchOneSnapshot(Number(selectedSnapshotId), Number(secondId), false, true);
            }
            setClickedForSnapshotSelection(false);
        }
    }, [clickedForSnapshotSelection]);
    (0,react.useEffect)(() => {
        if (trackPreviousSnapshot) {
            setSecondId((firstId && Number(firstId) - 1 >= 0 ? Number(firstId) - 1 : 0).toString());
        }
    }, [firstId, setFirstId, trackPreviousSnapshot]);
    (0,react.useEffect)(() => {
        // if (selectedPageName === "data") {
        if (firstIdSelectionMode === "latest") {
            setFirstId(latestSnapshotId?.toString() ?? "0");
        }
        else if (firstIdSelectionMode === "selection") {
            setFirstId(selectedSnapshotId?.toString() ?? "0");
            if (latestSnapshotId && selectedSnapshotId && latestSnapshotId === selectedSnapshotId) {
                setTrackLatestSidePanel(true);
            }
            else {
                setTrackLatestSidePanel(false);
            }
            // setFirstIdSelectionMode("selection");
        }
        else if (firstIdSelectionMode === "input") {
            setTrackLatestSidePanel(false);
            setClickedForSnapshotSelection(false);
        }
        // }
    }, [firstIdSelectionMode, selectedSnapshotId, latestSnapshotId]);
    const onConfirm = (value, isFirstId) => {
        if (isFirstId) {
            setFirstId(value);
        }
        else {
            setSecondId(value);
        }
        fetchOneSnapshot(Number(firstId), Number(secondId), false, true);
    };
    const onFocus = () => {
        setFirstIdSelectionMode("input");
    };
    const onToggleTrackLatest = () => {
        if (!trackLatestSidePanel) {
            setFirstIdSelectionMode("latest");
            setClickedForSnapshotSelection(false);
            fetchOneSnapshot(Number(latestSnapshotId), Number(latestSnapshotId) - 1, false, true);
        }
        else {
            setFirstIdSelectionMode("selection");
            if (trackPreviousSnapshot) {
                fetchOneSnapshot(Number(selectedSnapshotId), Number(selectedSnapshotId) - 1, false, true);
            }
            else {
                fetchOneSnapshot(Number(selectedSnapshotId), Number(secondId), false, true);
            }
        }
        setTrackLatestSidePanel(!trackLatestSidePanel);
    };
    const onToggleTrackPrevious = () => {
        if (!trackPreviousSnapshot) {
            if (trackLatestSidePanel) {
                fetchOneSnapshot(Number(latestSnapshotId), Number(latestSnapshotId) - 1, false, true);
            }
            else {
                fetchOneSnapshot(Number(selectedSnapshotId), Number(selectedSnapshotId) - 1, false, true);
            }
        }
        else {
            fetchOneSnapshot(Number(firstId), Number(secondId), false, true);
        }
        setTrackPreviousSnapshot(!trackPreviousSnapshot);
    };
    return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)(PanelHeader, { trackLatest: trackLatestSidePanel, onToggleTrackLatest: onToggleTrackLatest, onIdChange: setFirstId, idValue: firstId, onConfirm: onConfirm, onFocus: onFocus }), (0,jsx_runtime.jsx)("div", { className: QuamPanel_module.panelContent, children: jsonDataSidePanel && (0,jsx_runtime.jsx)(JSONEditor, { title: "", jsonDataProp: jsonDataSidePanel, height: "100%" }) }), (0,jsx_runtime.jsx)(PanelUpdates, { previousSnapshot: trackPreviousSnapshot, onTogglePrevious: onToggleTrackPrevious, onSecondIdChange: setSecondId, 
                // idValue={selectedSnapshotId && selectedSnapshotId - 1 > 0 ? selectedSnapshotId - 1 : 0}
                idValue: secondId, onConfirm: onConfirm }), (0,jsx_runtime.jsx)("div", { className: QuamPanel_module.panelContent, children: diffData && (0,jsx_runtime.jsx)(JSONEditor, { title: "", jsonDataProp: diffData, height: "94%" }) })] }));
};

;// ./src/modules/RightSidebar/RightSidePanel.tsx






const RightSidePanel = () => {
    const [isQuamOpen, setIsQuamOpen] = (0,react.useState)(false);
    const [isLogsOpen, setIsLogsOpen] = (0,react.useState)(false);
    const onQuamClick = () => {
        setIsQuamOpen(!isQuamOpen);
        setIsLogsOpen(false);
    };
    const onLogsClick = () => {
        setIsLogsOpen(!isLogsOpen);
        setIsQuamOpen(false);
    };
    return ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsxs)("div", { className: RightSidePanel_module.wrapper, children: [(0,jsx_runtime.jsx)("div", { className: classNames(RightSidePanel_module.tabContainer, isQuamOpen && RightSidePanel_module.tabContainerSelected), onClick: onQuamClick, children: (0,jsx_runtime.jsx)("span", { children: "QUAM" }) }), (0,jsx_runtime.jsx)("div", { className: classNames(RightSidePanel_module.tabContainer, isLogsOpen && RightSidePanel_module.tabContainerSelected), onClick: onLogsClick, children: (0,jsx_runtime.jsx)("span", { children: "LOGS" }) })] }), (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [isLogsOpen && ((0,jsx_runtime.jsx)("div", { className: RightSidePanel_module.sliderPanelWrapperLogger, children: (0,jsx_runtime.jsx)(LogsPanel, {}) })), isQuamOpen && ((0,jsx_runtime.jsx)("div", { className: RightSidePanel_module.sliderPanelWrapper, children: (0,jsx_runtime.jsx)(QuamPanel, {}) }))] })] }));
};

;// ./src/ui-lib/layouts/MainLayout.tsx




// eslint-disable-next-line css-modules/no-unused-class








const EmptyPlaceholder = ((0,jsx_runtime.jsx)("div", { className: Layout_module.emptyPlaceholder, children: (0,jsx_runtime.jsx)(Icons_QUAlibrateLogoIcon, { height: 200, width: 400 }) }));
const MainLayout = ({ className, children }) => {
    const { pinSideMenu } = useGlobalThemeContext();
    return ((0,jsx_runtime.jsxs)("div", { className: Layout_module.wrapper, children: [(0,jsx_runtime.jsx)(SidebarMenu_SidebarMenu, {}), (0,jsx_runtime.jsx)("div", { className: classNames(Layout_module.content, pinSideMenu && Layout_module.addLeftMargin, className), children: (0,jsx_runtime.jsx)("div", { className: Layout_module.mainPageWrapper, children: (0,jsx_runtime.jsx)(TitleBarContextProvider, { children: (0,jsx_runtime.jsx)("div", { className: Layout_module.pageWrapper, children: (0,jsx_runtime.jsxs)("div", { className: Layout_module.pageWrapper1, children: [(0,jsx_runtime.jsx)(TopbarMenu_TitleBarMenu, {}), (0,jsx_runtime.jsxs)("div", { className: Layout_module.pageWrapper, children: [(0,jsx_runtime.jsx)("div", { className: Layout_module.pageWrapper1, children: children ?? EmptyPlaceholder }), (0,jsx_runtime.jsx)(RightSidePanelContextProvider, { children: (0,jsx_runtime.jsx)(RightSidePanel, {}) })] })] }) }) }) }) }), (0,jsx_runtime.jsx)(toastModule_ToastComponent, {})] }));
};
/* harmony default export */ var layouts_MainLayout = (MainLayout);

;// ./src/modules/Login/api/AuthApiRoutes.ts
const LOGIN = "login";

;// ./src/modules/Login/api/AuthApi.ts



class AuthApi extends Api {
    constructor() {
        super();
    }
    static api(path) {
        return this.address + path;
    }
    static login(password) {
        return this._fetch(this.api(LOGIN), API_METHODS.POST, {
            headers: BASIC_HEADERS,
            body: JSON.stringify(password),
        });
    }
}

;// ./src/dev.config.ts
const COMPONENTS_VISIBLE = false;
// export const SEARCH_MAIN_MENU_VISIBLE = true;
const HIDE_DELETE_BUTTON_ON_JOBS_PAGE = false;
const NEW_PROJECT_BUTTON_VISIBLE = true;
const TWEAK_BUTTON_VISIBLE = false;
const TRACKER_BUTTON_VISIBLE = false;
const THEME_TOGGLE_VISIBLE = true;
const READ_OUR_ARTICLES_VISIBLE = false;
const PROJECT_LAST_UPDATES_VISIBLE = false;
const DRIVER_FIELDS_VISIBLE = false;
const EDITING_FUNCTION_ACTIVE = true;
const SHOW_DEBUG = true;
// diamond icon
// export const SHOW_REAL_TIME_TRACKING = true;
// export const SHOW_SELECT_UNITS_BUTTON = true;
const SYSTEM_PANEL_VISIBLE = false;
const OFFLINE_MODE = false;
const SHOW_NOT_IMPLEMENTED = false;

;// ./src/modules/Login/context/AuthContext.tsx






const AuthContext = react.createContext(null);
const useAuthContext = () => {
    const context = (0,react.useContext)(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
};
function AuthContextProvider(props) {
    const { children } = props;
    const [isAuthorized, setIsAuthorized] = (0,react.useState)(false);
    const [triedLoginWithEmptyString, setTriedLoginWithEmptyString] = (0,react.useState)(false);
    const [authError, setAuthError] = (0,react.useState)(undefined);
    const navigate = (0,dist/* useNavigate */.Zp)();
    const getCookieStartingWith = (prefix) => {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            if (cookie.startsWith(prefix)) {
                return cookie;
            }
        }
        return null;
    };
    const checkIfThereIsCookie = () => {
        const cookiePrefix = "Qualibrate-Token=";
        const token = getCookieStartingWith(cookiePrefix);
        return token !== null;
    };
    const login = (0,react.useCallback)(async (password) => {
        const { isOk } = await AuthApi.login(password);
        const authIsOk = OFFLINE_MODE || isOk;
        setIsAuthorized(authIsOk);
        setAuthError(authIsOk ? undefined : "Failed to authorize");
        if (authIsOk) {
            navigate(HOME_URL);
        }
    }, [setIsAuthorized]);
    (0,react.useEffect)(() => {
        const initializeAuth = async () => {
            if (checkIfThereIsCookie()) {
                setIsAuthorized(true);
                navigate(HOME_URL);
            }
            else {
                login("").then(() => {
                    setTriedLoginWithEmptyString(true);
                });
                if (checkIfThereIsCookie()) {
                    setIsAuthorized(true);
                    navigate(HOME_URL);
                }
            }
        };
        initializeAuth();
    }, [navigate]);
    return ((0,jsx_runtime.jsx)(AuthContext.Provider, { value: {
            login,
            isAuthorized,
            triedLoginWithEmptyString,
            authError,
        }, children: children }));
}

;// ./src/mainPage/MainModularPage.tsx












const MainModularPage = () => {
    const { isAuthorized } = useAuthContext();
    const { model, checkIsEmpty, flexLayoutListener, openTab, setActiveTabsetName } = FlexLayoutContext_useFlexLayoutContext();
    const { activeProject, shouldGoToProjectPage } = useProjectContext();
    const navigate = (0,dist/* useNavigate */.Zp)();
    (0,react.useEffect)(() => {
        const checkVersion = async () => {
            const localVersion = localStorage.getItem("appVersion");
            try {
                const response = await fetch("manifest.json");
                const { version } = await response.json();
                if (localVersion && version !== localVersion) {
                    handleRefresh();
                }
                // Update the local storage with the current version
                localStorage.setItem("appVersion", version);
            }
            catch (error) {
                console.error("Failed to fetch version:", error);
            }
        };
        checkVersion();
    }, []);
    const handleRefresh = () => {
        try {
            // @ts-expect-error: Small fix to force hard refresh in order to clear the cache
            window.location.reload(true); // Hard refresh to clear cache
        }
        catch (error) {
            console.error("Failed to do the hard refresh and clear the cache:", error);
        }
    };
    (0,react.useEffect)(() => {
        if (!isAuthorized) {
            navigate(LOGIN_URL);
        }
        else if (!activeProject || shouldGoToProjectPage) {
            openTab(PROJECT_KEY);
            setActiveTabsetName(PROJECT_KEY);
        }
        else {
            openTab(NODES_KEY);
            setActiveTabsetName(NODES_KEY);
        }
    }, [isAuthorized, activeProject, shouldGoToProjectPage]);
    (0,react.useEffect)(checkIsEmpty, []);
    return ((0,jsx_runtime.jsx)(layouts_MainLayout, { children: (0,jsx_runtime.jsx)(lib.Layout, { factory: flexLayoutFactory, classNameMapper: flexClassNameMapper, onModelChange: checkIsEmpty, model: model, onAction: flexLayoutListener }) }));
};
/* harmony default export */ var mainPage_MainModularPage = (MainModularPage);

;// ./src/modules/Login/Login.module.scss
// extracted by mini-css-extract-plugin
/* harmony default export */ var Login_module = ({"content":"Login-module__content","welcomeInfo":"Login-module__welcomeInfo","wave":"Login-module__wave","welcomeContent":"Login-module__welcomeContent","rightPart":"Login-module__rightPart","version":"Login-module__version","form":"Login-module__form","title":"Login-module__title","inputWrapper":"Login-module__inputWrapper","input":"Login-module__input","loginButton":"Login-module__loginButton","errorMsg":"Login-module__errorMsg"});
;// ./src/modules/Login/welcomeWaves.png
var welcomeWaves_namespaceObject = __webpack_require__.p + "assets/welcomeWaves.346ba70b.png";
;// ./src/modules/Login/index.tsx








const Login = () => {
    const [password, setPassword] = (0,react.useState)("");
    const { login, authError } = useAuthContext();
    const validate = (value) => {
        if (value.length < 8) {
            return false;
        }
    };
    (0,react.useEffect)(() => {
        validate(password);
    }, [password]);
    const handleLogin = (0,react.useCallback)(() => {
        login(password);
    }, [password]);
    const handleLoginByEnter = (event) => {
        if (event.key === "Enter") {
            handleLogin();
        }
    };
    const inputDefaultProps = { onKeyUp: handleLoginByEnter };
    return ((0,jsx_runtime.jsxs)("div", { className: Login_module.content, children: [(0,jsx_runtime.jsx)(WelcomeInfo, {}), (0,jsx_runtime.jsxs)("div", { className: Login_module.rightPart, children: [(0,jsx_runtime.jsx)("div", { className: Login_module.version }), (0,jsx_runtime.jsxs)("div", { className: Login_module.form, onKeyUp: handleLoginByEnter, children: [(0,jsx_runtime.jsx)("div", { className: Login_module.title, children: "Login" }), (0,jsx_runtime.jsx)(Input_InputField, { inputClassName: Login_module.input, className: Login_module.inputWrapper, onChange: setPassword, type: "password", label: "Password", value: password, placeholder: "", ...inputDefaultProps }), (0,jsx_runtime.jsx)(Button_BlueButton, { className: Login_module.loginButton, onClick: handleLogin, ...inputDefaultProps, isBig: true, children: "Log In" }), (0,jsx_runtime.jsx)("div", { className: Login_module.errorMsg, children: authError })] }), (0,jsx_runtime.jsx)("div", {})] })] }));
};
function WelcomeInfo() {
    return ((0,jsx_runtime.jsxs)("div", { className: Login_module.welcomeInfo, children: [(0,jsx_runtime.jsx)("img", { src: welcomeWaves_namespaceObject, alt: "", className: Login_module.wave }), (0,jsx_runtime.jsxs)("div", { className: Login_module.welcomeContent, children: [(0,jsx_runtime.jsx)(Icons_QUAlibrateLogoIcon, {}), (0,jsx_runtime.jsx)("div", { children: "Welcome to QUAlibrate!" })] })] }));
}

;// ./src/routing/AppRoutes.tsx








const ProtectedRoute = ({ children }) => {
    const { isAuthorized, triedLoginWithEmptyString } = useAuthContext();
    if (!isAuthorized) {
        if (!triedLoginWithEmptyString) {
            return (0,jsx_runtime.jsx)(LoaderPage, {});
        }
        return (0,jsx_runtime.jsx)(dist/* Navigate */.C5, { to: LOGIN_URL, replace: true });
    }
    return children;
};
const AppRoutes = () => {
    return ((0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: (0,jsx_runtime.jsxs)(dist/* Routes */.BV, { children: [(0,jsx_runtime.jsx)(dist/* Route */.qh, { path: LOGIN_URL, element: (0,jsx_runtime.jsx)(Login, {}) }), (0,jsx_runtime.jsx)(dist/* Route */.qh, { path: HOME_URL, element: (0,jsx_runtime.jsx)(ProtectedRoute, { children: (0,jsx_runtime.jsx)(mainPage_MainModularPage, {}) }) }), (0,jsx_runtime.jsx)(dist/* Route */.qh, { path: "*", element: (0,jsx_runtime.jsx)(ProtectedRoute, { children: (0,jsx_runtime.jsx)(dist/* Navigate */.C5, { to: "/" }) }) })] }) }));
};
/* harmony default export */ var routing_AppRoutes = (AppRoutes);

// EXTERNAL MODULE: ./node_modules/react-router-dom/dist/index.js
var react_router_dom_dist = __webpack_require__(4976);
// EXTERNAL MODULE: ./node_modules/react-dom/client.js
var client = __webpack_require__(5338);
;// ./src/index.tsx

















const RouterProvider =  true ? react_router_dom_dist/* HashRouter */.I9 : 0;
const contextProviders = [
    ApiContextProvider,
    FlexLayoutContextProvider,
    AuthContextProvider,
    RouterProvider,
    GraphContextProvider,
    NodesContextProvider,
    SnapshotsContextProvider,
];
const Application = () => {
    (0,react.useEffect)(updateColorTheme, []);
    return ((0,jsx_runtime.jsx)(GlobalThemeContextProvider, { children: (0,jsx_runtime.jsx)(ProjectContextProvider, { children: (0,jsx_runtime.jsx)(WebSocketProvider, { children: contextProviders.reduce((Comp, Provider) => {
                    const TempProvider = Provider;
                    return (0,jsx_runtime.jsx)(TempProvider, { children: Comp });
                }, (0,jsx_runtime.jsx)(routing_AppRoutes, {})) }) }) }));
};
const container = document.getElementById("root");
if (container) {
    const root = (0,client/* createRoot */.H)(container);
    root.render((0,jsx_runtime.jsx)(react.StrictMode, { children: (0,jsx_runtime.jsx)(Application, {}) }));
}


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ __webpack_require__.O(0, [644,678,96], function() { return __webpack_exec__(7417); });
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=main.09fcae76.js.map