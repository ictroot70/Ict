'use client'
import type { UserFollowingFollowersViewModel } from '@/shared/types'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  useLazyGetFollowersByUserNameQuery,
  useLazyGetFollowingByUserNameQuery,
} from '@/entities/users/api'
import { Input, Modal, Typography } from '@/shared/ui'

import s from './FollowListModal.module.scss'

import { DeleteFollowerConfirm } from './DeleteFollowerConfirm'
import { FollowListBody } from './FollowListBody'
import { UnfollowConfirm } from './UnfollowConfirm'
import { useFollowListActions } from './useFollowListActions'

export type FollowListMode = 'following' | 'followers'

type Props = {
  canDeleteFollowers: boolean
  count: number
  mode: FollowListMode
  onClose: () => void
  open: boolean
  profileId: number
  userName: string
}

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300
const TITLE_BY_MODE = { followers: 'Followers', following: 'Following' } as const
const countFormatter = new Intl.NumberFormat('ru-RU')

export const FollowListModal = ({
  canDeleteFollowers,
  count,
  mode,
  onClose,
  open,
  profileId,
  userName,
}: Props) => {
  const [users, setUsers] = useState<UserFollowingFollowersViewModel[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isError, setIsError] = useState(false)
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

  const {
    actionError,
    confirmDeleteFollowerUser,
    confirmUnfollowUser,
    currentUserId,
    handleConfirmDeleteFollower,
    handleToggleFollow,
    pendingUserId,
    setConfirmDeleteFollowerUser,
    setConfirmUnfollowUser,
  } = useFollowListActions({
    debouncedSearch,
    mode,
    profileId,
    setNextCursor,
    setUsers,
    userName,
    usersLength: users.length,
  })

  const loadFirstPage = useCallback(() => {
    if (count === 0) {
      requestIdRef.current += 1
      setUsers([])
      setNextCursor(null)
      setIsError(false)
      setIsInitialLoading(false)
      setIsLoadingMore(false)
      isLoadingMoreRef.current = false

      return
    }

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
  }, [count, triggerQuery])

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

  const modalTitle = `${countFormatter.format(count)} ${TITLE_BY_MODE[mode]}`

  return (
    <Modal open={open} onClose={onClose} modalTitle={modalTitle} className={s.modal}>
      <div className={s.modalInner}>
        <div className={s.content}>
          <div className={s.searchWrapper}>
            <Input
              inputType={'search'}
              disabled={count === 0}
              placeholder={'Search'}
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <FollowListBody
            canDeleteFollowers={canDeleteFollowers}
            currentUserId={currentUserId}
            debouncedSearch={debouncedSearch}
            hasNextPage={nextCursor !== null}
            isError={isError}
            isInitialLoading={isInitialLoading}
            isLoadingMore={isLoadingMore}
            listRootRef={listRootRef}
            mode={mode}
            pendingUserId={pendingUserId}
            users={users}
            onClose={onClose}
            onDeleteFollower={setConfirmDeleteFollowerUser}
            onLoadMore={loadMore}
            onRetry={loadFirstPage}
            onToggleFollow={user => void handleToggleFollow(user)}
          />
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
        {confirmDeleteFollowerUser && (
          <DeleteFollowerConfirm
            isPending={pendingUserId === confirmDeleteFollowerUser.userId}
            open={confirmDeleteFollowerUser !== null}
            user={confirmDeleteFollowerUser}
            onCancel={() => setConfirmDeleteFollowerUser(null)}
            onConfirm={() => void handleConfirmDeleteFollower()}
          />
        )}
      </div>
    </Modal>
  )
}
