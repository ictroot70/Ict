import { useEffect, useRef, useState } from 'react'

import { PaginatedPosts, postApi } from '@/entities/posts/api'
import { useAppStore } from '@/lib/hooks'
import { InfiniteData } from '@reduxjs/toolkit/query'

import { profileApi, PublicProfileData } from '../api'

export const useInitializeProfile = (
  userId: number,
  profileDataServer: PublicProfileData,
  postsDataServer: PaginatedPosts
): {
  isInit: boolean
} => {
  const store = useAppStore()
  const isInitialized = useRef(false)
  const [isInit, setInit] = useState(false)

  useEffect(() => {
    if (isInitialized.current || (!profileDataServer && !postsDataServer)) {
      return
    }

    if (profileDataServer) {
      store.dispatch(
        profileApi.util.upsertQueryData(
          'getPublicProfile',
          { profileId: userId },
          profileDataServer
        )
      )
    }

    if (postsDataServer) {
      const initialData: InfiniteData<PaginatedPosts, number | null> = {
        pages: [postsDataServer],
        pageParams: [null],
      }

      store.dispatch(
        postApi.util.upsertQueryData('getInfinitePostsByUser', { userId }, initialData)
      )
    }

    isInitialized.current = true
    setInit(true)
  }, [userId, profileDataServer, postsDataServer, store])

  useEffect(() => {
    return () => {
      store.dispatch(postApi.util.invalidateTags([{ type: 'UserPosts', id: userId }]))
    }
  }, [store, userId])

  return { isInit }
}
