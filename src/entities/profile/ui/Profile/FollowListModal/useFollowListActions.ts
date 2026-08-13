import type { FollowListMode } from './followListModal.types'
import type { UserFollowingFollowersViewModel } from '@/shared/types'

import { type Dispatch, type SetStateAction, useCallback, useRef, useState } from 'react'

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

import { FOLLOW_LIST_PAGE_SIZE } from './followListModal.constants'

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

const getNextCursor = (nextCursor: number) => (nextCursor > 0 ? nextCursor : null)

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
  const pendingUserIdRef = useRef<number | null>(null)
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

  const isOwnProfileList = currentUser?.userId === profileId

  const refetchListPage = useCallback(
    (listMode: FollowListMode) => {
      const trimmedSearch = debouncedSearch.trim()
      const queryArgs = {
        userName,
        pageSize: Math.max(FOLLOW_LIST_PAGE_SIZE, usersLength),
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

  const applyVerifiedList = useCallback(
    (items: UserFollowingFollowersViewModel[], nextCursor: number) => {
      setUsers(items)
      setNextCursor(getNextCursor(nextCursor))
    },
    [setNextCursor, setUsers]
  )

  const setPendingUser = useCallback((userId: number | null) => {
    pendingUserIdRef.current = userId
    setPendingUserId(userId)
  }, [])

  const clearPendingUser = useCallback(() => {
    setPendingUser(null)
  }, [setPendingUser])

  const handleToggleFollow = async (
    user: UserFollowingFollowersViewModel,
    options?: { confirmed?: boolean }
  ) => {
    if (
      pendingUserIdRef.current !== null ||
      currentUser?.userId === undefined ||
      user.userId === currentUser.userId
    ) {
      return
    }

    if (mode === 'following' && user.isFollowing && !options?.confirmed) {
      setConfirmUnfollowUser(user)

      return
    }

    setConfirmUnfollowUser(null)
    setPendingUser(user.userId)
    setActionError(null)

    try {
      if (mode === 'following') {
        const toggleUser = user.isFollowing ? unfollowUser : followUser

        await toggleUser({
          currentUserId: currentUser.userId,
          currentUserName: currentUser.name,
          selectedUserId: user.userId,
          targetUserName: user.userName,
        }).unwrap()

        const verifiedData = await refetchListPage('following').unwrap()
        const verifiedUser = verifiedData.items.find(item => item.userId === user.userId)

        if (verifiedUser?.isFollowing === user.isFollowing) {
          setActionError(
            user.isFollowing
              ? 'Could not unfollow user. Try again please.'
              : 'Could not update follow status. Try again please.'
          )

          return
        }

        if (isOwnProfileList) {
          applyVerifiedList(verifiedData.items, verifiedData.nextCursor)
        } else {
          setUsers(prev =>
            prev.map(item =>
              item.userId === user.userId
                ? { ...item, isFollowing: verifiedUser?.isFollowing ?? !user.isFollowing }
                : item
            )
          )
        }
      } else {
        await followUser({
          currentUserId: currentUser.userId,
          currentUserName: currentUser.name,
          selectedUserId: user.userId,
          targetUserName: user.userName,
        }).unwrap()

        const verifiedData = await refetchListPage('followers').unwrap()
        const verifiedUser = verifiedData.items.find(item => item.userId === user.userId)

        if (!verifiedUser?.isFollowing) {
          setActionError('Could not update follow status. Try again please.')

          return
        }

        applyVerifiedList(verifiedData.items, verifiedData.nextCursor)
      }
    } catch {
      setActionError('Could not update follow status. Try again please.')
    } finally {
      clearPendingUser()
    }
  }

  const handleConfirmDeleteFollower = async () => {
    if (!confirmDeleteFollowerUser || pendingUserIdRef.current !== null) {
      return
    }

    const followerUserId = confirmDeleteFollowerUser.userId

    setPendingUser(followerUserId)
    setActionError(null)

    try {
      await deleteFollower({
        currentUserId: currentUser?.userId,
        currentUserName: currentUser?.name,
        followerUserId,
        followerUserName: confirmDeleteFollowerUser.userName,
      }).unwrap()

      const verifiedData = await refetchListPage('followers').unwrap()

      if (verifiedData.items.some(item => item.userId === followerUserId)) {
        setConfirmDeleteFollowerUser(null)
        setActionError(DELETE_FOLLOWER_ERROR)

        return
      }

      applyVerifiedList(verifiedData.items, verifiedData.nextCursor)
      syncCurrentProfileCount('followers', -1)
      setConfirmDeleteFollowerUser(null)
    } catch (error) {
      const status = getMutationStatus(error)

      setConfirmDeleteFollowerUser(null)
      setActionError(
        status ? `${DELETE_FOLLOWER_ERROR} Backend status: ${status}.` : DELETE_FOLLOWER_ERROR
      )
    } finally {
      clearPendingUser()
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
