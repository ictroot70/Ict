export interface Message {
  id: string
  text: string
  senderId: string
  timestamp: string
  type: 'text' | 'image' | 'voice'
  url?: string
}

export interface Chat {
  id: string
  userId: string
  username: string
  avatarUrl: string
  lastMessage: string
  lastMessageTimestamp: string
}
