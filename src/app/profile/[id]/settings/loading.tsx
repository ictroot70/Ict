'use client'
import { Loading as LoadingComponent } from '@/shared/composites'

import s from './loading.module.scss'

export default function Loading() {
  return (
    <div className={s.loadingRoot}>
      <LoadingComponent mode={'container'} />
    </div>
  )
}
