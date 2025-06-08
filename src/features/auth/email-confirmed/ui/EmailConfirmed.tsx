'use client'
import * as React from 'react';
import {Typography} from "@ictroot/ui-kit";
import Link from "next/link";
import Image from 'next/image'
import img from './../assets/sign-up/bro.png'
import s from './EmailConfirmed.module.scss'


export const EmailConfirmed = () => {
    return (
        <div className={s.emailConfirmedContainer}>
            <Typography variant={'h1'} className={s.h1}>Congratulations!</Typography>
            <Typography variant={'regular_16'} className={s.text}>Your email has been confirmed</Typography>

            <Link href={'/sign-in'} className={s.link}>
                <Typography>
                    Sign in
                </Typography>
            </Link>

            <Image src={img} alt="Email confirmed"/>
        </div>
    );
};