import { AccountManagement } from '@/app/profile/[id]/settings/[tab]/components/AccountManagement'
import { Devices } from '@/app/profile/[id]/settings/[tab]/components/Devices'
import { GeneralInfo } from '@/app/profile/[id]/settings/[tab]/components/General/GeneralInfo'
import { Payments } from '@/app/profile/[id]/settings/[tab]/components/Payments'

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
