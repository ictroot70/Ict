'use client'
import { useAuth } from '@/features/posts/utils/useAuth'
import { AuthBtn, LanguageSelect, NotificationButton } from '@/widgets/Header/components'

import { HeaderSkeleton } from './HeaderSkeleton'

export const HeaderControls = () => {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <HeaderSkeleton />
  }

  return (
    <>
      {isAuthenticated && <NotificationButton />}
      <LanguageSelect />
      {!isAuthenticated && <AuthBtn />}
    </>
  )
}
