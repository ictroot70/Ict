import { useCallback, useEffect } from 'react'

import { PaginatedPosts, postApi } from '@/entities/posts/api'
import { useAppStore } from '@/lib/hooks'
import { useGuardedHydration } from '@/shared/lib/ssr/useGuardedHydration'
import { InfiniteData } from '@reduxjs/toolkit/query'

import { profileApi, PublicProfileData } from '../api'

type UseInitializeProfileParams = {
  hasPostsDataInCache: boolean
  hasProfileDataInCache: boolean
  postsDataServer: PaginatedPosts
  profileDataServer: PublicProfileData
  userId: number
}

export const useInitializeProfile = ({
  userId,
  profileDataServer,
  postsDataServer,
  hasProfileDataInCache,
  hasPostsDataInCache,
}: UseInitializeProfileParams) => {
  const store = useAppStore()
  const shouldHydrateProfile = Boolean(profileDataServer) && !hasProfileDataInCache
  const shouldHydratePosts = Boolean(postsDataServer) && !hasPostsDataInCache
  const hydrateCacheFromServer = useCallback(() => {
    if (shouldHydrateProfile && profileDataServer) {
      store.dispatch(
        profileApi.util.upsertQueryData(
          'getPublicProfile',
          { profileId: userId },
          profileDataServer
        )
      )
    }

    if (shouldHydratePosts && postsDataServer) {
      const initialData: InfiniteData<PaginatedPosts, number | null> = {
        pages: [postsDataServer],
        pageParams: [null],
      }

      store.dispatch(
        postApi.util.upsertQueryData('getInfinitePostsByUser', { userId }, initialData)
      )
    }
  }, [profileDataServer, postsDataServer, shouldHydratePosts, shouldHydrateProfile, store, userId])

  useGuardedHydration({
    hydrate: hydrateCacheFromServer,
    hydrateKey: `profile-page-${userId}`,
    shouldHydrate: shouldHydrateProfile || shouldHydratePosts,
  })

  useEffect(() => {
    return () => {
      store.dispatch(postApi.util.invalidateTags([{ type: 'UserPosts', id: userId }]))
    }
  }, [store, userId])
}
