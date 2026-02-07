import { ReactNode } from 'react'

import { TabsHeader } from '@/features/profile/edit-profile/ui/EditProfile/TabsHeader/TabsHeader'

interface Props {
  children: ReactNode
  params: Promise<{
    id: string
  }>
}
export default async function SettingsLayout({ children, params }: Props) {
  const { id } = await params

  return (
    <>
      <TabsHeader userId={id} />
      {children}
    </>
  )
}
