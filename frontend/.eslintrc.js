module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
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
    ignorePatterns: ["*.css", "**/vendor/*.css"],
    "import/ignore": [".css$", "node_modules/*"],
  },
  rules: {
    semi: ["error", "always"],
    quotes: [2, "double", { avoidEscape: true }],
    "no-empty-function": 0,
    "react/jsx-uses-react": "off", // za React 17+
    "react/react-in-jsx-scope": "off", // za React 17+
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
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
