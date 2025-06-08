'use client'
import * as React from 'react';
import {Button, Typography} from "@ictroot/ui-kit";
import Image from 'next/image'
import img from './../assets/time-management/rafiki.png'
import s from "./EmailExpired.module.scss";
import {ControlledInput} from "@/features/formControls/input/ui";
import {Form, useForm} from "react-hook-form";


export const EmailExpired = () => {
    const {control, handleSubmit, reset} = useForm({
        defaultValues: {
            email: '',
        },
    })

    return (
        <div className={s.emailExpiredContainer}>
            <Typography variant={'h1'} className={s.h1}>Email verification link expired</Typography>
            <Typography variant={'regular_16'} className={s.text}>Looks like the verification link has expired. Not to
                worry, we can send
                the link again</Typography>

            <Form control={control}>

                <ControlledInput name={'email'}
                                 inputType={'text'}
                                 control={control}
                                 label={'Email'}
                                 placeholder={'Epam@epam.com'}
                />

                <Button className={s.button} type="submit">
                    <Typography variant={'h3'}>
                        Resend verification link
                    </Typography>
                </Button>

            </Form>
            <Image src={img} alt="Email verification link expired"/>
        </div>
    );
};