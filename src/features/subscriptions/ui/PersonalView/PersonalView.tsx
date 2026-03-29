// import React from 'react'
// import { UISubscription } from '@/features/profile/settings/model/types'
// import styles from './PersonalView.module.scss'
// import { PersonalSubscriptionSection } from '@/features/profile/settings/ui/AccountManagement/PersonalSubscriptionSection/PersonalSubscriptionSection'

// interface PersonalViewProps {
//     subscription?: UISubscription
// }

// export const PersonalView: React.FC<PersonalViewProps> = ({ subscription }) => {
//     return (
//         <div className={styles.personalView}>
//             <PersonalSubscriptionSection subscription={subscription} />
//         </div>
//     )
// }

// features/subscriptions/ui/PersonalView/PersonalView.tsx

import React from 'react'
import { Card, Typography } from '@/shared/ui'
import styles from './PersonalView.module.scss'

export const PersonalView: React.FC = () => {
    return (
        <div className={styles.personalView}>
            <Card className={styles.infoCard}>
                <Typography variant={'h3'} className={styles.title}>
                    Personal Account
                </Typography>
                <Typography variant={'regular_16'} className={styles.description}>
                    You are currently using a free Personal account.
                    Upgrade to Business to unlock advanced features.
                </Typography>
            </Card>
        </div>
    )
}