import React, { ChangeEvent, useEffect, useState } from "react";
import jp from "jsonpath";
import { defineDataType, JsonViewer, Path } from "@textea/json-viewer";
import InputField from "../../../common/ui-components/common/Input/InputField";
import ToggleSwitch from "../../../common/ui-components/common/ToggleSwitch/ToggleSwitch";
import { useNodesContext } from "../../Nodes/context/NodesContext";
import Iframe from "../../../common/ui-components/common/Iframe/Iframe";
import { useFlexLayoutContext } from "../../../routing/flexLayout/FlexLayoutContext";
import { ModuleKey } from "../../../routing/ModulesRegistry";

interface IJSONEditorProps {
  title: string;
  jsonDataProp: object;
  height: string;
  showSearch?: boolean;
  toggleSwitch?: boolean;
  pageName?: ModuleKey;
}

export const JSONEditor = ({ title, jsonDataProp, height, showSearch = true, toggleSwitch = false, pageName }: IJSONEditorProps) => {
  const { isNodeRunning } = useNodesContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [jsonData, setJsonData] = useState(jsonDataProp);
  const [activeTab, setActiveTab] = useState<string>("final");
  const { selectedPageName } = useFlexLayoutContext();

  useEffect(() => {
    setJsonData(jsonDataProp);
  }, [jsonDataProp]);

  // Listen for postMessage events to switch to live
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.action === "data-dashboard-update") {
        console.log("PostMessage indicates to switch to live tab and node is running.");
        setActiveTab("live");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Switch back to final when a node finishes running
  useEffect(() => {
    if (!isNodeRunning) {
      console.log("Node is not running. Switching to final tab.");
      setActiveTab("final");
    }
  }, [isNodeRunning]);

  const filterData = (data: object, term: string) => {
    if (!term) return data;
    try {
      const jsonPathQuery = term.replace("#", "$").replace(/\*/g, "*").replace(/\//g, ".");
      const result = jp.nodes(data, jsonPathQuery);
      return result.reduce(
        (
          acc: Record<string, unknown>,
          {
            path,
            value,
          }: {
            path: jp.PathComponent[];
            value: unknown;
          }
        ) => {
          let current = acc;
          for (let i = 1; i < path.length - 1; i++) {
            const key = path[i] as string;
            if (!current[key]) current[key] = {};
            current = current[key] as Record<string, unknown>;
          }
          const lastKey = path[path.length - 1] as string;
          current[lastKey] = value;
          return acc;
        },
        {}
      );
    } catch (error) {
      console.error("Invalid JSONPath query:", error);
      return data;
    }
  };

  const handleSearch = (_val: string, e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filteredData = filterData(jsonDataProp, e.target.value);
    setJsonData(filteredData);
  };

  const imageDataType = defineDataType({
    is: (value) => typeof value === "string" && value.startsWith("data:image"),
    Component: ({ value }) => {
      const handleImageClick = () => {
        const win = window.open();
        win?.document.write(`<img src='${value}' alt='${value}' style="max-width: 100%; height: auto;" />`);
      };

      return (
        <div>
          <br />
          <div className="figure-container">
            {/* Use onClick to handle the image opening in a new window */}
            <a onClick={handleImageClick} style={{ cursor: "pointer" }}>
              <img style={{ maxWidth: "100%", height: "auto" }} src={value as string} alt="Base64 figure" />
            </a>
          </div>
        </div>
      );
    },
  });

  const handleOnSelect = async (path: Path) => {
    let searchPath = "#";
    path.forEach((a) => {
      searchPath += "/" + a;
    });
    setSearchTerm(searchPath);
    const filteredData = filterData(jsonDataProp, searchPath);
    await navigator.clipboard.writeText(searchPath);
    setJsonData(filteredData);
  };

  const currentURL = new URL(window.location.pathname, process.env.DASHBOARD_APP_PATH ?? window.location.origin);
  const iframeURL = new URL("dashboards/data-dashboard", currentURL);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        color: "#d9d5d4",
        height: height,
        marginLeft: "20px",
        marginRight: "20px",
      }}
    >
      {!toggleSwitch && <h1 style={{ paddingTop: "10px", paddingBottom: "5px" }}>{title}</h1>}
      {toggleSwitch && <ToggleSwitch title={title} activeTab={activeTab} setActiveTab={setActiveTab} />}
      {showSearch && (
        <InputField value={searchTerm} title={"Search"} onChange={(_e, event) => handleSearch(event.target.value, event)}></InputField>
      )}
      <>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: activeTab === "final" ? "block" : "none",
            overflowY: "auto",
          }}
        >
          <JsonViewer
            rootName={false}
            onSelect={(path) => handleOnSelect(path)}
            theme={"dark"}
            value={jsonData}
            valueTypes={[imageDataType]}
            displayDataTypes={false}
            defaultInspectDepth={3}
            style={{ overflowY: "auto", height: "100%" }}
          />
        </div>
        {toggleSwitch && (
          <div style={{ width: "100%", height: "100%", display: activeTab === "live" ? "block" : "none" }}>
            {selectedPageName === pageName && <Iframe targetUrl={iframeURL.href} />}
          </div>
        )}
      </>
    </div>
  );
};
