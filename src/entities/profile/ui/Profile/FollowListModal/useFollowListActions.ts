import type { FollowListMode } from './FollowListModal'
import type { UserFollowingFollowersViewModel } from '@/shared/types'

import { type Dispatch, type SetStateAction, useCallback, useState } from 'react'

import { profileApi } from '@/entities/profile/api/profileApi'
import {
  useDeleteFollowerMutation,
  useFollowUserMutation,
  useLazyGetFollowersByUserNameQuery,
  useLazyGetFollowingByUserNameQuery,
  useUnfollowUserMutation,
} from '@/entities/users/api'
import { useMeQuery } from '@/features/auth'
import { useAppDispatch } from '@/lib/hooks'

const PAGE_SIZE = 10
const DELETE_FOLLOWER_ERROR = 'Could not delete follower. Try again please.'

type Props = {
  debouncedSearch: string
  mode: FollowListMode
  profileId: number
  setNextCursor: Dispatch<SetStateAction<null | number>>
  setUsers: Dispatch<SetStateAction<UserFollowingFollowersViewModel[]>>
  userName: string
  usersLength: number
}

const getMutationStatus = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return String(error.status)
  }

  return null
}

export const useFollowListActions = ({
  debouncedSearch,
  mode,
  profileId,
  setNextCursor,
  setUsers,
  userName,
  usersLength,
}: Props) => {
  const [pendingUserId, setPendingUserId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmUnfollowUser, setConfirmUnfollowUser] =
    useState<UserFollowingFollowersViewModel | null>(null)
  const [confirmDeleteFollowerUser, setConfirmDeleteFollowerUser] =
    useState<UserFollowingFollowersViewModel | null>(null)
  const dispatch = useAppDispatch()
  const { data: currentUser } = useMeQuery()
  const [followUser] = useFollowUserMutation()
  const [unfollowUser] = useUnfollowUserMutation()
  const [deleteFollower] = useDeleteFollowerMutation()
  const [triggerFollowers] = useLazyGetFollowersByUserNameQuery()
  const [triggerFollowing] = useLazyGetFollowingByUserNameQuery()

  const refetchListPage = useCallback(
    (listMode: FollowListMode) => {
      const trimmedSearch = debouncedSearch.trim()
      const queryArgs = {
        userName,
        _t: Date.now(),
        pageSize: Math.max(PAGE_SIZE, usersLength),
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
      }

      return listMode === 'followers' ? triggerFollowers(queryArgs) : triggerFollowing(queryArgs)
    },
    [debouncedSearch, triggerFollowers, triggerFollowing, userName, usersLength]
  )

  const syncCurrentProfileCount = useCallback(
    (field: 'followers' | 'following', delta: number) => {
      dispatch(
        profileApi.util.updateQueryData('getPublicProfile', { profileId }, draft => {
          draft.userMetadata[field] = Math.max(0, draft.userMetadata[field] + delta)
        })
      )
    },
    [dispatch, profileId]
  )

  const refetchAffectedProfiles = useCallback(
    (selectedUser: UserFollowingFollowersViewModel) => {
      dispatch(
        profileApi.util.invalidateTags([
          { type: 'Profile', id: profileId },
          { type: 'Profile', id: selectedUser.userId },
          { type: 'Profile', id: `USERNAME-${selectedUser.userName}` },
        ])
      )
    },
    [dispatch, profileId]
  )

  const handleToggleFollow = async (
    user: UserFollowingFollowersViewModel,
    options?: { confirmed?: boolean }
  ) => {
    if (
      pendingUserId !== null ||
      currentUser?.userId === undefined ||
      user.userId === currentUser.userId
    ) {
      return
    }

    if (mode === 'following' && !options?.confirmed) {
      setConfirmUnfollowUser(user)

      return
    }

    setConfirmUnfollowUser(null)
    setPendingUserId(user.userId)
    setActionError(null)

    try {
      if (mode === 'following') {
        await unfollowUser({
          currentUserId: currentUser.userId,
          selectedUserId: user.userId,
          targetUserName: user.userName,
        }).unwrap()

        const verifiedData = await refetchListPage('following').unwrap()

        if (verifiedData.items.some(item => item.userId === user.userId)) {
          refetchAffectedProfiles(user)
          setActionError('Could not unfollow user. Try again please.')

          return
        }

        setUsers(verifiedData.items)
        setNextCursor(verifiedData.nextCursor > 0 ? verifiedData.nextCursor : null)
      } else {
        await followUser({
          currentUserId: currentUser.userId,
          selectedUserId: user.userId,
          targetUserName: user.userName,
        }).unwrap()

        setUsers(prev =>
          prev.map(item => (item.userId === user.userId ? { ...item, isFollowing: true } : item))
        )
      }
    } catch {
      setActionError('Could not update follow status. Try again please.')
    } finally {
      setPendingUserId(null)
    }
  }

  const handleConfirmDeleteFollower = async () => {
    if (!confirmDeleteFollowerUser || pendingUserId !== null) {
      return
    }

    const followerUserId = confirmDeleteFollowerUser.userId

    setPendingUserId(followerUserId)
    setActionError(null)

    try {
      await deleteFollower({ followerUserId }).unwrap()

      const verifiedData = await refetchListPage('followers').unwrap()

      if (verifiedData.items.some(item => item.userId === followerUserId)) {
        setConfirmDeleteFollowerUser(null)
        setActionError(DELETE_FOLLOWER_ERROR)

        return
      }

      setUsers(verifiedData.items)
      setNextCursor(verifiedData.nextCursor > 0 ? verifiedData.nextCursor : null)
      syncCurrentProfileCount('followers', -1)
      setConfirmDeleteFollowerUser(null)
    } catch (error) {
      const status = getMutationStatus(error)

      setConfirmDeleteFollowerUser(null)
      setActionError(
        status ? `${DELETE_FOLLOWER_ERROR} Backend status: ${status}.` : DELETE_FOLLOWER_ERROR
      )
    } finally {
      setPendingUserId(null)
    }
  }

  return {
    actionError,
    confirmDeleteFollowerUser,
    confirmUnfollowUser,
    currentUserId: currentUser?.userId,
    handleConfirmDeleteFollower,
    handleToggleFollow,
    pendingUserId,
    setConfirmDeleteFollowerUser,
    setConfirmUnfollowUser,
  }
}
