'use client'

import type { UserFollowingFollowersViewModel } from '@/shared/types'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  useLazyGetFollowersByUserNameQuery,
  useLazyGetFollowingByUserNameQuery,
} from '@/entities/users/api'
import { Avatar, InfiniteScrollTrigger } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Modal, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './FollowListModal.module.scss'

export type FollowListMode = 'following' | 'followers'

type Props = {
  mode: FollowListMode
  onClose: () => void
  open: boolean
  userName: string
}

const PAGE_SIZE = 10

const getTitle = (mode: FollowListMode) => (mode === 'followers' ? 'Followers' : 'Following')

const getEmptyText = (mode: FollowListMode) =>
  mode === 'followers' ? 'No followers yet' : 'No following yet'

export const FollowListModal = ({ mode, onClose, open, userName }: Props) => {
  const [users, setUsers] = useState<UserFollowingFollowersViewModel[]>([])
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
      const queryArgs = { userName, pageSize: PAGE_SIZE, ...(cursor ? { cursor } : {}) }

      return mode === 'followers' ? triggerFollowers(queryArgs) : triggerFollowing(queryArgs)
    },
    [mode, triggerFollowers, triggerFollowing, userName]
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
    if (!open) {
      return
    }

    loadFirstPage()
  }, [loadFirstPage, open])

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

  const renderContent = () => {
    if (isInitialLoading) {
      return (
        <div className={s.state}>
          <Typography variant={'regular_16'}>Loading users...</Typography>
        </div>
      )
    }

    if (isError) {
      return (
        <div className={s.state}>
          <Typography variant={'h3'}>Failed to load users</Typography>
          <Typography className={s.stateText} variant={'regular_14'}>
            Please try again.
          </Typography>
          <Button variant={'outlined'} onClick={loadFirstPage}>
            Retry
          </Button>
        </div>
      )
    }

    if (!users.length) {
      return (
        <div className={s.state}>
          <Typography variant={'h3'}>{getEmptyText(mode)}</Typography>
        </div>
      )
    }

    return (
      <div className={s.list} ref={listRootRef}>
        {users.map(user => (
          <Link
            key={user.userId}
            className={s.userLink}
            href={APP_ROUTES.PROFILE.ID(user.userId)}
            onClick={onClose}
          >
            <Avatar
              className={s.avatar}
              image={user.avatars?.[0]?.url}
              alt={user.userName}
              size={48}
            />
            <span className={s.userInfo}>
              <Typography className={s.userName} variant={'bold_14'}>
                {user.userName}
              </Typography>
            </span>
          </Link>
        ))}
        {isLoadingMore && (
          <Typography className={s.loadingMore} variant={'regular_14'}>
            Loading more...
          </Typography>
        )}
        <InfiniteScrollTrigger
          hasNextPage={nextCursor !== null}
          onLoadMore={loadMore}
          rootRef={listRootRef}
        />
      </div>
    )
  }

  return (
    <Modal open={open} onClose={onClose} modalTitle={getTitle(mode)} className={s.modal}>
      <div className={s.content}>{renderContent()}</div>
    </Modal>
  )
}
