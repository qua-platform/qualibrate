import { Model, Actions, DockLocation, Node } from "flexlayout-react";
import { BORDER_SIZE } from "../../DEPRECATED_common/layout";
import { ModuleKey } from "../ModulesRegistry";

const SINGLE_TAB_KEY: Array<ModuleKey> = ["experiments", "jobs"];

const DEFAULT_MODEL = {
  global: { tabEnableClose: true },
  layout: {
    type: "row" as const,
    weight: BORDER_SIZE,
    children: [],
  },
};
export default class FlexLayoutBuilder {
  model: Model;
  constructor() {
    try {
      const saved = localStorage.getItem("flexModel");
      if (saved) {
        this.model = Model.fromJson(JSON.parse(saved));
      }
      this.model = Model.fromJson(DEFAULT_MODEL);
    } catch (e) {
      this.model = Model.fromJson(DEFAULT_MODEL);
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

  _getAllTabs(): Array<Node> {
    const children = this.model.getRoot().getChildren();
    return children.flatMap((child) => {
      return getChildrenFromNode(child);
    });
  }

  findTabByKey(name: string): Node | undefined {
    const allTabs = this._getAllTabs();
    return allTabs.find((n) => {
      return checkName(n, name);
    });
  }

  _selectNode(nodeId: string) {
    this.model.doAction(Actions.selectTab(nodeId));
  }

  _getActiveTabSet() {
    const activeTabSet = this.model.getActiveTabset();
    const firstTabset = this.model
      .getRoot()
      .getChildren()
      .filter((n) => n.getType() === "tabset")[0];
    return activeTabSet || firstTabset;
  }
  _addNode(tabKey: string) {
    const activeTabSet = this._getActiveTabSet();
    if (activeTabSet) {
      this.model.doAction(Actions.addNode({ name: tabKey, type: "tab" }, activeTabSet?.getId(), DockLocation.CENTER, -1));
    }
  }

  openNewTab(key: ModuleKey) {
    const isSingleton = SINGLE_TAB_KEY.includes(key);
    const tab = this.findTabByKey(key);
    if (isSingleton && tab !== undefined) {
      return this._selectNode(tab.getId());
    }
    this._addNode(key);
  }
}

function getChildrenFromNode(node: Node): Array<Node> {
  if (node.getType() !== "tab") {
    return node.getChildren().flatMap((n) => getChildrenFromNode(n));
  }

  return [node];
}
function checkName(node: Node, name: string) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return node._attributes.name === name;
}
