import styles from './MessengerEmptyState.module.scss'

export const MessengerEmptyState = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.title}>Choose who you would like to talk to</p>
      </div>
    </div>
  )
}
