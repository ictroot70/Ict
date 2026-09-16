import { setupServer } from 'msw/node'

import { subscriptionsHandlers } from './handlers/subscriptions.handlers'

export const server = setupServer(...subscriptionsHandlers)
