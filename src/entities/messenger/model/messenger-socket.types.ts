import type { MessageViewModel, MessengerError, SendMessagePayload } from './messenger.types'

export type MessengerMessageHandler = (message: MessageViewModel) => Promise<void> | void

export type MessengerMessageDeletionHandler = (messageId: number) => Promise<void> | void

export interface UseMessengerSocketOptions {
  accessToken: null | string
  onAuthenticationError: () => Promise<void> | void
  onError: (error: MessengerError) => void
  onMessage: MessengerMessageHandler
  onMessageDeleted: MessengerMessageDeletionHandler
}

export interface UseMessengerSocketResult {
  isConnected: boolean
  isRecoveringAuthentication: boolean
  sendMessage: (payload: SendMessagePayload) => boolean
}
