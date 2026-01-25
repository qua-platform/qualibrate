module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-scss"],
  rules: {
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,
    "scss/dollar-variable-pattern": "^[a-z]",
    "scss/selector-no-redundant-nesting-selector": true,
    "block-no-empty": true,
    "color-no-invalid-hex": true,
    "no-duplicate-selectors": true,
    "no-invalid-double-slash-comments": null,
    "selector-class-pattern": null,
    "property-no-unknown": null,
    "import-notation": "string",
    "selector-type-no-unknown": null,
    "property-no-vendor-prefix": null,
  },
};
