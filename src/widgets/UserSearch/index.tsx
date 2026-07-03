'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

import { SearchUserItem } from '@/entities/users/api/api.types'
import { publicUsersApi } from '@/entities/users/api/publicUsers.api'
import { Avatar } from '@/shared/composites/Avatar/Avatar'
import { InfiniteScrollTrigger } from '@/shared/composites/InfiniteScrollTrigger/InfiniteScrollTrigger'
import { LinearProgress } from '@/shared/composites/LinearProgress'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Close } from '@/shared/ui'
import { Input } from '@/shared/ui/Input'
import { Typography } from '@ictroot/ui-kit'
import Link from 'next/link'

import styles from './UserSearch.module.css'

const RECENT_USERS_KEY = 'recentSearchedUsers'
const RECENT_USERS_LIMIT = 10
const PAGE_SIZE = 12

const readRecentUsers = (): SearchUserItem[] => {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = window.localStorage.getItem(RECENT_USERS_KEY)

    return raw ? (JSON.parse(raw) as SearchUserItem[]) : []
  } catch {
    return []
  }
}

export const UserSearch = () => {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [recentUsers, setRecentUsers] = useState<SearchUserItem[]>([])
  const [allUsers, setAllUsers] = useState<SearchUserItem[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isError, setIsError] = useState(false)
  const isLoadingMoreRef = useRef(false)
  const requestIdRef = useRef(0)
  const resultsRootRef = useRef<HTMLDivElement | null>(null)

  const [triggerSearch] = publicUsersApi.useLazySearchUsersQuery()

  useEffect(() => {
    setRecentUsers(readRecentUsers())
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  useEffect(() => {
    const requestId = requestIdRef.current + 1

    requestIdRef.current = requestId

    if (debouncedQuery) {
      setAllUsers([])
      setNextCursor(null)
      setIsError(false)
      setIsLoadingInitial(true)
      setIsLoadingMore(false)
      isLoadingMoreRef.current = false

      triggerSearch({ search: debouncedQuery, pageSize: PAGE_SIZE })
        .unwrap()
        .then(data => {
          if (requestIdRef.current !== requestId) {
            return
          }

          setAllUsers(data.items)
          setNextCursor(data.nextCursor > 0 ? data.nextCursor : null)
        })
        .catch(() => {
          if (requestIdRef.current !== requestId) {
            return
          }

          setAllUsers([])
          setNextCursor(null)
          setIsError(true)
        })
        .finally(() => {
          if (requestIdRef.current === requestId) {
            setIsLoadingInitial(false)
          }
        })

      return
    }

    setAllUsers([])
    setNextCursor(null)
    setIsError(false)
    setIsLoadingInitial(false)
    setIsLoadingMore(false)
    isLoadingMoreRef.current = false
  }, [debouncedQuery, triggerSearch])

  const loadMore = useCallback(() => {
    if (debouncedQuery && nextCursor !== null && !isLoadingMoreRef.current && !isLoadingInitial) {
      const requestId = requestIdRef.current

      isLoadingMoreRef.current = true
      setIsLoadingMore(true)

      triggerSearch({ search: debouncedQuery, pageSize: PAGE_SIZE, cursor: nextCursor })
        .unwrap()
        .then(data => {
          if (requestIdRef.current !== requestId) {
            return
          }

          setAllUsers(prev => {
            const existingIds = new Set(prev.map(item => item.id))
            const newItems = data.items.filter(item => !existingIds.has(item.id))

            return [...prev, ...newItems]
          })
          setNextCursor(data.nextCursor > 0 ? data.nextCursor : null)
        })
        .catch(() => {
          if (requestIdRef.current !== requestId) {
            return
          }

          setNextCursor(null)
        })
        .finally(() => {
          if (requestIdRef.current === requestId) {
            setIsLoadingMore(false)
            isLoadingMoreRef.current = false
          }
        })
    }
  }, [debouncedQuery, isLoadingInitial, nextCursor, triggerSearch])

  const hasMore = nextCursor !== null

  const handleSelectUser = (user: SearchUserItem) => {
    const next = [user, ...recentUsers.filter(item => item.id !== user.id)].slice(
      0,
      RECENT_USERS_LIMIT
    )

    setRecentUsers(next)
    try {
      window.localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(next))
    } catch {
      // ignore write errors (e.g. storage disabled)
    }
  }

  const handleClearRecent = () => {
    setRecentUsers([])
    try {
      window.localStorage.removeItem(RECENT_USERS_KEY)
    } catch {
      // ignore write errors (e.g. storage disabled)
    }
  }

  const handleRemoveRecent = (id: number) => {
    const next = recentUsers.filter(item => item.id !== id)

    setRecentUsers(next)
    try {
      window.localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(next))
    } catch {
      // ignore write errors (e.g. storage disabled)
    }
  }

  const renderUserItem = (user: SearchUserItem, removable = false) => (
    <div key={user.id} className={styles.userRow}>
      <Link
        href={APP_ROUTES.PROFILE.BY_USERNAME(user.userName)}
        className={styles.userItem}
        onClick={() => handleSelectUser(user)}
      >
        <Avatar image={user.avatars?.[0]?.url} alt={user.userName} className={styles.avatar} />
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.userName}</span>
          <span className={styles.fullName}>
            {user.firstName || user.lastName
              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
              : 'User'}
          </span>
        </div>
      </Link>
      {removable && (
        <button
          type={'button'}
          className={styles.removeButton}
          aria-label={'Remove from recent'}
          onClick={() => handleRemoveRecent(user.id)}
        >
          <Close />
        </button>
      )}
    </div>
  )

  const showRecent = !query

  return (
    <div className={styles.pageContainer}>
      <LinearProgress active={isLoadingInitial || isLoadingMore} />
      <div className={styles.searchHeader}>
        <h2 className={styles.pageTitle}>Search</h2>
        <Input
          placeholder={'Search users...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          inputType={'search'}
        />
      </div>
      <div className={styles.container} ref={resultsRootRef}>
        {showRecent ? (
          <>
            <div className={styles.recentHeader}>
              <Typography variant={'bold_16'}>Recent requests</Typography>
              {recentUsers.length > 0 && (
                <Button variant={'text'} onClick={handleClearRecent}>
                  Clear all
                </Button>
              )}
            </div>
            {recentUsers.length > 0 ? (
              <div className={styles.resultsList}>
                {recentUsers.map(user => renderUserItem(user, true))}
              </div>
            ) : (
              <div className={styles.emptyPlaceholder}>
                <Typography variant={'bold_14'}>Oops! This place looks empty!</Typography>
                <Typography variant={'small_text'}>No recent requests</Typography>
              </div>
            )}
          </>
        ) : (
          <>
            {isError && (
              <div className={styles.errorMessage}>Error during search. Please try again.</div>
            )}

            {allUsers.length > 0 && (
              <div className={styles.resultsList}>
                {allUsers.map(user => renderUserItem(user))}
                <InfiniteScrollTrigger
                  hasNextPage={hasMore}
                  onLoadMore={loadMore}
                  rootRef={resultsRootRef}
                />
              </div>
            )}

            {debouncedQuery && allUsers.length === 0 && !isLoadingInitial && !isError && (
              <div className={styles.emptySearch}>
                No users found for &#34;{debouncedQuery}&#34;
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
