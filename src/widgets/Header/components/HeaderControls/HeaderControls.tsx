'use client'
import { useAuth } from '@/features/posts/utils/useAuth'
import { useEffectiveAuthHint } from '@/shared/auth'
import { AuthBtn, LanguageSelect, NotificationButton } from '@/widgets/Header/components'

import { HeaderSkeleton } from './HeaderSkeleton'

export const HeaderControls = () => {
  const { isLoading, isAuthenticated } = useAuth()
  const effectiveHasAuthHint = useEffectiveAuthHint()
  const isAuthResolvingForUi = effectiveHasAuthHint && !isAuthenticated && isLoading
  let leadingControl = null

  if (isAuthResolvingForUi) {
    leadingControl = <HeaderSkeleton />
  } else if (isAuthenticated) {
    leadingControl = <NotificationButton />
  }

  return (
    <>
      {leadingControl}
      <LanguageSelect />
      {!isAuthenticated && !isAuthResolvingForUi && <AuthBtn />}
    </>
  )
}
