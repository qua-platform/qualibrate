import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1200,
  viewportHeight: 700,
  e2e: {
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "https://demo.entropy-lab.io/",
    chromeWebSecurity: false,
  },
  chromeWebSecurity: false,
});
