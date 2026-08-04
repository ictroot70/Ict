'use client'

import type { UserFollowingFollowersViewModel } from '@/shared/types'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  useFollowUserMutation,
  useLazyGetFollowersByUserNameQuery,
  useLazyGetFollowingByUserNameQuery,
  useUnfollowUserMutation,
} from '@/entities/users/api'
import { useMeQuery } from '@/features/auth'
import { Input, Modal, Typography } from '@/shared/ui'

import s from './FollowListModal.module.scss'

import { FollowListFeedback } from './FollowListFeedback'
import { FollowListUsers } from './FollowListUsers'
import { UnfollowConfirm } from './UnfollowConfirm'

export type FollowListMode = 'following' | 'followers'

type Props = {
  count: number
  mode: FollowListMode
  onClose: () => void
  open: boolean
  userName: string
}

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

const TITLE_BY_MODE = { followers: 'Followers', following: 'Following' } as const
const EMPTY_TEXT_BY_MODE = { followers: 'No followers yet', following: 'No following yet' } as const
const countFormatter = new Intl.NumberFormat('ru-RU')

export const FollowListModal = ({ count, mode, onClose, open, userName }: Props) => {
  const [users, setUsers] = useState<UserFollowingFollowersViewModel[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isError, setIsError] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmUnfollowUser, setConfirmUnfollowUser] =
    useState<UserFollowingFollowersViewModel | null>(null)
  const { data: currentUser } = useMeQuery()
  const [followUser] = useFollowUserMutation()
  const [unfollowUser] = useUnfollowUserMutation()
  const [triggerFollowers] = useLazyGetFollowersByUserNameQuery()
  const [triggerFollowing] = useLazyGetFollowingByUserNameQuery()
  const requestIdRef = useRef(0)
  const isLoadingMoreRef = useRef(false)
  const listRootRef = useRef<HTMLDivElement | null>(null)

  const triggerQuery = useCallback(
    (cursor?: number) => {
      const trimmedSearch = debouncedSearch.trim()
      const queryArgs = {
        userName,
        pageSize: PAGE_SIZE,
        ...(cursor ? { cursor } : {}),
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
      }

      return mode === 'followers' ? triggerFollowers(queryArgs) : triggerFollowing(queryArgs)
    },
    [debouncedSearch, mode, triggerFollowers, triggerFollowing, userName]
  )

  const loadFirstPage = useCallback(() => {
    const requestId = requestIdRef.current + 1

    requestIdRef.current = requestId
    setUsers([])
    setNextCursor(null)
    setIsError(false)
    setIsInitialLoading(true)
    setIsLoadingMore(false)
    isLoadingMoreRef.current = false

    triggerQuery()
      .unwrap()
      .then(data => {
        if (requestIdRef.current !== requestId) {
          return
        }
        setUsers(data.items)
        setNextCursor(data.nextCursor > 0 ? data.nextCursor : null)
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) {
          return
        }
        setUsers([])
        setNextCursor(null)
        setIsError(true)
      })
      .finally(() => {
        if (requestIdRef.current === requestId) {
          setIsInitialLoading(false)
        }
      })
  }, [triggerQuery])

  useEffect(() => {
    loadFirstPage()
  }, [loadFirstPage])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [search])

  const loadMore = useCallback(() => {
    if (nextCursor === null || isLoadingMoreRef.current || isInitialLoading) {
      return
    }

    const requestId = requestIdRef.current

    isLoadingMoreRef.current = true
    setIsLoadingMore(true)

    triggerQuery(nextCursor)
      .unwrap()
      .then(data => {
        if (requestIdRef.current !== requestId) {
          return
        }
        setUsers(prev => {
          const existingIds = new Set(prev.map(user => user.userId))
          const newUsers = data.items.filter(user => !existingIds.has(user.userId))

          return [...prev, ...newUsers]
        })
        setNextCursor(data.nextCursor > 0 ? data.nextCursor : null)
      })
      .catch(() => {
        if (requestIdRef.current === requestId) {
          setNextCursor(null)
        }
      })
      .finally(() => {
        if (requestIdRef.current === requestId) {
          setIsLoadingMore(false)
          isLoadingMoreRef.current = false
        }
      })
  }, [isInitialLoading, nextCursor, triggerQuery])

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

    if (user.isFollowing && !options?.confirmed) {
      setConfirmUnfollowUser(user)

      return
    }

    setConfirmUnfollowUser(null)
    setPendingUserId(user.userId)
    setActionError(null)

    try {
      if (user.isFollowing) {
        await unfollowUser({
          currentUserId: currentUser.userId,
          selectedUserId: user.userId,
          targetUserName: user.userName,
        }).unwrap()
      } else {
        await followUser({
          currentUserId: currentUser.userId,
          selectedUserId: user.userId,
          targetUserName: user.userName,
        }).unwrap()
      }

      setUsers(prev =>
        prev.map(item =>
          item.userId === user.userId ? { ...item, isFollowing: !user.isFollowing } : item
        )
      )
    } catch {
      setActionError('Could not update follow status. Try again please.')
    } finally {
      setPendingUserId(null)
    }
  }

  const renderList = () => {
    if (isInitialLoading) {
      return <FollowListFeedback type={'loading'} />
    }

    if (isError) {
      return <FollowListFeedback type={'error'} onRetry={loadFirstPage} />
    }

    if (!users.length) {
      const emptyText = debouncedSearch.trim() ? 'No users found' : EMPTY_TEXT_BY_MODE[mode]

      return <FollowListFeedback type={'empty'} emptyText={emptyText} />
    }

    return (
      <FollowListUsers
        currentUserId={currentUser?.userId}
        hasNextPage={nextCursor !== null}
        isLoadingMore={isLoadingMore}
        listRootRef={listRootRef}
        pendingUserId={pendingUserId}
        users={users}
        onClose={onClose}
        onLoadMore={loadMore}
        onToggleFollow={user => void handleToggleFollow(user)}
      />
    )
  }

  const modalTitle = `${countFormatter.format(count)} ${TITLE_BY_MODE[mode]}`

  return (
    <Modal open={open} onClose={onClose} className={s.modal}>
      <div className={s.modalInner}>
        <div className={s.header}>
          <Typography className={s.title} variant={'h1'}>
            {modalTitle}
          </Typography>
          <button className={s.closeButton} type={'button'} aria-label={'Close'} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={s.content}>
          <div className={s.searchWrapper}>
            <Input
              inputType={'search'}
              placeholder={'Search'}
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          {renderList()}
          {actionError && (
            <Typography className={s.actionError} variant={'danger'}>
              {actionError}
            </Typography>
          )}
        </div>
        {confirmUnfollowUser && (
          <UnfollowConfirm
            isPending={pendingUserId === confirmUnfollowUser.userId}
            open={confirmUnfollowUser !== null}
            user={confirmUnfollowUser}
            onCancel={() => setConfirmUnfollowUser(null)}
            onConfirm={() => void handleToggleFollow(confirmUnfollowUser, { confirmed: true })}
          />
        )}
      </div>
    </Modal>
  )
}
