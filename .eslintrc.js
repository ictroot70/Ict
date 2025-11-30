module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  // extends: ['next/core-web-vitals', '@it-incubator/eslint-config'],
  ignorePatterns: ['node_modules/**', '.next/**', 'dist/**'],
  overrides: [
    {
      files: ['**/*.{js,ts,jsx,tsx}'],
      extends: ['@it-incubator/eslint-config'],
    },
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
}
