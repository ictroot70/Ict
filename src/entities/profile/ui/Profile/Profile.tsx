'use client'

import s from './Profile.module.scss'
import Image from 'next/image'
import { Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'

import { ProfileActions } from './ProfileActions/ProfileActions'
import { ProfileType } from '../../api'
import { useProfileData } from '../../hooks/useProfileData'
import { PostViewModel } from '@/entities/posts/api'

interface Props {
  profile: ProfileType
  posts?: PostViewModel[]
  isOwnProfile?: boolean
  isAuthenticated?: boolean
  onEdit?: () => void
  onFollow?: () => void
  onMessage?: () => void
}

export const Profile: React.FC<Props> = ({
  profile,
  posts,
  isOwnProfile = false,
  isAuthenticated = false,
  onEdit,
  onFollow,
  onMessage,
}) => {
  const { userName, aboutMe, avatars, followers, following, publications } = useProfileData(profile)

  const statsData = [
    { label: 'Following', value: followers },
    { label: 'Followers', value: following },
    { label: 'Publications', value: publications },
  ]

  return (
    <div className={s.profile}>
      <div className={s.profileDetails}>
        <Avatar size={204} image={avatars[0]?.url} />
        <div className={s.profileInfo}>
          <div className={s.profileInfoHeader}>
            <Typography variant="h1">{userName}</Typography>
            <ProfileActions
              isAuthenticated={isAuthenticated}
              isOwnProfile={isOwnProfile}
              onEdit={onEdit}
              onFollow={onFollow}
              onMessage={onMessage}
            />
          </div>
          <ul className={s.profileStats}>
            {statsData.map(({ label, value }, index) => (
              <li key={index} className={s.profileStatsItem}>
                <Typography variant="bold_14">{value}</Typography>
                <Typography variant="regular_14">{label}</Typography>
              </li>
            ))}
          </ul>
          <Typography variant="regular_16" className={s.profileAbout}>
            {aboutMe || 'No information has been added yet.'}
          </Typography>
        </div>
      </div>

      <div className={s.profileSectionPosts}>
        {posts ? (
          <ul className={s.profilePosts}>
            {posts.map(post => (
              <div key={post.id} className={s.profilePostsItem}>
                <Image
                  src={post.images[0]?.url}
                  fill
                  alt={`Post_${post.id + 1}`}
                  className={s.profileImage}
                />
              </div>
            ))}
          </ul>
        ) : (
          <Typography variant="h1">
            {isOwnProfile
              ? "You haven't published any posts yet"
              : "This user hasn't published any posts yet"}
          </Typography>
        )}
      </div>
    </div>
  )
}
