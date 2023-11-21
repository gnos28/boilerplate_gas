module.exports = {
  plugins: ["googleappsscript", "@typescript-eslint", "prettier"],
  env: {
    browser: true,
    es2021: true,
    node: true,
    "googleappsscript/googleappsscript": true,
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  ignorePatterns: ["node_modules/**", "tsconfig.json"],
  rules: {
    "no-extra-boolean-cast": "off",
    'prettier/prettier': ['error'],
    "arrow-body-style": ["error", "as-needed"],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
        destructuredArrayIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",
  },
};
