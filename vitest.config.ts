import path from 'path'

import { defineConfig } from 'next/dist/experimental/testmode/playwright'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
