'use client'
import { useAuth } from '@/features/posts/utils/useAuth'
import { AuthBtn, LanguageSelect, NotificationButton } from '@/widgets/Header/components'

import { HeaderSkeleton } from './HeaderSkeleton'

export const HeaderControls = () => {
  const { isLoading, isAuthenticated } = useAuth()
  const isAuthPending = !isAuthenticated && isLoading
  let leadingControl = null

  if (isAuthPending) {
    leadingControl = <HeaderSkeleton />
  } else if (isAuthenticated) {
    leadingControl = <NotificationButton />
  }

  return (
    <>
      {leadingControl}
      <LanguageSelect />
      {!isAuthenticated && !isAuthPending && <AuthBtn />}
    </>
  )
}
