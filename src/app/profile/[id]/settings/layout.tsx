'use client'

import { ReactNode, useEffect } from 'react'

import { useAuth } from '@/features/posts/utils/useAuth'
import { TabsHeader } from '@/features/profile/edit-profile/ui/EditProfile/TabsHeader/TabsHeader'
import { Loading } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { useParams, usePathname, useRouter } from 'next/navigation'

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const myId = user?.userId
  const requestedId = Number(id)
  const shouldRedirectToOwnSettings = Number.isNaN(requestedId) || requestedId !== myId

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!isAuthenticated || !myId) {
      router.replace(`${APP_ROUTES.AUTH.LOGIN}?from=${encodeURIComponent(pathname)}`)

      return
    }

    if (shouldRedirectToOwnSettings) {
      router.replace(APP_ROUTES.PROFILE.EDIT(myId))
    }
  }, [isLoading, isAuthenticated, myId, shouldRedirectToOwnSettings, pathname, router])

  if (isLoading || !isAuthenticated || !myId || shouldRedirectToOwnSettings) {
    return <Loading />
  }

  return (
    <>
      <TabsHeader userId={String(myId)} />
      {children}
    </>
  )
}
