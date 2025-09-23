'use client'

import { ReactElement } from 'react'

import { useGetPublicProfileQuery } from '@/entities/profile'

import s from './ProfileClient.module.scss'
import Image from 'next/image'
import { Button, Typography } from '@/shared/ui'
import { Avatar, Loading } from '@/shared/composites'
import Link from 'next/link'
import { APP_ROUTES } from '@/shared/constant'
import { useParams } from 'next/navigation'

export const ProfileClient = (): ReactElement => {
  // const { data: meInfo, isSuccess } = useGetMyProfileQuery()

  const { id } = useParams()

  const profileId = typeof id === 'string' ? id : ''

  const { data: profileData, isLoading } = useGetPublicProfileQuery({ profileId })

  if (isLoading) {
    return <Loading />
  }

  if (!profileData) return <div>Пользователь не найден</div>

  const { userName, aboutMe, avatars, userMetadata } = profileData

  console.log(profileData)

  /*   const { data: profileWithPosts } = useGetProfileWithPostsQuery(meInfo?.userName as string, {
    skip: !meInfo?.userName || !isSuccess,
  }) */

  // const avatarUrl = profileWithPosts?.avatars[0]?.url

  const statsData = [
    { label: 'Following', value: userMetadata?.following || 0 },
    { label: 'Followers', value: userMetadata?.followers || 0 },
    { label: 'Publications', value: userMetadata?.publications || 0 },
  ]

  return (
    <div className={s.profile}>
      <div className={s.profileDetails}>
        <Avatar size={204} image={avatars[0]?.url} />
        <div className={s.profileInfo}>
          <div className={s.profileInfoHeader}>
            <Typography variant="h1">{userName}</Typography>
            {/*       <div className={s.profileActions}>
              <Button as={Link} variant="secondary" href={APP_ROUTES.PROFILE.EDIT(`${meInfo.id}`)}>
                Profile Settings
              </Button>
            </div> */}
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
      <ul className={s.profilePosts}>
        {Array.from({ length: 4 }).map((_, index) => {
          return (
            <div key={index} className={s.profilePostsItem}>
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
    </div>
  )
}
