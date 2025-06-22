'use client'
import * as React from 'react';
import Link from "next/link";
import Image from 'next/image'
import img from './../assets/sign-up/bro.png'
import s from './EmailConfirmed.module.scss'
import { Typography } from '@/shared'


export const EmailConfirmed = () => {
    return (
        <div className={s.emailConfirmedContainer}>
            <Typography variant={'h1'} className={s.h1}>Congratulations!</Typography>
            <Typography variant={'regular_16'} className={s.text}>Your email has been confirmed</Typography>

            <Link href={'/sign-in'} className={s.link}>
                <Typography variant={'h3'}>
                    Sign in
                </Typography>
            </Link>

            <Image src={img} alt="Email confirmed"/>
        </div>
    );
};