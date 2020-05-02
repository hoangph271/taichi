module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    semi: ["error", "never"],
    quotes: ["error", "single", { "avoidEscape": true }],
    'comma-dangle': ["error", "always-multiline"],
    'no-unused-expressions': 'off',
    'no-useless-return': 'off',
  }
}
