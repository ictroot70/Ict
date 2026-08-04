import { MessengerDialogue } from '@/widgets/messenger/ui/MessengerDialogue'
import { notFound } from 'next/navigation'

export default async function DialoguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userIdStr } = await params
  const userId = Number(userIdStr)

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound()
  }

  return <MessengerDialogue partnerId={userId} />
}