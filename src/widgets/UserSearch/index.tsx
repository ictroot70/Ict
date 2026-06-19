'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { SearchUserItem, SearchUsersResponse } from '@/entities/users/api/api.types'
import { publicUsersApi } from '@/entities/users/api/publicUsers.api'
import { Avatar } from '@/shared/composites/Avatar/Avatar'
import { InfiniteScrollTrigger } from '@/shared/composites/InfiniteScrollTrigger/InfiniteScrollTrigger'
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
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const [triggerSearch, { data: searchData, isLoading: isLoadingInitial, isError }] =
    publicUsersApi.useLazySearchUsersQuery()

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
    if (debouncedQuery) {
      setAllUsers([])
      setNextCursor(null)
      setCurrentPage(1)
      setTotalPages(0)
      // Для первого запроса не передаем cursor
      triggerSearch({ search: debouncedQuery, pageSize: PAGE_SIZE }, true)
    }
  }, [debouncedQuery, triggerSearch])

  useEffect(() => {
    if (searchData) {
      // Обновляем состояние на основе полученных данных
      setAllUsers(prev => {
        // Для первой страницы просто устанавливаем данные
        if (nextCursor === null) {
          setCurrentPage(searchData.page)
          setTotalPages(searchData.pagesCount)

          return searchData.items
        } else {
          // Для последующих страниц проверяем на дубликаты
          const existingIds = new Set(prev.map(item => item.id))
          const newItems = searchData.items.filter(item => !existingIds.has(item.id))

          return [...prev, ...newItems]
        }
      })

      // Обновляем курсор для следующего запроса
      setNextCursor(searchData.nextCursor > 0 ? searchData.nextCursor : null)
      setCurrentPage(searchData.page)
      setTotalPages(searchData.pagesCount)
    }
  }, [searchData])

  const loadMore = useCallback(() => {
    if (debouncedQuery && nextCursor !== null && !isLoadingMore && !isLoadingInitial) {
      setIsLoadingMore(true)

      triggerSearch({ search: debouncedQuery, pageSize: PAGE_SIZE, cursor: nextCursor }, true)
        .unwrap()
        .catch(() => {
          // В случае ошибки сбрасываем курсор, чтобы не пытаться загружать снова
          setNextCursor(null)
        })
        .finally(() => {
          setIsLoadingMore(false)
        })
    }
  }, [debouncedQuery, nextCursor, isLoadingMore, isLoadingInitial, triggerSearch])

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
        href={`/profile/${user.id}`}
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
      <h2 className={styles.pageTitle}>Search</h2>
      <div className={styles.container}>
        <Input
          placeholder={'Search users...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          inputType={'search'}
        />
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
            {isLoadingInitial && allUsers.length === 0 && (
              <div className={styles.loadingInitial}>Loading users...</div>
            )}

            {isError && (
              <div className={styles.errorMessage}>Error during search. Please try again.</div>
            )}

            {allUsers.length > 0 && (
              <>
                <div className={styles.resultsList}>
                  {allUsers.map(user => renderUserItem(user))}
                  <InfiniteScrollTrigger hasNextPage={hasMore} onLoadMore={loadMore} />
                  {isLoadingMore && <div className={styles.loadingMore}>Loading more users...</div>}
                </div>
              </>
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
