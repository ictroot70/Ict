'use client'
import { useGetPublicUsersCounterQuery } from '@/entities/users/api'
import { Loading } from '@/shared/composites'
import { Card, Typography } from '@/shared/ui'

import styles from './Public.module.scss'


export function Public() {
  const { isLoading, isError, data } = useGetPublicUsersCounterQuery()

  if (isLoading) {
    return <Loading />
  }
  if (isError) {
    return <div>Something went wrong</div>
  }
  if (!data) {
    return null
  }
  const rawCount = data.totalCount.toString()
  const minLength = 6
  const paddedCount = rawCount.padStart(Math.max(minLength, rawCount.length), '0')
  const digits = paddedCount.split('')

  return (
    <>
      <section className={styles.registeredUsersSection}>
        <h2>Registered users:</h2>
        <Card className={styles.counter}>
          <div className={styles.digitsWrapper}>
            {digits.map((digit, index) => (
              <Typography variant={'h2'} className={styles.digitBox} key={index}>
                {digit}
              </Typography>
            ))}
          </div>
        </Card>

      </section>
    </>
  )
}
