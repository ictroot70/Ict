import { PaginatedResponse, PostViewModel } from '@/entities/posts/api'
import { PublicProfileData } from '@/entities/profile/api'
import { Profile } from '@/entities/profile/ui'
import { API_ROUTES } from '@/shared/api'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: Props) {


  const { id } = await params
  const userId = Number(id)
  const pageSize = 8

  const [profileData, postsData] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL + API_ROUTES.PUBLIC_USER.PROFILE(userId)}`).then(
      response => response.json() as Promise<PublicProfileData>
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL + API_ROUTES.POSTS.USER_POSTS(userId, 0)}?pageSize=${pageSize}`
    ).then(response => response.json() as Promise<PaginatedResponse<PostViewModel>>),
  ])

  return <Profile profileDataServer={profileData} postsDataServer={postsData} />
}
