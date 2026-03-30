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
            </Card>
        </div>
    )
}