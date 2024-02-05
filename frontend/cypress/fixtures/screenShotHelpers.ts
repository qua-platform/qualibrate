export default function MakeScreenShot(customTitle?: string) {
  const title = customTitle || Cypress.currentTest.title.replace(" ", "-");
  cy.screenshot(title);
}
