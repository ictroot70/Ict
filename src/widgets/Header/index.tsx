'use client'
import { ReactElement } from 'react'

import { APP_ROUTES } from '@/shared/constant'
import { Header, Typography } from '@/shared/ui'
import { HeaderControls } from '@/widgets/Header/components/HeaderControls/HeaderControls'
import Link from 'next/link'

import s from './AppHeader.module.scss'

export const AppHeader = (): ReactElement => {
  return (
    <Header className={s.header}>
      <div className={s.header__container}>
        <Link href={APP_ROUTES.ROOT}>
          <Typography variant={'h1'}>ICTRoot</Typography>
        </Link>
        <div className={s.header__controls}>
          <HeaderControls />
        </div>
      </div>
    </Header>
  )
}
