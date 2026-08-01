import { ChatWindow } from '@/entities/messenger/ui/ChatWindow'
import { fetchProfileData } from '@/entities/profile/lib/profile-queries'

export default async function DialoguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userIdStr } = await params
  const dialoguePartnerId = Number(userIdStr)

  const profile = Number.isFinite(dialoguePartnerId)
    ? await fetchProfileData(dialoguePartnerId).catch(() => null)
    : null

  return (
    <ChatWindow
      dialoguePartnerId={dialoguePartnerId}
      partnerName={profile?.userName ?? `User ${dialoguePartnerId}`}
      partnerAvatarUrl={profile?.avatars[0]?.url}
    />
  )
}
