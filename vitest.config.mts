import path from 'path'
import { fileURLToPath } from 'url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      'src/features/subscriptions/ui/SubscriptionPricing.test.tsx',
      'src/features/subscriptions/ui/SubscriptionPricing.queueState.test.tsx',
      'src/features/subscriptions/ui/PaymentModals/PaymentModals.test.tsx',
      'src/features/subscriptions/ui/Payments/PaymentsTable.test.tsx',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
