import cyKeys from "../../../src/utils/cyKeys";
import ExperimentsPage from "../../fixtures/experiments/ExperimentsPage";
import GraphModule from "../../fixtures/graph/GraphModule";
import { NodeNames } from "../../fixtures/graph/types";
import { graphAliases } from "../../fixtures/graph/const";
import { click, textExist, typeByDataCy } from "../../fixtures/common";
import ProjectSelectPage from "../../fixtures/projects/ProjectSelectPage";
import MakeScreenShot from "../../fixtures/screenShotHelpers";

context("Graph", () => {
  beforeEach(() => {
    const alias = GraphModule.getWorkflowGraph(graphAliases.graph);
    ProjectSelectPage.openFirstProjectWithAuth();
    ExperimentsPage.openNew();
    cy.wait(1500);
    ExperimentsPage.openGraphView();
    textExist("Loading graph");
    cy.waitAlias(alias);
    cy.wait(2000);
  });
  afterEach(() => {
    MakeScreenShot();
  });
  it("User can edit input", () => {
    GraphModule.openNodeWithInfo(NodeNames.CALIBRATION);
    cy.getByDataCy(cyKeys.experiment.EXPERIMENT_INFO);
    cy.getByDataCy(cyKeys.experiment.INPUT_TABLE);
    GraphModule.patchParameters(graphAliases.patchParameter);
    click(cyKeys.EDITABLE_CELL);
    typeByDataCy(cyKeys.experiment.nodeInfo.edit.INPUT, '"new value"');
    click(cyKeys.experiment.nodeInfo.edit.APPLY);
    GraphModule.catchPatchParameterRequest();
  });
  it("User can switch between node information views", () => {
    GraphModule.openNodeWithInfo(NodeNames.CALIBRATION);
    GraphModule.openLogPanel();
    GraphModule.openDocumentationPanel();
    GraphModule.openStatisticsPanel();
    GraphModule.openParametersPanel();
  });
});
