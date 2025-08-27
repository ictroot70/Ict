/** @prettier */

'use client'

import s from './Public.module.scss'

import { useGetPublicPostsQuery } from '@/entities/users/api'
import { Loading } from '@/shared/composites'

import { UsersCounter } from './UsersCounter/UsersCounter'
import { PublicPost } from './PublicPost/PublicPost'

export function Public() {
  const { data, isLoading, isError } = useGetPublicPostsQuery({ pageSize: 16 })

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
        {items.map(post => {
          return <PublicPost key={post.id} post={post} />
        })}
      </div>
    </div>
  )
}
