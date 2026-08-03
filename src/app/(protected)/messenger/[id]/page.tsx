import { fetchProfileData } from '@/entities/profile/lib/profile-queries'
import { MessengerDialogue } from '@/widgets/messenger/ui/MessengerDialogue'

export default async function DialoguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userIdStr } = await params
  const dialoguePartnerId = Number(userIdStr)

  if (!Number.isFinite(dialoguePartnerId)) {
    return null
  }

  // Prefetch profile for SSR cache warmth; client shell also loads public profile.
  await fetchProfileData(dialoguePartnerId).catch(() => null)

  return <MessengerDialogue partnerId={dialoguePartnerId} />
}
