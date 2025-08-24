/** @prettier */

'use client'
import { useGetPublicPostsQuery, useGetPublicUsersCounterQuery } from '@/entities/users/api'
import { Loading } from '@/shared/composites'

import { UsersCounter } from './UsersCounter/UsersCounter'
import { PostCard } from './PostCard/PostCard'

export function Public() {
  const { isLoading, isError, data } = useGetPublicUsersCounterQuery()
  const { data: posts } = useGetPublicPostsQuery({ pageSize: 4 })

  if (isLoading) {
    return <Loading />
  }
  if (isError) {
    return <div>Something went wrong</div>
  }
  if (!data) {
    return null
  }

  console.log(posts)

  return (
    <div className="container">
      <UsersCounter totalCount={data.totalCount} />
      <div className="posts">
        <PostCard />
        {/*   {posts?.map(post => {
          return <PublicPost key={post.id} post={post} />
        })} */}
      </div>
    </div>
  )
}
