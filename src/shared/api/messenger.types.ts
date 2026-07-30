export interface Message {
  id: string
  text: string
  senderId: number | 'me'
  timestamp: string
  type: 'text' | 'image' | 'voice'
  url?: string
}

export interface Chat {
  id: string
  userId: number
  username: string
  avatarUrl: string
  lastMessage: string
  lastMessageTimestamp: string
}
