'use client'

import s from './CreateNewPasswordForm.module.scss'
import '@ictroot/ui-kit/style.css'
import { Card, Input, Button, Typography, Recaptcha } from '@/shared'
import { useState } from 'react'

export default function CreateNewPasswordForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('The passwords must match')
            return
        }

        setError('')
    }

    return (
        <Card className={s.wrapper}>
            <Typography variant={'h1'} className={s.title}>
                Create New Password
            </Typography>
            <form onSubmit={handleSubmit}>
                <Input
                    inputType={'hide-able'}
                    label={'New password'}
                    placeholder={'Enter your password'}
                    className={s.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <span className={s.indentation} aria-hidden="true">&nbsp;</span>
                <Input
                    inputType={'hide-able'}
                    placeholder={'Enter your password'}
                    label={'Password confirmation'}
                    value={confirmPassword}
                    error={error}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Typography variant={'regular_14'} className={s.text}>
                    Your password must be between 6 and 20 characters
                </Typography>

                <Button
                    type="submit"
                    fullWidth={true}
                    className={s.button}
                >
                    Create new password
                </Button>
            </form>
        </Card>
    )
}