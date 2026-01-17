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

  const needInitProfileInStore = useRef(!!profileDataServer)
  const needInitPostsInStore = useRef(!!postsDataServer)

  const [isInit, setInit] = useState(false)

  useEffect(() => {
    if (needInitProfileInStore.current) {
      store.dispatch(
        profileApi.util.upsertQueryData(
          'getPublicProfile',
          { profileId: userId },
          profileDataServer
        )
      )
      needInitProfileInStore.current = false
    }
  }, [userId, profileDataServer])

  useEffect(() => {
    if (needInitPostsInStore.current) {
      const initialData: InfiniteData<PaginatedResponse<PostViewModel>, number | null> = {
        pages: [postsDataServer],
        pageParams: [null],
      }

      store.dispatch(postApi.util.upsertQueryData('getPostsByUser', { userId }, initialData))

      needInitPostsInStore.current = false
    }
  }, [userId, postsDataServer])

  useEffect(() => {
    setInit(true)
  }, [needInitPostsInStore.current])

  useEffect(() => {
    return () => {
      store.dispatch(postApi.util.invalidateTags(['Posts']))
    }
  }, [])

  return { isInit }
}
