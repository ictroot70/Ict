'use client'

import { Avatar } from '@/shared/composites'
import { Typography } from '@/shared/ui'
import s from './Profile.module.scss'

import { PostViewModel } from '@/entities/posts/api'
import { ProfileType } from '../../api'
import { useProfileData } from '../../hooks/useProfileData'
import { ProfileActions } from './ProfileActions/ProfileActions'
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

  const ProfileType = isAuthenticated ? (isOwnProfile ? 'myPost' : 'userPost') : 'public'

  return (
      <div className={s.profile}>
        <div className={s.profile__details}>
          <Avatar size={204} image={avatars[0]?.url} />
          <div className={s.profile__info}>
            <div className={s.profile__header}>
              <Typography variant="h1">{userName}</Typography>
              <ProfileActions
                isAuthenticated={isAuthenticated}
                isOwnProfile={isOwnProfile}
                onFollow={onFollow}
                onMessage={onMessage}
                isFollowing={isFollowing}
              />
            </div>
            <ul className={s.profile__stats}>
              {statsData.map(({ label, value }, index) => (
                <li key={index} className={s.profile__statsItem}>
                  <Typography variant="bold_14">{value}</Typography>
                  <Typography variant="regular_14">{label}</Typography>
                </li>
              ))}
            </ul>
            <Typography variant="regular_16" className={s.profile__about}>
              {aboutMe || 'No information has been added yet.'}
            </Typography>
          </div>
        </div>

        <div className={s.profile__section}>
          {posts && posts.length ? (
            <ul className={s.profile__posts}>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  images={post.images}
                  userName={post.userName}
                  createdAt={post.createdAt}
                  modalVariant={ProfileType}
                />
              ))}
            </ul>
          ) : (
            <Typography variant="h1" className={s.profile__message}>
              {isOwnProfile
                ? "You haven't published any posts yet"
                : "This user hasn't published any posts yet"}
            </Typography>
          )}
        </div>
      </div>
  )
}
