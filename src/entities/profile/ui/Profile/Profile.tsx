'use client'

import s from './Profile.module.scss'
import Image from 'next/image'
import { useState } from 'react'
import { Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import { PostModal } from '@/entities/profile/ui/PostModal/PostModal'

import { ProfileActions } from './ProfileActions/ProfileActions'
import { ProfileType } from '../../api'
import { useProfileData } from '../../hooks/useProfileData'
import { PostViewModel } from '@/entities/posts/api'
import EmblaCarousel from '@/entities/posts/ui/EmblaCarousel'

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

  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [modalImages, setModalImages] = useState<string[]>([])
  const modalVariant: 'public' | 'myPost' | 'userPost' = !isAuthenticated
    ? 'public'
    : isOwnProfile
    ? 'myPost'
    : 'userPost'

  const handleOpenPost = (images: string[]) => {
    setModalImages(images)
    setIsPostModalOpen(true)
  }

  const handleClosePost = () => setIsPostModalOpen(false)

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
              <div
                key={post.id}
                className={s.profilePostsItem}
                onClick={() => handleOpenPost(post.images.map(img => img.url))}
              >
                {post.images.length > 1 ? (
                  <EmblaCarousel photos={post.images.map(img => img.url)} />
                ) : (
                  <Image
                    src={post.images[0]?.url || DEFAULT_IMAGE}
                    alt="Image"
                    fill
                    className={s.profilePostsImage}
                  />
                )}
              </div>
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
      <PostModal
        open={isPostModalOpen}
        onClose={handleClosePost}
        images={modalImages}
        variant={modalVariant}
      />
    </div>
  )
}
