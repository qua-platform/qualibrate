import React, { ChangeEvent, useEffect, useState } from "react";
import jp from "jsonpath";
import { defineDataType, JsonViewer, Path } from "@textea/json-viewer";
import InputField from "../../../common/ui-components/common/Input/InputField";
import ToggleSwitch from "../../../common/ui-components/common/ToggleSwitch/ToggleSwitch";
import { useNodesContext } from "../../Nodes/context/NodesContext";
import Iframe from "../../../common/ui-components/common/Iframe/Iframe";

interface IJSONEditorProps {
  title: string;
  jsonDataProp: object;
  height: string;
  showSearch?: boolean;
  toggleSwitch?: boolean;
}

export const JSONEditor = ({ title, jsonDataProp, height, showSearch = true, toggleSwitch = false }: IJSONEditorProps) => {
  const { isNodeRunning } = useNodesContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [jsonData, setJsonData] = useState(jsonDataProp);
  const [activeTab, setActiveTab] = useState<string>("live");

  useEffect(() => {
    setJsonData(jsonDataProp);
  }, [jsonDataProp]);

  useEffect(() => {
    if (isNodeRunning) {
      setActiveTab("live");
    } else {
      setActiveTab("final");
    }
  }, [isNodeRunning]);

  useEffect(() => {}, [isNodeRunning]);

  const filterData = (data: object, term: string) => {
    if (!term) return data;

    try {
      // Convert search term to JSONPath query
      const jsonPathQuery = term.replace("#", "$").replace(/\*/g, "*").replace(/\//g, ".");

      // Perform the JSONPath query
      const result = jp.nodes(data, jsonPathQuery);

      // Reconstruct the filtered data structure
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

  const currentURL = new URL(window.location.href);
  const iframeURL = `${currentURL.origin}/dashboards/data-dashboard`;
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
        <div style={{ width: "100%", height: "100%", display: activeTab === "final" ? "block" : "none" }}>
          <JsonViewer
            rootName={false}
            onSelect={(path) => handleOnSelect(path)}
            theme={"dark"}
            value={jsonData}
            valueTypes={[imageDataType]}
            displayDataTypes={false}
            defaultInspectDepth={3}
            style={{ overflowY: "auto", height: "100%", paddingBottom: "15px" }}
          />
        </div>
        <div style={{ width: "100%", height: "100%", display: activeTab === "live" ? "block" : "none" }}>
          <Iframe targetUrl={iframeURL} />
        </div>
      </>
    </div>
  );
};
