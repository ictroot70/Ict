import { Devices, GeneralInfo } from '@/features/profile/settings'
import { AccountManagement, Payments } from '@/features/subscriptions'

const TABS = {
  general: GeneralInfo,
  devices: Devices,
  account: AccountManagement,
  payments: Payments,
} as const

type TabKey = keyof typeof TABS

export default async function ProfileSettingsTabPage({
  params,
}: {
  params: Promise<{
    tab: string
  }>
}) {
  const { tab } = await params

  const current: TabKey = tab && tab in TABS ? (tab as TabKey) : 'general'

  const TabComponent = TABS[current]

  return <TabComponent />
}
