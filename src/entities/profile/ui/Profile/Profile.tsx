'use client'

import s from './Profile.module.scss'
import { Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'

import { ProfileActions } from './ProfileActions/ProfileActions'
import { ProfileType } from '../../api'
import { useProfileData } from '../../hooks/useProfileData'
import { PostViewModel } from '@/entities/posts/api'
import { PostCard } from '@/entities/posts/ui/PostCard/PostCard'

interface Props {
  profile: ProfileType
  posts?: PostViewModel[]
  isOwnProfile?: boolean
  isAuthenticated?: boolean
  onFollow?: () => void
  onMessage?: () => void
}

const DEFAULT_IMAGE = '/default-image.svg'

export const Profile: React.FC<Props> = ({
  profile,
  posts,
  isOwnProfile = false,
  isAuthenticated = false,
  onFollow,
  onMessage,
}) => {
  const { userName, aboutMe, avatars, followers, following, publications, isFollowing } =
    useProfileData(profile)

  const statsData = [
    { label: 'Following', value: followers },
    { label: 'Followers', value: following },
    { label: 'Publications', value: publications },
  ]

  const modalVariant: 'public' | 'myPost' | 'userPost' = !isAuthenticated
    ? 'public'
    : isOwnProfile
      ? 'myPost'
      : 'userPost'

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
              onFollow={onFollow}
              onMessage={onMessage}
              isFollowing={isFollowing}
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
              <PostCard
                key={post.id}
                id={post.id}
                images={post.images}
                avatarOwner={post.avatarOwner}
                userName={post.userName}
                createdAt={post.createdAt}
                description={post.description}
                modalVariant={modalVariant}
              />
            ))}
          </ul>
        ) : (
          <Typography variant="h1" className={s.profilePostsMessage}>
            {isOwnProfile
              ? "You haven't published any posts yet"
              : "This user hasn't published any posts yet"}
          </Typography>
        )}
      </div>
    </div>
  )
}
