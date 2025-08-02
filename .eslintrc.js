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
  extends: ['next/core-web-vitals', '@it-incubator/eslint-config'],
  ignorePatterns: ['node_modules/**', '.next/**', 'dist/**'],
  plugins: ['perfectionist'], // ✅ Добавляем perfectionist
  rules: {
    'perfectionist/sort-imports': [
      'error',
      {
        type: 'alphabetical',
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'style',
          'unknown',
        ],
        'newlines-between': 'always',
        'internal-pattern': ['^@/'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.{js,ts,jsx,tsx}'],
    },
  ],
}
