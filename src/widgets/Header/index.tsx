'use client'
import { ReactElement } from 'react'

import { useMeQuery } from '@/features/auth'
import { Header, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './AppHeader.module.scss'

import { AuthBtn, LanguageSelect, NotificationButton } from './components'
import { useHomeLink } from './hooks'

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
      <div className={s.headerControls}>
        {isAuthorized && <NotificationButton />}
        <LanguageSelect />
      </div>
    )
  }

  return (
    <>
      <Header isAuthorized={isAuthorized} className={s.header}>
        <div className={s.container}>
          <Link href={homeLink}>
            <Typography variant={'h1'}>ICTRoot</Typography>
          </Link>
          {renderAuthControls()}
        </div>
      </Header>
    </>
  )
}
