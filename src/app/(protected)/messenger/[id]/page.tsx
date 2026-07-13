'use client'

import { ChatWindow } from '@/entities/messenger/ui/ChatWindow'
import { MOCK_CHATS, MOCK_MESSAGES } from '@/shared/api/messenger-mocks'
import { useParams } from 'next/navigation'

export default function Dialogue() {
  const params = useParams()
  const userId = params.id as string

  const chat = MOCK_CHATS.find(c => c.userId === userId)
  const messages = MOCK_MESSAGES[userId] || []

  return <ChatWindow chat={chat} messages={messages} />
}
