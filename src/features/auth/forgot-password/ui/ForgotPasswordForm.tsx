'use client';

import { useForm } from 'react-hook-form';
import { Card, Button, Typography, Recaptcha } from '@/shared';
import { useState, useCallback } from 'react';
import { ControlledInput } from '@/features/formControls/input/ui';
import s from './ForgotPasswordForm.module.scss';
import '@ictroot/ui-kit/style.css';

interface FormData {
    email: string;
}

export default function ForgotPasswordForm() {
    const { control, handleSubmit } = useForm<FormData>();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
    const [showRecaptcha, setShowRecaptcha] = useState(true);

    const handleRecaptchaChange = useCallback((token: string | null) => {
        if (token) {
            setIsRecaptchaVerified(true);
            setShowRecaptcha(false);
        } else {
            setIsRecaptchaVerified(false);
        }
    }, []);

    const onSubmit = (data: FormData) => {
        console.log('Form submitted:', data);
        setIsSubmitted(true);
    };

    return (
        <Card className={s.wrapper}>
            <Typography variant={'h1'} className={s.title}>
                Forgot Password
            </Typography>
            <div className={s.wrap}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ControlledInput
                        control={control}
                        name="email"
                        inputType="text"
                        label="Email"
                        placeholder="Enter your email"
                    />

                    <Typography variant={'regular_14'} className={s.text}>
                        Enter your email address and we will send you further instructions
                    </Typography>

                    {!showRecaptcha && (
                        <Typography variant={'regular_14'} className={s.text2}>
                            The link has been sent by email.
                            If you don't receive an email send link again
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        fullWidth={true}
                        disabled={isSubmitted}
                    >
                        Send Link
                    </Button>
                </form>
                <Button as={'a'} variant={'text'} fullWidth={true}>
                    Back to Sign In
                </Button>
            </div>

            {showRecaptcha && (
                <Recaptcha
                    sitekey={'6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                    onChange={handleRecaptchaChange}
                />
            )}
        </Card>
    );
}