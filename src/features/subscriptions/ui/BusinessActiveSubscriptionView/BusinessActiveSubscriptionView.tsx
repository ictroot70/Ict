import { UISubscription } from '@/features/profile/settings/model/types'
import { SubscriptionSection } from '@/features/profile/settings/ui/AccountManagement/SubscriptionSection/SubscriptionSection'

import styles from './BusinessActiveSubscriptionView.module.scss'
interface BusinessActiveSubscriptionViewProps {
  subscription?: UISubscription
}

export const BusinessActiveSubscriptionView: React.FC<BusinessActiveSubscriptionViewProps> = ({
  subscription,
}) => {
  return (
    <div className={styles.container}>
      <SubscriptionSection subscription={subscription} />
    </div>
  )
}
