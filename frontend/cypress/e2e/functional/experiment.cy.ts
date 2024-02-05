// import cyKeys from "../../../src/utils/cyKeys";
// import AuthController from "../../fixtures/AuthController";
// import { PopupTypes } from "../../../src/common/enum/PopupTypes";
// import { ExperimentWorkflow } from "../../fixtures/experiments/experiment.data";
// import ExperimentsPage, {
//   tabsKeys,
//   viewKeys,
// } from "../../fixtures/experiments/ExperimentsPage";
// import ApiIntercept from "../../fixtures/Api";
// import { checkPageTitle } from "../../fixtures/common";
//
// context("JobEntry", () => {
//   beforeEach(() => {
//     ApiIntercept.userInfo();
//     const alias = ExperimentsPage.interceptAllGood();
//     AuthController.authenticate();
//     ExperimentsPage.openNew();
//     cy.waitAlias(alias);
//   });
//   it("JobEntry popup is working", () => {
//     cy.getByDataCy(cyKeys.experiment.RUN_JOB_BUTTON).click();
//     cy.getByDataCy(cyKeys.popup[PopupTypes.RUN_JOB_IN_WORKFLOW]);
//   });
//   it("JobEntry Graph renders correctly", () => {
//     ExperimentsPage.checkGraphExist();
//   });
//   it("JobEntry name and description render correctly", () => {
//     checkPageTitle(ExperimentWorkflow.name, ExperimentWorkflow.description);
//   });
//   it("Switching between Workflow / Code / System views works", () => {
//     ExperimentsPage.selectTab(tabsKeys.CODE);
//     ExperimentsPage.checkView(viewKeys.CODE);
//
//     ExperimentsPage.selectTab(tabsKeys.SYSTEM);
//     ExperimentsPage.checkView(viewKeys.SYSTEM);
//
//     ExperimentsPage.selectTab(tabsKeys.WORKFLOW);
//     ExperimentsPage.checkView(viewKeys.WORKFLOW);
//   });
// });
