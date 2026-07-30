import styles from './MessengerEmptyState.module.scss'

interface MessengerEmptyStateProps {
  message?: string
}

export const MessengerEmptyState = ({
  message = 'Choose who you would like to talk to',
}: MessengerEmptyStateProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.title}>{message}</p>
      </div>
    </div>
  )
}
