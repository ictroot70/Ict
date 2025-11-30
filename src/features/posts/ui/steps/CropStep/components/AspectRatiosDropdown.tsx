import React, { ReactNode } from 'react'

import styles from '../CropStep.module.scss'

interface AspectRatio {
  label: string
  value: number
  icon: ReactNode
}
interface AspectRatiosDropdownProps {
  aspect: number | undefined
  aspectRatios: AspectRatio[]
  handleAspectChange: (aspect: number) => void
}

export const AspectRatiosDropdown: React.FC<AspectRatiosDropdownProps> = ({
  aspect,
  aspectRatios,
  handleAspectChange,
}) => (
  <div className={styles.aspectRatios}>
    {aspectRatios.map(ar => (
      <button
        type={'button'}
        key={ar.label}
        className={`${styles.aspectBtn} ${
          aspect === ar.value || (ar.value === 0 && aspect === undefined) ? styles.active : ''
        }`}
        onClick={() => handleAspectChange(ar.value)}
      >
        {ar.label}
        {ar.icon}
      </button>
    ))}
  </div>
)
