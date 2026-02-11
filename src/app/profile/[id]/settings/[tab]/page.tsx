import { AccountManagement, Devices, GeneralInfo, Payments } from '@/features/profile/settings'

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
