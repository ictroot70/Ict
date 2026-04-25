'use client'

import { Tabs } from '@/shared/ui'
import { useRouter, usePathname } from 'next/navigation'

import s from './TabsHeader.module.scss'

const tabs = [
  { title: 'General information', value: 'general' },
  { title: 'Devices', value: 'devices' },
  { title: 'Account Management', value: 'account' },
  { title: 'My payments', value: 'payments' },
]

interface TabsHeaderProps {
  userId: string
}

export const TabsHeader = ({ userId }: TabsHeaderProps) => {
  const router = useRouter()
  const pathname = usePathname()

  let active = pathname.split('/').pop()

  if (active === 'settings' || active === userId) {
    active = 'general'
  }

  return (
    <Tabs
      fullWidth
      className={s.tabs}
      triggers={tabs}
      value={active}
      onValueChange={v => router.push(`/profile/${userId}/settings/${v}`)}
    />
  )
}
