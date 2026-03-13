'use client'
import { lazy, ReactElement, Suspense } from 'react'

import { APP_ROUTES } from '@/shared/constant'
import { Header, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './AppHeader.module.scss'

const HeaderControls = lazy(() =>
  import('@/widgets/Header/components/HeaderControls/HeaderControls').then(module => ({
    default: module.HeaderControls,
  }))
)

export const AppHeader = (): ReactElement => {
  return (
    <Header className={s.header}>
      <div className={s.header__container}>
        <Link href={APP_ROUTES.ROOT}>
          <Typography variant={'h1'}>ICTRoot</Typography>
        </Link>
        <div className={s.header__controls}>
          <Suspense fallback={null}>
            <HeaderControls />
          </Suspense>
        </div>
      </div>
    </Header>
  )
}
