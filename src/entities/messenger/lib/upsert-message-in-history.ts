import type { MessageViewModel } from '../model'

export function upsertMessageInHistory(
  messages: readonly MessageViewModel[],
  incomingMessage: MessageViewModel
): MessageViewModel[] {
  const messageExists = messages.some(message => message.id === incomingMessage.id)

  if (!messageExists) {
    return [...messages, incomingMessage]
  }

  return messages.map(message => (message.id === incomingMessage.id ? incomingMessage : message))
}
