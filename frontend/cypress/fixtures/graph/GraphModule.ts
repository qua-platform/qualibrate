import cyKeys from "../../../src/utils/cyKeys";
import { graphAliases, graphNodes, graphParameters, graphWorkflow, NodeSchemaMap } from "./const";
import GraphApi from "./GraphApi";
import { MockAliasType, NodeCoordinates, NodeNames } from "./types";

export default class GraphModule {
  static clickNode(name: NodeNames) {
    const node = this.getNodeObject(name);

    if (!node) {
      return;
    }

    cy.get("canvas").first().click(node.x, node.y);
  }

  static getWorkflowGraph(alias: string): MockAliasType {
    GraphApi.getExperimentWorkflow(1, true, {
      body: graphWorkflow,
      delay: 1000,
    }).as(alias);
    return alias;
  }

  static getParameters(alias: string): MockAliasType {
    GraphApi.getParameters({ body: graphParameters }, "parameters.json").as(alias);
    return alias;
  }

  static patchParameters(alias: string): MockAliasType {
    GraphApi.patchParameters({ body: graphWorkflow }).as(alias);
    return alias;
  }

  static getNodeSchema(alias: string): MockAliasType {
    GraphApi.getSchema({ body: NodeSchemaMap.calibration_1 }).as(alias);
    return alias;
  }

  static checkNodeExist(name: NodeNames): boolean {
    const node = this.getNodeObject(name);

    return Boolean(node);
  }

  static getNodeObject(name: NodeNames): NodeCoordinates | undefined {
    return graphNodes[name];
  }

  static openNodeWithInfo(name: NodeNames) {
    this.getNodeSchema(graphAliases.schema);
    this.getParameters(graphAliases.parameters);
    cy.get("canvas").first().click(1, 1);
    this.clickNode(name);
    cy.getByDataCy(cyKeys.experiment.WORKFLOW_VIEW).then(($body) => {
      if ($body.find("[data-cy='" + cyKeys.experiment.EXPERIMENT_INFO + "']").length === 0) {
        this.clickNode(name);
        cy.wait(500);
        cy.getByDataCy(cyKeys.experiment.WORKFLOW_VIEW).then(($body) => {
          if ($body.find("[data-cy='" + cyKeys.experiment.EXPERIMENT_INFO + "']").length === 0) {
            this.clickNode(name);
          }
        });
      }
    });

    cy.wait("@" + graphAliases.schema);
    cy.wait("@" + graphAliases.parameters);
  }

  static catchPatchParameterRequest() {
    cy.wait("@" + graphAliases.patchParameter);
  }

  static openLogPanel() {
    cy.getByDataCy(cyKeys.NAVIGATION_SELECT_ITEM).eq(1).click();
    cy.getByDataCy(cyKeys.experiment.LOG_PANEL);
  }

  static openStatisticsPanel() {
    cy.getByDataCy(cyKeys.NAVIGATION_SELECT_ITEM).eq(2).click();
    cy.getByDataCy(cyKeys.experiment.STATISTICS_PANEL);
  }

  static openDocumentationPanel() {
    cy.getByDataCy(cyKeys.NAVIGATION_SELECT_ITEM).eq(3).click();
    cy.getByDataCy(cyKeys.experiment.DOCUMENTATION_PANEL);
  }

  static openParametersPanel() {
    cy.getByDataCy(cyKeys.NAVIGATION_SELECT_ITEM).eq(0).click();
    cy.getByDataCy(cyKeys.experiment.PARAMETERS_PANEL);
  }
}
