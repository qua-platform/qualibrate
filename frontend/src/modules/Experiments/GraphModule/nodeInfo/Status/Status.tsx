import React, { useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Plotly from "plotly.js/dist/plotly";
import { JSONEditor } from "vanilla-jsoneditor";

import styles from "./Status.module.scss";
import { useMQTTContext } from "../../../../MQTT/MQTTContext";
import { useNodeInfoContext } from "../../utils/NodeInfoContext";

export type DataDictionary = {
  [key: string]: any;
};

const Status = () => {
  const dataDivId = "status_node";
  const refContainer = useRef<HTMLDivElement>(null);
  const refEditor = useRef<JSONEditor | null>(null);
  const refStatusDictNode = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    refEditor.current = new JSONEditor({
      target: refStatusDictNode.current as HTMLImageElement,
      props: {
        content: { json: {} },
        readOnly: true,
        statusBar: false,
        mainMenuBar: false,
        navigationBar: false,
      },
    });

    return () => {
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  const isDict = (value: DataDictionary): boolean => {
    return value.constructor == Object;
  };
  const addDataViewElement = (where: string, element: HTMLElement, caption: string) => {
    const searchElement = document.getElementById(where);
    if (searchElement) {
      searchElement.innerHTML = "";
    }
    searchElement?.appendChild(element);
    const newDivElement = document.createElement("div");
    newDivElement.classList.add("status-caption");
    newDivElement.innerHTML = "<b>" + caption + "</b>";
    searchElement?.appendChild(newDivElement);
  };
  const showData = (dictionary: DataDictionary, path: string, componentId: string) => {
    if (!isDict(dictionary)) {
      return dictionary;
    }
    const parsedDict: DataDictionary = {};
    if ("_type_" in dictionary) {
      if (dictionary["_type_"] == "png") {
        const newImageElement = document.createElement("img");
        newImageElement.classList.add("status-img");
        newImageElement.src = "data:image/png;base64," + dictionary["_data_"];
        addDataViewElement(componentId, newImageElement, path);
        return "see " + dictionary["_type_"] + " above";
      } else if (dictionary["_type_"] == "plotly.graph_objs.Figure") {
        const newDivElement = document.createElement("div");
        const figure = JSON.parse(dictionary["_data_"]);
        figure.layout.width = "200px";
        figure.layout.autosize = false;
        Plotly.newPlot(newDivElement, figure.data, figure.layout);
        addDataViewElement(componentId, newDivElement, path);
        return "see " + dictionary["_type_"] + " above";
      }
    } else {
      for (const [key, value] of Object.entries(dictionary)) {
        parsedDict[key] = showData(value, path + "/" + key, componentId);
      }
    }
    return parsedDict;
  };
  const updateStatusData = (dataDictionary: DataDictionary, dataDiv: string, jsonViewer: JSONEditor | null) => {
    jsonViewer?.update({ json: showData(dataDictionary, "", dataDiv) });
  };

  const clearDataDiv = (elementId: string) => {
    const searchElement = document.getElementById(elementId);
    if (searchElement) {
      searchElement.innerHTML = "";
    }
  };

  const { statusFromNode, statusFromNodeArray } = useMQTTContext();
  const { selectedNode } = useNodeInfoContext();

  useEffect(() => {
    if (statusFromNode && selectedNode) {
      if (statusFromNode.eui === selectedNode.id) {
        clearDataDiv(dataDivId);
        updateStatusData(statusFromNode.msg, dataDivId, refEditor.current);
      } else {
        clearDataDiv(dataDivId);
        refEditor.current?.update({ json: {} });
        const statusValue = statusFromNodeArray.find((one) => one.eui === selectedNode.id);
        if (statusValue) {
          updateStatusData(statusValue?.msg ?? "", dataDivId, refEditor.current);
        }
      }
    }
  }, [statusFromNode, selectedNode]);

  return (
    <div className={styles.statusTabWrapper} ref={refContainer}>
      <div id="status_node"></div>
      <div ref={refStatusDictNode} id="status_dict_node"></div>
    </div>
  );
};

export default React.memo(Status);
