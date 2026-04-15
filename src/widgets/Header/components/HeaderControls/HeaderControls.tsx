// 'use client'
// import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
// import { AuthBtn } from '@/widgets/Header/components/AuthBtn'
// import { LanguageSelect } from '@/widgets/Header/components/LanguageSelect'
// import { NotificationButton } from '@/widgets/Header/components/NotificationButton'
//
// import { HeaderSkeleton } from './HeaderSkeleton'
//
// export const HeaderControls = () => {
//   const { status } = useAuthUiState()
//   let leadingControl = null
//
//   if (status === 'loading') {
//     leadingControl = <HeaderSkeleton />
//   } else if (status === 'authenticated') {
//     leadingControl = <NotificationButton />
//   }
//
//   return (
//     <>
//       {leadingControl}
//       <LanguageSelect />
//       {status === 'guest' && <AuthBtn />}
//     </>
//   )
// }
'use client'
import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { useAuthSessionHintContext } from '@/shared/auth'
import { AuthBtn } from '@/widgets/Header/components/AuthBtn'
import { LanguageSelect } from '@/widgets/Header/components/LanguageSelect'
import { NotificationButton } from '@/widgets/Header/components/NotificationButton'

import { HeaderSkeleton } from './HeaderSkeleton'

export const HeaderControls = () => {
  const { status } = useAuthUiState()
  const { hasAuthHint } = useAuthSessionHintContext()

  // Если hint есть — показываем skeleton сразу (до разрешения auth)
  // Это устраняет shift guest→loading после гидрации
  const effectiveStatus = status === 'guest' && hasAuthHint ? 'loading' : status

  let leadingControl = null

  if (effectiveStatus === 'loading') {
    leadingControl = <HeaderSkeleton />
  } else if (effectiveStatus === 'authenticated') {
    leadingControl = <NotificationButton />
  }

  return (
    <>
      {leadingControl}
      <LanguageSelect />
      {effectiveStatus === 'guest' && <AuthBtn />}
    </>
  )
}
