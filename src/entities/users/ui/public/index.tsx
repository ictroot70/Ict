/** @prettier */
'use client'

import s from './Public.module.scss'

import { useGetPublicPostsQuery } from '@/entities/users/api'
import { Loading } from '@/shared/composites'

import { PublicPost } from './PublicPost/PublicPost'
import { UsersCounter } from './UsersCounter/UsersCounter'
import { mockDataPosts } from '../../model/mockDataForPublicPosts'
import { useMeQuery } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'

export function Public() {
  const { data, isLoading, isError } = useGetPublicPostsQuery({ pageSize: 80 })
  const { data: isAuth } = useMeQuery()

  if (isLoading) {
    return <Loading />
  }
  if (isError) {
    return <div>Something went wrong</div>
  }
  if (!data) {
    return null
  }

  const { items, totalUsers } = data

  return (
    <div className={s.container}>
      <UsersCounter totalCount={totalUsers || 0} />
      <div className={s.posts}>
        {mockDataPosts.map((item, index) => {
          return (
            <PublicPost
              key={index}
              post={item}
              urlProfile={
                isAuth
                  ? APP_ROUTES.PROFILE.USER(item.userName)
                  : APP_ROUTES.PUBLIC_USERS.PROFILE(`${item.ownerId}`)
              }
            />
          )
        })}
        {items.map(post => {
          return (
            <PublicPost
              key={post.id}
              post={post}
              urlProfile={
                isAuth
                  ? APP_ROUTES.PROFILE.USER(post.userName)
                  : APP_ROUTES.PUBLIC_USERS.PROFILE(`${post.ownerId}`)
              }
            />
          )
        })}
      </div>
    </div>
  )
}

/* 

*/
