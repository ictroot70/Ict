import { ChatWindow } from '@/entities/messenger/ui/ChatWindow'
import { MOCK_CHATS, MOCK_MESSAGES } from '@/shared/api/messenger-mocks'

export default async function Dialogue({ params }: { params: Promise<{ id: string }> }) {
  const { id: userIdStr } = await params
  const userId = Number(userIdStr)

  const chat = MOCK_CHATS.find(c => c.userId === userId)
  const messages = MOCK_MESSAGES[userIdStr] || []

  return <ChatWindow chat={chat} messages={messages} />
}
