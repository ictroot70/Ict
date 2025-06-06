'use client'

import s from './ForgotPasswordForm.module.scss'
import '@ictroot/ui-kit/style.css'
import { Card, Input, Button, Typography, Recaptcha } from '@/shared'
import { useState, useCallback } from 'react'

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false)
    const [showRecaptcha, setShowRecaptcha] = useState(true)

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
        if (error) setError('')
    }

    const handleRecaptchaChange = useCallback((token: string | null) => {
        if (token) {
            setIsRecaptchaVerified(true)
            setShowRecaptcha(false) // Скрываем reCAPTCHA после успешной проверки
        } else {
            setIsRecaptchaVerified(false)
        }
    }, [])

    const handleSubmit = () => {
        if (!email) {
            setError('User with this email doesn\'t exist')
            return
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }

        if (!isRecaptchaVerified) {
            setError('Please complete the reCAPTCHA')
            setShowRecaptcha(true)
            return
        }

        setError('')
        setIsSubmitted(true)
    }

    return (
        <Card className={s.wrapper}>
            <Typography variant={'h1'} className={s.title}>
                Forgot Password
            </Typography>

            <Input
                inputType={'text'}
                label={'Email'}
                placeholder={'Enter your email'}
                value={email}
                onChange={handleChange}
                error={error}
            />

            <Typography variant={'regular_14'} className={s.text}>
                Enter your email address and we will send you further instructions
            </Typography>
            {!showRecaptcha && (
                <Typography variant={'regular_14'} className={s.text2}>
                    The link has been sent by email.
                    If you don’t receive an email send link again
                </Typography>
            )}
            <Button
                fullWidth={true}
                onClick={handleSubmit}
                disabled={isSubmitted}
            >
                Send Link
            </Button>
            <span className={s.indentation} aria-hidden="true">&nbsp;</span>
            <Button as={'a'} variant={'text'} fullWidth={true}>
                Back to Sign In
            </Button>

            {showRecaptcha && (
                <Recaptcha
                    sitekey={'6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                    onChange={handleRecaptchaChange}
                />
            )}
        </Card>
    )
}