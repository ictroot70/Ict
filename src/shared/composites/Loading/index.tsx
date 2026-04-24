import styles from './Loading.module.scss'

interface Props {
  size?: number
}
export const Loading = (props: Props) => {
  const { size } = props

  return <span style={{ fontSize: size }} className={styles.loader}></span>
}
