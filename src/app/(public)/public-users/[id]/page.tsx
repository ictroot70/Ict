'use client'
import { useGetPublicProfileQuery } from '@/entities/profile'
import { Profile } from '@/entities/profile/ui'
import { useParams } from 'next/navigation'

export default function PublicUser() {
  const { id } = useParams()

  const profileId = typeof id === 'string' ? id : ''

  const { data: publicProfile } = useGetPublicProfileQuery(
    { profileId },
    {
      skip: !profileId,
    }
  )

  return <>{publicProfile ? <Profile profile={publicProfile} /> : <div>user not found</div>}</>
}
