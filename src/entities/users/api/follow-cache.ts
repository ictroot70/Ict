import type { UserByUserNameResponse } from './api.types'
import type { PublicProfileData } from '@/entities/profile/api'

export type FollowCachePatch = {
  followersDelta: number
  followingDelta: number
  isFollowing: boolean
}

export type CachePatchResult = {
  undo: () => void
}

export const isValidUserId = (userId: number | undefined): userId is number =>
  typeof userId === 'number' && Number.isInteger(userId) && userId > 0

export const patchUserByUserNameFollowState = (
  draft: UserByUserNameResponse,
  { followersDelta, isFollowing }: FollowCachePatch
) => {
  draft.isFollowing = isFollowing
  draft.followersCount = Math.max(0, draft.followersCount + followersDelta)
}

export const patchPublicProfileFollowers = (
  draft: PublicProfileData,
  { followersDelta, isFollowing }: FollowCachePatch
) => {
  draft.isFollowing = isFollowing
  draft.userMetadata.followers = Math.max(0, draft.userMetadata.followers + followersDelta)
}

export const patchPublicProfileFollowing = (
  draft: PublicProfileData,
  { followingDelta }: FollowCachePatch
) => {
  draft.userMetadata.following = Math.max(0, draft.userMetadata.following + followingDelta)
}
