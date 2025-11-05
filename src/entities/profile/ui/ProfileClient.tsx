'use client'

import { ReactElement } from 'react'

import { useGetMyProfileQuery, useGetProfileWithPostsQuery } from '@/entities/profile'

import s from './ProfileClient.module.scss'
import { Button, Typography } from '@/shared/ui'
import { Avatar } from '@/shared/composites'
import Link from 'next/link'
import { APP_ROUTES } from '@/shared/constant'
import { useGetPostsByUserQuery } from '@/entities/posts/api/postApi'
import { PostCard } from '@/entities/posts/ui/PostCard'

export const ProfileClient = (): ReactElement => {
  const { data: meInfo, isSuccess } = useGetMyProfileQuery()

  const { data: profileWithPosts } = useGetProfileWithPostsQuery(meInfo?.userName as string, {
    skip: !meInfo?.userName || !isSuccess,
  })

  const { data: postsData, isLoading: isPostsLoading } = useGetPostsByUserQuery(
    { userId: meInfo?.id ?? 0, endCursorPostId: 0 },
    { skip: !meInfo?.id }
  )
  const avatarUrl = profileWithPosts?.avatars[0]?.url

  const statsData = [
    { label: 'Following', value: profileWithPosts?.followingCount || 0 },
    { label: 'Followers', value: profileWithPosts?.followersCount || 0 },
    { label: 'Publications', value: profileWithPosts?.publicationsCount || 0 },
  ]

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
          <div className={s.profilePosts}>
            {isPostsLoading && <Typography>Loading posts...</Typography>}

            {postsData?.items?.length
              ? postsData.items.map(post => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    images={post.images}
                    avatarOwner={post.avatarOwner}
                    userName={post.userName}
                    createdAt={post.createdAt}
                    description={post.description}
                  />
                ))
              : !isPostsLoading && <Typography>No posts yet.</Typography>}
          </div>
        </div>
      )}
    </>
  )
}
