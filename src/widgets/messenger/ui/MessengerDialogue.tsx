'use client'

import { ChatWindow } from '@/entities/messenger/ui/ChatWindow'

import { useMessengerDialogueData } from '../model'

interface MessengerDialogueProps {
  partnerId: number
}

export function MessengerDialogue({ partnerId }: MessengerDialogueProps) {
  const { partnerAvatarUrl, partnerUserName, currentUserId } = useMessengerDialogueData(partnerId)

  return (
    <ChatWindow
      dialoguePartnerId={partnerId}
      currentUserId={currentUserId}
      partnerName={partnerUserName ?? `User ${partnerId}`}
      partnerAvatarUrl={partnerAvatarUrl}
    />
  )
}
