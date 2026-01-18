import { PaginatedResponse, postApi, PostViewModel } from '@/entities/posts/api'
import { profileApi, PublicProfileData } from '../api'
import { useEffect, useRef, useState } from 'react'
import { InfiniteData } from '@reduxjs/toolkit/query'
import { useAppStore } from '@/lib/hooks'

export const useInitializeProfile = (
  userId: number,
  profileDataServer: PublicProfileData,
  postsDataServer: PaginatedResponse<PostViewModel>
) => {
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
      const initialData: InfiniteData<PaginatedResponse<PostViewModel>, number | null> = {
        pages: [postsDataServer],
        pageParams: [null],
      }

      store.dispatch(postApi.util.upsertQueryData('getPostsByUser', { userId }, initialData))
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
