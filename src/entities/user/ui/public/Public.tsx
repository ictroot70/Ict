'use client'
import { Loading, Typography, Card } from '@/shared/ui'
import { useGetPublicUsersCounterQuery } from '@/entities/user/api/publicUsersApi'
import styles from './Public.module.scss'

export default function Public() {
  const { isLoading, isError, error, data } = useGetPublicUsersCounterQuery()
  console.log('counter', data)

  if (isLoading) {
    return <Loading />
  }
  if (isError) {
    console.log('ME query error:', error)
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
