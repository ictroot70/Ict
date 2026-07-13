import styles from '@/entities/messenger/ui/MessengerPage.module.scss'

export default function Messenger() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <p className={styles.title}>Choose who you would like to talk to</p>
      </div>
    </div>
  )
}
