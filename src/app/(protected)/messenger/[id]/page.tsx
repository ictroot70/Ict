import { ChatWindow } from '@/entities/messenger/ui/ChatWindow'

const getPartnerInfo = async (id: number) => {
  return {
    name: `User ${id}`,
    avatarUrl: undefined,
  }
}

export default async function DialoguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userIdStr } = await params
  const dialoguePartnerId = Number(userIdStr)

  const partnerInfo = await getPartnerInfo(dialoguePartnerId)

  return (
    <ChatWindow
      dialoguePartnerId={dialoguePartnerId}
      partnerName={partnerInfo.name}
      partnerAvatarUrl={partnerInfo.avatarUrl}
    />
  )
}
