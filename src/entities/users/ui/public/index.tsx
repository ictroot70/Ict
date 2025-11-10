/** @prettier */
'use client'

import s from './Public.module.scss'

import { publicUsersApi, useGetPublicPostsQuery } from '@/entities/users/api'
import { Loading } from '@/shared/composites'

import { PublicPost } from './PublicPost/PublicPost'
import { UsersCounter } from './UsersCounter/UsersCounter'

import { APP_ROUTES } from '@/shared/constant'
import { GetPublicPostsResponse } from '../../api/api.types'
import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/hooks'

type Props = {
  postsData: GetPublicPostsResponse
}

export function Public({ postsData }: Props) {
  const needInitPostsInStore = useRef(!!postsData)
  const store = useAppStore()

  const { data, isLoading, isError } = useGetPublicPostsQuery(
    { pageSize: 4 },
    {
      skip: needInitPostsInStore.current,
      pollingInterval: 60000,
      refetchOnMountOrArgChange: true,
    }
  )

  useEffect(() => {
    if (needInitPostsInStore.current) {
      store.dispatch(
        publicUsersApi.util.upsertQueryData('getPublicPosts', { pageSize: 4 }, postsData)
      )
      needInitPostsInStore.current = false
    }
  }, [])

  const dataForRender = data || postsData

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
        {items.map(post => {
          console.log(typeof post.ownerId)
          return (
            <PublicPost
              key={post.id}
              post={post}
              urlProfile={APP_ROUTES.PROFILE.ID(post.ownerId)}
            />
          )
        })}
      </div>
    </div>
  )
}
