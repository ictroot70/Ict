import Link from 'next/link'
import s from './Header.module.scss'

export default function Header() {
  return (
    <header className={s.root}>
      <Link href="/">Home</Link>
      <Link href="/sign-in">SingIn</Link>
      <Link href="/sign-up">SingUp</Link>
      <Link href="/privacy">Privacy</Link>
    </header>
  )
}
