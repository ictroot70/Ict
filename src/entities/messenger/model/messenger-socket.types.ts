import type { MessageViewModel, MessengerError, SendMessagePayload } from './messenger.types'

export type MessengerMessageHandler = (message: MessageViewModel) => Promise<void> | void

export interface UseMessengerSocketOptions {
  accessToken: null | string
  onError: (error: MessengerError) => void
  onMessage: MessengerMessageHandler
}

export interface UseMessengerSocketResult {
  isConnected: boolean
  sendMessage: (payload: SendMessagePayload) => void
}
