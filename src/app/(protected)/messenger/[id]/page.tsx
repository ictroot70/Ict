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
// import { MessengerDialogue } from '@/widgets/messenger/ui/MessengerDialogue'
// import { notFound } from 'next/navigation'

// export default async function Dialogue({ params }: { params: Promise<{ id: string }> }) {
//   const { id: userIdStr } = await params
//   const userId = Number(userIdStr)

//   if (!Number.isInteger(userId) || userId <= 0) {
//     notFound()
//   }

//   return <MessengerDialogue partnerId={userId} />
//}
