import type { MessageViewModel, MessengerError, SendMessagePayload } from './messenger.types'

export type MessengerMessageHandler = (message: MessageViewModel) => Promise<void> | void

export type MessengerMessageDeletionHandler = (messageId: number) => Promise<void> | void

export interface UseMessengerSocketOptions {
  accessToken: null | string
  onError: (error: MessengerError) => void
  onMessage: MessengerMessageHandler
  onMessageDeleted: MessengerMessageDeletionHandler
}

export interface UseMessengerSocketResult {
  isConnected: boolean
  sendMessage: (payload: SendMessagePayload) => boolean
}
