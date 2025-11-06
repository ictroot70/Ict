'use client'
import { ReactElement } from 'react'

import { useMeQuery } from '@/features/auth'
import { Header, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './AppHeader.module.scss'

import { AuthBtn, LanguageSelect, NotificationButton } from './components'
import { useHomeLink } from './hooks'
import { APP_ROUTES } from '@/shared/constant'

export const AppHeader = (): ReactElement => {
  const { data: user, isLoading, isSuccess, isError } = useMeQuery()
  const isAuthorized = isSuccess && Boolean(user)

  const homeLink = useHomeLink()

  if (isError) {
    // TODO: Add error handling later if needed!
    console.log('Failed to fetch user', isError)
  }

  const renderAuthControls = () => {
    if (isLoading) {
      return null
    }

    return (
      <div className={s.header__controls}>
        {isAuthorized && <NotificationButton />}
        <LanguageSelect />
        {!isAuthorized && <AuthBtn />}
      </div>
    )
  }

  return (
    <>
      <Header isAuthorized={isAuthorized} className={s.header}>
        <div className={s.header__container}>
          <Link href={APP_ROUTES.ROOT}>
            <Typography variant={'h1'}>ICTRoot</Typography>
          </Link>
          {renderAuthControls()}
        </div>
      </Header>
    </>
  )
}
