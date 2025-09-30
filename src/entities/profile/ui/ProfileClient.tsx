'use client'

import { ReactElement, useState } from 'react'

import { useGetMyProfileQuery, useGetProfileWithPostsQuery } from '@/entities/profile'

import s from './ProfileClient.module.scss'
import Image from 'next/image'
import { Button, Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import Link from 'next/link'
import { APP_ROUTES } from '@/shared/constant'
import PostModal from './PostModal/PostModal'

export const ProfileClient = (): ReactElement => {
  const { data: meInfo, isSuccess } = useGetMyProfileQuery()

  const { data: profileWithPosts } = useGetProfileWithPostsQuery(meInfo?.userName as string, {
    skip: !meInfo?.userName || !isSuccess,
  })

  const avatarUrl = profileWithPosts?.avatars[0]?.url

  const statsData = [
    { label: 'Following', value: profileWithPosts?.followingCount || 0 },
    { label: 'Followers', value: profileWithPosts?.followersCount || 0 },
    { label: 'Publications', value: profileWithPosts?.publicationsCount || 0 },
  ]

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const openModal = (index: number) => {
    setSelectedImages([`/mock/image_${index + 1}.jpg`])
    setIsModalOpen(true)
  }

  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      {isSuccess && (
        <div className={s.profile}>
          <div className={s.profileDetails}>
            <Avatar size={204} image={avatarUrl} />
            <div className={s.profileInfo}>
              <div className={s.profileInfoHeader}>
                <Typography variant="h1">{meInfo.userName}</Typography>
                <div className={s.profileActions}>
                  <Button
                    as={Link}
                    variant="secondary"
                    href={APP_ROUTES.PROFILE.EDIT(`${meInfo.id}`)}
                  >
                    Profile Settings
                  </Button>
                </div>
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
                {meInfo.aboutMe || 'No information has been added yet.'}
              </Typography>
            </div>
          </div>
          <ul className={s.profilePosts}>
            {Array.from({ length: 4 }).map((_, index) => {
              return (
                <div
                  key={index}
                  className={s.profilePostsItem}
                  onClick={() => openModal(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' ? openModal(index) : null)}
                >
                  <Image
                    src={`/mock/image_${index + 1}.jpg`}
                    fill
                    alt={`Post_${index + 1}`}
                    className={s.profileImage}
                  />
                </div>
              )
            })}
          </ul>

          {isModalOpen && (
            <PostModal open={isModalOpen} onClose={closeModal} images={selectedImages} initialIndex={0} />
          )}
        </div>
      )}
    </>
  )
}
