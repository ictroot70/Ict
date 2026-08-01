'use client'

import { useEffect, useMemo, useState } from 'react'

import { type MessengerListItem, useGetMessengerDialogsQuery } from '@/entities/messenger'
import { MESSENGER_DIALOGS_QUERY_ARGS } from '@/entities/messenger/model/messenger-dialogs-query'
import { useGetPublicProfileQuery } from '@/entities/profile'
import { useSearchUsersQuery } from '@/entities/users/api'
import { useMeQuery } from '@/features/auth'
import { usePathname } from 'next/navigation'

import { appendNewContactItems, buildDialogueItems } from './messenger-list'

const SEARCH_DEBOUNCE_MS = 200

const getPartnerIdFromPath = (pathname: string) => {
  const match = pathname.match(/^\/messenger\/(\d+)$/)

  return match ? Number(match[1]) : null
}

export function useMessengerShell() {
  const pathname = usePathname()
  const partnerId = getPartnerIdFromPath(pathname)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const search = debouncedSearch.trim()
  const { data: currentUser } = useMeQuery()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [searchQuery])

  const {
    data: dialogues,
    isLoading: areDialoguesLoading,
    isFetching: areDialoguesFetching,
    isError: areDialoguesError,
  } = useGetMessengerDialogsQuery(
    {
      ...MESSENGER_DIALOGS_QUERY_ARGS,
      searchName: search || undefined,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  )
  const {
    data: users,
    isLoading: areUsersLoading,
    isFetching: areUsersFetching,
    isError: areUsersError,
  } = useSearchUsersQuery({ search, pageSize: 12 }, { skip: search.length === 0 })
  const { data: activeProfile, isFetching: isActiveProfileFetching } = useGetPublicProfileQuery(
    { profileId: partnerId ?? 0 },
    { skip: partnerId === null }
  )

  const dialogueItems = useMemo<MessengerListItem[]>(() => {
    if (!currentUser) {
      return []
    }

    return buildDialogueItems(dialogues?.items ?? [], currentUser.userId)
  }, [currentUser, dialogues])

  const items = useMemo<MessengerListItem[]>(() => {
    if (!search || !currentUser) {
      return dialogueItems
    }

    return appendNewContactItems(dialogueItems, users?.items ?? [], currentUser.userId)
  }, [currentUser, dialogueItems, search, users])

  return {
    activeProfile,
    items,
    searchQuery,
    setSearchQuery,
    isLoading:
      areDialoguesLoading ||
      areDialoguesFetching ||
      isActiveProfileFetching ||
      (search.length > 0 && (areUsersLoading || areUsersFetching)),
    isError: areDialoguesError || (search.length > 0 && areUsersError),
  }
}
