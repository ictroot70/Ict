import "./globals.css";
import {ReactNode} from 'react';
import Header from '@/app/common/components/header/Header';


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        <Header/>
        <main>{children}</main>

        </body>
        </html>
    );
}
