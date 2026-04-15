import React from 'react'

import styles from './Loading.module.scss'

interface Props {
  mode?: 'container' | 'fullscreen'
  size?: number
}
export const Loading = (props: Props) => {
  const { size, mode = 'fullscreen' } = props

  return (
    <div className={mode === 'fullscreen' ? styles.fullscreenRoot : styles.containerRoot}>
      <span style={{ fontSize: size }} className={styles.loader}></span>
    </div>
  )
}
