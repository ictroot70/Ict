'use client'

import { useCallback } from 'react'

import { publicUsersApi, useGetPublicPostsQuery } from '@/entities/users/api'
import { useAppSelector, useAppStore } from '@/lib/hooks'
import { Loading } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { useGuardedHydration } from '@/shared/lib/ssr/useGuardedHydration'

import s from './Public.module.scss'

import { GetPublicPostsResponse } from '../../api/api.types'
import { PublicPost } from './PublicPost/PublicPost'
import { UsersCounter } from './UsersCounter/UsersCounter'

type Props = {
  postsData?: GetPublicPostsResponse
}

const LCP_PRIORITY_POSTS_COUNT = 1
const PUBLIC_POSTS_QUERY_ARGS = { endCursorPostId: 0, pageSize: 4 }

export function Public({ postsData }: Props) {
  const store = useAppStore()
  const publicPostsFromCache = useAppSelector(
    publicUsersApi.endpoints.getPublicPosts.select(PUBLIC_POSTS_QUERY_ARGS)
  )?.data
  const hasServerPosts = Boolean(postsData)
  const hasPostsDataInCache = Boolean(publicPostsFromCache)
  const hydratePublicPosts = useCallback(() => {
    if (postsData && !hasPostsDataInCache) {
      store.dispatch(
        publicUsersApi.util.upsertQueryData('getPublicPosts', PUBLIC_POSTS_QUERY_ARGS, postsData)
      )
    }
  }, [hasPostsDataInCache, postsData, store])

  useGuardedHydration({
    hydrate: hydratePublicPosts,
    hydrateKey: 'public-posts-feed',
    shouldHydrate: hasServerPosts && !hasPostsDataInCache,
  })

  const { data, isLoading, isError } = useGetPublicPostsQuery(
    PUBLIC_POSTS_QUERY_ARGS,
    {
      skip: hasServerPosts && !hasPostsDataInCache,
      pollingInterval: 60000,
    }
  )

  const dataForRender = data || publicPostsFromCache || postsData

  if (isLoading) {
    return <Loading />
  }

  if (isError) {
    return <div>Something went wrong</div>
  }

  if (!dataForRender) {
    return null
  }

  const { items, totalUsers } = dataForRender

  return (
    <div className={s.container}>
      <UsersCounter totalCount={totalUsers || 0} />
      <div className={s.posts}>
        {items.map((post, index) => {
          return (
            <PublicPost
              key={post.id}
              post={post}
              urlProfile={APP_ROUTES.PROFILE.ID(post.ownerId)}
              isPriorityPost={index < LCP_PRIORITY_POSTS_COUNT}
            />
          )
        })}
      </div>
    </div>
  )
}
