'use client'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { AuthBtn } from '@/widgets/Header/components/AuthBtn'
import { LanguageSelect } from '@/widgets/Header/components/LanguageSelect'
import { NotificationButton } from '@/widgets/Header/components/NotificationButton'

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
