import "./globals.css";
import { ReactNode } from 'react';
import { Inter } from "next/font/google";
import Header from '@/app/common/components/header/Header';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-family',
    display: 'swap',
})

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable}`}>
                <Header />
                <main>{children}</main>

            </body>
        </html>
    );
}
