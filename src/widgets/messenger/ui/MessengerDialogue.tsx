'use client'

import { ChatWindow } from '@/entities/messenger/ui/ChatWindow'

import { useMessengerDialogueData } from '../model'

interface MessengerDialogueProps {
  partnerId: number
}

export function MessengerDialogue({ partnerId }: MessengerDialogueProps) {
  const { partnerAvatarUrl } = useMessengerDialogueData(partnerId)

  return (
    <ChatWindow
      dialoguePartnerId={partnerId}
      partnerName={`User ${partnerId}`}
      partnerAvatarUrl={partnerAvatarUrl}
    />
  )
}
