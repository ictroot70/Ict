import { MessengerDialogue } from '@/widgets/messenger/ui/MessengerDialogue'
import { notFound } from 'next/navigation'

export default async function Dialogue({ params }: { params: Promise<{ id: string }> }) {
  const { id: userIdStr } = await params
  const userId = Number(userIdStr)

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound()
  }

  // `key` forces React to remount the whole dialogue subtree (ChatWindow's scroll ref,
  // Virtuoso's own internal state, voice playback state, etc.) whenever the user switches
  // to a different conversation. Without it, React reuses the same component instance across
  // navigations (this page persists inside MessengerShell's layout), so scroll-to-bottom and
  // other "first mount" behavior would only ever run for the very first dialogue opened.
  return <MessengerDialogue key={userId} partnerId={userId} />
}
