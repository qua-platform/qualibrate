/// <reference types="cypress" />
export default class FlexLayout {
  static getTabs() {
    return cy.get(".flexlayout__tab_button > .flexlayout__tab_button_content");
  }

  static getTabByIndex(index: number) {
    return FlexLayout.getTabs().eq(index);
  }
}
