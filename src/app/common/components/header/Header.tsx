import Link from 'next/link';


export default function Header() {
    return (
        <>
            <Link href="/">Home</Link>
            <Link href="/(auth)/sign-in">SingIn</Link>
            <Link href="/(auth)/sign-up">SingUp</Link>
            <Link href="/(auth)/privacy">Privacy</Link>
        </>
    );
}