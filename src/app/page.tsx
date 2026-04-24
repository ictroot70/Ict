import { GetPublicPostsResponse } from '@/entities/users/api/api.types'
import { Public } from '@/entities/users/ui'

export default async function HomePage() {
  const publicPostsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/public-posts/all?pageSize=${4}`
  )
  const publicPostsData = (await publicPostsResponse.json()) as GetPublicPostsResponse

  return <Public postsData={publicPostsData} />
}
