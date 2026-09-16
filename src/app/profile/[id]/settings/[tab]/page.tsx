import type { ComponentType } from 'react'

type TabKey = 'general' | 'devices' | 'account' | 'payments'

const resolveTab = (tab: string): TabKey => {
  if (tab === 'general' || tab === 'devices' || tab === 'account' || tab === 'payments') {
    return tab
  }

  return 'general'
}

const loadTabComponent = async (tab: TabKey): Promise<ComponentType> => {
  switch (tab) {
    case 'general': {
      const { GeneralInfo } = await import('@/features/profile/settings')

      return GeneralInfo
    }
    case 'devices': {
      const { Devices } = await import('@/features/profile/settings')

      return Devices
    }
    case 'account': {
      const { AccountManagement } = await import('@/features/subscriptions/ui/AccountManagement')

      return AccountManagement
    }
    case 'payments': {
      const { Payments } = await import('@/features/subscriptions/ui/Payments')

      return Payments
    }
  }
}

export default async function ProfileSettingsTabPage({
  params,
}: {
  params: Promise<{
    tab: string
  }>
}) {
  const { tab } = await params

  const current = resolveTab(tab)
  const TabComponent = await loadTabComponent(current)

  return <TabComponent />
}
