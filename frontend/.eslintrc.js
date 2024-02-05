module.exports = {
  extends: ["plugin:@typescript-eslint/recommended", "prettier", "plugin:prettier/recommended", "plugin:css-modules/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    esModuleInterop: true,
    createDefaultProgram: true,
    project: "./tsconfig.json",
  },
  plugins: ["css-modules", "@typescript-eslint"],
  settings: {
    react: { version: "detect" },
  },
  rules: {
    semi: ["error", "always"],
    quotes: [2, "double", { avoidEscape: true }],
    "no-empty-function": 0,
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-empty-function": 0,
    "css-modules/no-unused-class": [1, { camelCase: true }],
    "css-modules/no-undef-class": [1, { camelCase: true }],
    "space-before-function-paren": [
      "warn",
      {
        anonymous: "never",
        named: "never",
        asyncArrow: "always",
      },
    ],
  },
};
