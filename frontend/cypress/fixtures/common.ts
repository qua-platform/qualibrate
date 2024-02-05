import cyKeys from "../../src/utils/cyKeys";

export const typeByDataCy = (cyKey: string, str?: string) => {
  if (!str) {
    return cy.getByDataCy(cyKey).clear();
  } else {
    return cy.getByDataCy(cyKey).clear().type(str);
  }
};

export function textExist(text: string) {
  return cy.contains(text, { matchCase: false });
}

export function componentExist(dataCy: string) {
  return cy.getByDataCy(dataCy).should("exist");
}

export function click(dataCy: string) {
  return cy.getByDataCy(dataCy).click();
}

export function containText(cyKey: string, text: string) {
  cy.getByDataCy(cyKey).should("contain.text", text);
}
export function checkPageTitle(title: string, subTitle?: string) {
  containText(cyKeys.common.PAGE_TITLE, title);
  if (subTitle !== undefined) {
    containText(cyKeys.common.PAGE_SUBTITLE, subTitle);
  }
}
