'use client'

import React, { useState, useEffect } from 'react'

import { SearchUserItem } from '@/entities/users/api/api.types'
import { useSearchUsersQuery } from '@/entities/users/api/publicUsers.api'
import { Avatar } from '@/shared/composites/Avatar/Avatar'
import { Button, Close } from '@/shared/ui'
import { Input } from '@/shared/ui/Input'
import { Typography } from '@ictroot/ui-kit'
import Link from 'next/link'

import styles from './UserSearch.module.css'

const RECENT_USERS_KEY = 'recentSearchedUsers'
const RECENT_USERS_LIMIT = 10

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

  useEffect(() => {
    setRecentUsers(readRecentUsers())
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  const { data, isLoading, isError } = useSearchUsersQuery(
    debouncedQuery ? { search: debouncedQuery } : { search: '' },
    { skip: !debouncedQuery }
  )

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
          {isLoading && <div className={styles.statusMessage}>Loading...</div>}
          {isError && <div className={styles.statusMessage}>Error during search</div>}

          {data?.items && data.items.length > 0 && (
            <div className={styles.resultsList}>{data.items.map(user => renderUserItem(user))}</div>
          )}

          {debouncedQuery && data?.items?.length === 0 && !isLoading && (
            <div className={styles.statusMessage}>Users not found</div>
          )}
        </>
      )}
    </div>
  )
}
