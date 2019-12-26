module.exports = {
  root:true,
  parser: "babel-eslint",
  env: {
    node: true,
    browser: true,
    es6: true
  },
  extends: "eslint:recommended",
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? ['error', { "allow": ["warn", "error"] }] : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'require-atomic-updates': 'off',
    'no-extra-semi': 'off',
    'no-useless-escape': 'off'
  }
};
