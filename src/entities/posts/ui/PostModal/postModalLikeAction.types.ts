import type { ReactNode } from 'react'

export type PostLikeActionProps = {
  className?: string
  isLiked: boolean
  ownerId: number
  postId: number
}

export type RenderPostLikeAction = (props: PostLikeActionProps) => ReactNode

export type PostModalAuthState = {
  isAuthUiLoading: boolean
  isAuthenticatedUi: boolean
  user?: {
    name?: string
    userId: number
    userName?: string
  }
}
