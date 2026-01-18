import { fetchUserPosts } from '@/entities/posts/lib'
import { fetchProfileData } from '@/entities/profile/lib'

import { Profile } from '@/entities/profile/ui'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params
  const userId = Number(id)
  const pageSize = 8

  try {
    const [profileData, postsData] = await Promise.all([
      fetchProfileData(userId),
      fetchUserPosts(userId, pageSize),
    ])

    return <Profile profileDataServer={profileData} postsDataServer={postsData} />
  } catch (error) {
    console.error('Error fetching profile or posts data:', error)
    return (
      <div>
        <h1>Profile not found</h1>
      </div>
    )
  }
}
