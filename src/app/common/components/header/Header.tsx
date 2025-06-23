import Link from 'next/link'

export default function Header() {
  return (
    <header className="head">
      <Link href="/">Home</Link>
      <Link href="/sign-in">SingIn</Link>
      <Link href="/sign-up">SingUp</Link>
      <Link href="/forgot-password">Forgot Password</Link>
      <Link href="/create-new-password">Create New Password</Link>
      <Link href="/email-expired">Email Expired</Link>
      <Link href="/email-confirmed">Email Confirmed</Link>
    </header>
  )
}
