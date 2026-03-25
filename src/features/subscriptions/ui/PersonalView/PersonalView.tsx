import React from 'react'
import { UISubscription } from '@/features/profile/settings/model/types'
import styles from './PersonalView.module.scss'
import { PersonalSubscriptionSection } from '@/features/profile/settings/ui/AccountManagement/PersonalSubscriptionSection/PersonalSubscriptionSection'

interface PersonalViewProps {
    subscription?: UISubscription
}

export const PersonalView: React.FC<PersonalViewProps> = ({ subscription }) => {
    return (
        <div className={styles.personalView}>
            <PersonalSubscriptionSection subscription={subscription} />
        </div>
    )
}