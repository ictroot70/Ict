'use client'

import { useEffect, useState } from 'react'

import { type PaginatedPosts, type PostViewModel } from '@/entities/posts/api'
import { fetchPostByIdForSSR, fetchUserPosts } from '@/entities/posts/lib'
import { type PublicProfileData } from '@/entities/profile/api'
import { fetchProfileData } from '@/entities/profile/lib'
import { Loading } from '@/shared/composites'
import { type PostOpenSource } from '@/shared/constant'

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

const getErrorStatus = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status

    return typeof status === 'number' ? status : null
  }

  return null
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

        const status = getErrorStatus(error)

        if (status === 404) {
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
