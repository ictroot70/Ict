'use client'
import { useAuth } from '@/features/posts/utils/useAuth'
import { useAuthSessionHintContext } from '@/shared/auth'
import { AuthBtn, LanguageSelect, NotificationButton } from '@/widgets/Header/components'

import { HeaderSkeleton } from './HeaderSkeleton'

export const HeaderControls = () => {
  const { isLoading, isAuthenticated } = useAuth()
  const { hasAuthHint } = useAuthSessionHintContext()

  const showNotification = isAuthenticated
  const showNotificationSkeleton = !isAuthenticated && isLoading && hasAuthHint
  const showAuthButtons = !isAuthenticated && !showNotificationSkeleton

  return (
    <>
      {showNotification && <NotificationButton />}
      {showNotificationSkeleton && <HeaderSkeleton />}
      <LanguageSelect />
      {showAuthButtons && <AuthBtn />}
    </>
  )
}
