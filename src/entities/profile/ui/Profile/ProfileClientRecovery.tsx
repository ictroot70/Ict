'use client'

import { useEffect, useState } from 'react'

import { type PaginatedPosts, type PostViewModel } from '@/entities/posts/api'
import { fetchPostByIdForSSR, fetchUserPosts } from '@/entities/posts/lib'
import { type PublicProfileData } from '@/entities/profile/api'
import { fetchProfileData, resolveProfileSsrFailureMode } from '@/entities/profile/lib'
import { Loading } from '@/shared/composites'
import { type PostOpenSource } from '@/shared/constant'
import { logger } from '@/shared/lib'
import { getSsrFetchErrorStatus } from '@/shared/lib/ssr/safeSsrFetch'

import { Profile } from './Profile'

type Props = {
  initialPostId: null | number
  initialPostSource: PostOpenSource
  userId: number
}

type RecoveryState =
  | { status: 'error' }
  | { status: 'loading' }
  | { status: 'not_found' }
  | {
      initialPostData: null | PostViewModel
      postsData: PaginatedPosts
      profileData: PublicProfileData
      status: 'ready'
    }

const PAGE_SIZE = 8

const EMPTY_POSTS: PaginatedPosts = {
  items: [],
  pageSize: PAGE_SIZE,
  totalCount: 0,
}

export function ProfileClientRecovery({ userId, initialPostId, initialPostSource }: Props) {
  const [state, setState] = useState<RecoveryState>({ status: 'loading' })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setState({ status: 'loading' })

      let profileData: PublicProfileData

      try {
        profileData = await fetchProfileData(userId)
      } catch (error) {
        if (!isMounted) {
          return
        }

        const failureMode = resolveProfileSsrFailureMode(error)

        logger.error('[ProfileClientRecovery] fetchProfileData failed', {
          failureMode,
          status: getSsrFetchErrorStatus(error),
          userId,
        })

        if (failureMode === 'not_found') {
          setState({ status: 'not_found' })

          return
        }

        setState({ status: 'error' })

        return
      }

      const [postsResult, initialPostResult] = await Promise.allSettled([
        fetchUserPosts(userId, PAGE_SIZE, profileData.userName),
        initialPostId ? fetchPostByIdForSSR(initialPostId) : Promise.resolve(null),
      ])

      if (!isMounted) {
        return
      }

      if (postsResult.status === 'rejected') {
        logger.error('[ProfileClientRecovery] fetchUserPosts failed', { userId })
      }

      if (initialPostResult.status === 'rejected') {
        logger.error('[ProfileClientRecovery] fetchPostByIdForSSR failed', {
          postId: initialPostId,
          userId,
        })
      }

      setState({
        initialPostData: initialPostResult.status === 'fulfilled' ? initialPostResult.value : null,
        postsData: postsResult.status === 'fulfilled' ? postsResult.value : EMPTY_POSTS,
        profileData,
        status: 'ready',
      })
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [initialPostId, userId])

  if (state.status === 'loading') {
    return <Loading />
  }

  if (state.status === 'not_found') {
    return (
      <div>
        <h1>Profile not found</h1>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div>
        <h1>Server unavailable</h1>
        <p>Please try again later.</p>
      </div>
    )
  }

  return (
    <Profile
      profileDataServer={state.profileData}
      postsDataServer={state.postsData}
      initialPostIdServer={initialPostId}
      initialPostDataServer={state.initialPostData}
      initialPostSourceServer={initialPostSource}
    />
  )
}
