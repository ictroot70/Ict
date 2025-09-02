'use client'

import { ReactElement } from 'react'

import { useGetMyProfileQuery } from '@/entities/profile'

import s from './ProfileClient.module.scss'
import Image from 'next/image'
import { Button, Typography } from '@ictroot/ui-kit'
import Link from 'next/link'

export const ProfileClient = (): ReactElement => {
  const { data, isSuccess } = useGetMyProfileQuery()

  return (
    <>
      {isSuccess && (
        <div className={s.wrapper}>
          <div className={s.avatar}>
            <Image src={'/mock/image_4.jpg'} fill alt="Avatar" className={s.image} />
          </div>
          <div className={s.info}>
            <div className={s.infoHeader}>
              <Typography variant="h1" className={s.name}>
                UserName
              </Typography>
              <div className={s.actions}>
                <Button variant="secondary">Profile Settings</Button>
              </div>
            </div>
            <div className={s.stats}>
              <div className={s.statsItem}>
                <Typography variant="bold_14">2 218</Typography>
                <Typography variant="regular_14">Following</Typography>
              </div>
              <div className={s.statsItem}>
                <Typography variant="bold_14">2 358</Typography>
                <Typography variant="regular_14">Followers</Typography>
              </div>
              <div className={s.statsItem}>
                <Typography variant="bold_14">2 764</Typography>
                <Typography variant="regular_14">Publications</Typography>
              </div>
            </div>
            <Typography variant="regular_16" className={s.about}>
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
      )}
    </>
  )
}
