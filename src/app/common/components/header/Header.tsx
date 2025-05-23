import Link from 'next/link';


export default function Header() {
    return (
        <header className={"head"}>
            <Link href="/">Home</Link>
            <Link href="/sign-in">SingIn</Link>
            <Link href="/sign-up">SingUp</Link>
            <Link href="/privacy">Privacy</Link>
        </header>
    );
}