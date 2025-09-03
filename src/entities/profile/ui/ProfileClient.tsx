'use client'

import { ReactElement } from 'react'

import { useGetMyProfileQuery } from '@/entities/profile'

import s from './ProfileClient.module.scss'
import Image from 'next/image'
import { Button, Typography } from '@ictroot/ui-kit'
import Link from 'next/link'
import { Avatar } from '@/shared/composites/Avatar'

export const ProfileClient = (): ReactElement => {
  const { data, isSuccess } = useGetMyProfileQuery()

  return (
    <>
      {isSuccess && (
        <div className={s.profile}>
          <div className={s.profileDetails}>
            <Avatar className={s.profileAvatar} />
            <div className={s.profileInfo}>
              <div className={s.profileInfoHeader}>
                <Typography variant="h1">UserName</Typography>
                <div className={s.profileActions}>
                  <Button variant="secondary">Profile Settings</Button>
                </div>
              </div>
              <div className={s.profileStats}>
                <div className={s.profileStatsItem}>
                  <Typography variant="bold_14">2 218</Typography>
                  <Typography variant="regular_14">Following</Typography>
                </div>
                <div className={s.profileStatsItem}>
                  <Typography variant="bold_14">2 358</Typography>
                  <Typography variant="regular_14">Followers</Typography>
                </div>
                <div className={s.profileStatsItem}>
                  <Typography variant="bold_14">2 764</Typography>
                  <Typography variant="regular_14">Publications</Typography>
                </div>
              </div>
              <Typography variant="regular_16" className={s.profileAbout}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco{' '}
                <Typography asChild variant="regular_link">
                  <Link href="#link" target="_blank">
                    laboris nisi ut aliquip ex ea commodo consequat.
                  </Link>
                </Typography>
              </Typography>
            </div>
          </div>
          <div className={s.profilePosts}>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_2.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_3.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_2.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_3.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_3.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_2.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_3.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_2.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_2.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_3.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_2.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
            <div className={s.profilePostsItem}>
              <Image src={'/mock/image_3.jpg'} fill alt="Post_1" className={s.profileImage} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
