import { GetPublicPostsResponse } from '@/entities/users/api/api.types'
import { Public } from '@/entities/users/ui'

export default async function HomePage() {
  const publicPostsResponse = await fetch(
    `https://ictroot.uk/api/v1/public-posts/all?pageSize=${4}`
  )
  const publicPostsData = (await publicPostsResponse.json()) as GetPublicPostsResponse
  console.log(`Server:`, publicPostsData)

  return <Public postsData={publicPostsData} />
}
