'use client'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { AuthBtn, LanguageSelect, NotificationButton } from '@/widgets/Header/components'

import { HeaderSkeleton } from './HeaderSkeleton'

export const HeaderControls = () => {
  const { status } = useAuthUiState()
  let leadingControl = null

  if (status === 'loading') {
    leadingControl = <HeaderSkeleton />
  } else if (status === 'authenticated') {
    leadingControl = <NotificationButton />
  }

  return (
    <>
      {leadingControl}
      <LanguageSelect />
      {status === 'guest' && <AuthBtn />}
    </>
  )
}
