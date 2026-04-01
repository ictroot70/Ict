module.exports = {
  root: true,
  plugins: ['@next/next'],
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['node_modules/**', '.next/**', 'dist/**'],
  overrides: [
    {
      files: ['**/*.{js,ts,jsx,tsx}'],
      extends: ['@it-incubator/eslint-config'],
    },
    {
      files: ['src/**/*.{js,ts,jsx,tsx}', 'app/**/*.{js,ts,jsx,tsx}'],
      extends: ['plugin:@next/next/recommended'],
      rules: {
        '@next/next/no-img-element': 'off',
      },
    },
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}
