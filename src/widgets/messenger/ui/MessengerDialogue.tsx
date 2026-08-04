'use client'

import { ChatWindow } from '@/entities/messenger/ui/ChatWindow'

import { useMessengerDialogueData } from '../model'

interface MessengerDialogueProps {
  partnerId: number
}

export function MessengerDialogue({ partnerId }: MessengerDialogueProps) {
  const { currentUserId, messages, partnerAvatarUrl, isLoading, error } =
    useMessengerDialogueData(partnerId)

  return (
    <ChatWindow
      currentUserId={currentUserId}
      messages={messages}
      partnerAvatarUrl={partnerAvatarUrl}
      isLoading={isLoading}
      error={error}
    />
  )
}
