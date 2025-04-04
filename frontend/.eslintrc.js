module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:jest/recommended'],
  plugins: ['jest'],
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  rules: {
    // Add any custom rules here
  },
  settings: {
    next: {
      rootDir: '.',
    },
  },
}; 