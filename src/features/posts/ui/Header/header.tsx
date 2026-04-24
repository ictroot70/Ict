import React from 'react'

import { Button, ArrowBackSimple, Typography } from '@/shared/ui'

import styles from './header.module.scss'

interface Props {
  onPrev: () => void
  onNext: () => void
  title: string
  nextStepTitle: string
  disabledNext?: boolean
}
export const Header: React.FC<Props> = ({
  onPrev,
  onNext,
  title,
  disabledNext = false,
  nextStepTitle,
}) => {
  return (
    <div className={styles.header}>
      <button type={'button'} onClick={onPrev} className={styles.navBtn}>
        <ArrowBackSimple size={24} />
      </button>
      <Typography variant={'h1'} className={styles.title}>
        {title}
      </Typography>
      <Button variant={'text'} onClick={onNext} className={styles.navBtn} disabled={disabledNext}>
        <Typography variant={'h3'} className={styles.navBtnText}>
          {nextStepTitle}
        </Typography>
      </Button>
    </div>
  )
}
