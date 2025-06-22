'use client'

import { ControlledCheckbox } from '@/features/formControls/checkbox/ui'
import { ControlledInput } from '@/features/formControls/input/ui'
import { Button, Card, Typography } from '@/shared'
import { GitHub, Google } from '@ictroot/ui-kit'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import s from './SignUpForm.module.scss'
import {SignUpFormData, signUpSchema} from "@/features/auth/sign-up/lib/validationSchemas";

const labelContent = (
    <>
        I agree to the{' '}
        <a href="/terms-of-service" rel={'noopener noreferrer'} target="_blank">
            Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy-policy" rel={'noopener noreferrer'} target="_blank">
            Privacy Policy
        </a>{' '}
    </>
)

export const SignUpForm = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [serverError, setServerError] = useState('')

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
        setError,
        watch
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        mode: 'onBlur', // Валидация при потере фокуса
        defaultValues: {
            username: '',
            email: '',
            password: '',
            passwordConfirm: '',
            agreement: false,
        },
    })

    // Следим за состоянием чекбокса
    const isAgreementChecked = watch('agreement')

    const onSubmitHandler = async (data: SignUpFormData) => {
        setIsLoading(true)
        setServerError('')

        try {
            const response = await fetch('https://inctagram.work/api/v1/auth/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: data.username,
                    email: data.email,
                    password: data.password,
                    baseUrl: window.location.origin
                }),
            })

            console.log('Response status:', response.status)
            console.log('Response headers:', Object.fromEntries(response.headers.entries()))

            // Проверяем, есть ли контент для парсинга
            let result = null
            const contentType = response.headers.get('content-type')

            if (contentType && contentType.includes('application/json')) {
                const responseText = await response.text()
                console.log('Raw response text:', responseText)

                if (responseText.trim()) {
                    try {
                        result = JSON.parse(responseText)
                    } catch (parseError) {
                        console.error('JSON parse error:', parseError)
                        setServerError('Invalid server response format.')
                        return
                    }
                }
            }

            console.log('Parsed result:', result)

            if (response.ok) {
                // Статус 204 означает успешную регистрацию без контента
                if (response.status === 204) {
                    setSuccessMessage(
                        `Registration successful! We have sent a confirmation code to ${data.email}. Please check your email.`
                    )
                    reset()
                } else if (result) {
                    setSuccessMessage(
                        result.message || `Registration successful! We have sent a confirmation code to ${data.email}. Please check your email.`
                    )
                    reset()
                } else {
                    setSuccessMessage(
                        `Registration successful! We have sent a confirmation code to ${data.email}. Please check your email.`
                    )
                    reset()
                }
            } else {
                // Обработка ошибок
                if (response.status === 500) {
                    if (result?.messages && result.messages[0]?.message.includes('userName')) {
                        setError('username', {
                            type: 'server',
                            message: 'User with this username is already registered'
                        })
                    } else if (result?.messages && result.messages[0]?.message.includes('email')) {
                        setError('email', {
                            type: 'server',
                            message: 'User with this email is already registered'
                        })
                    } else {
                        setServerError('Server error occurred. Please try again later.')
                    }
                } else if (response.status === 400) {
                    if (result?.messages && Array.isArray(result.messages)) {
                        result.messages.forEach((error: any) => {
                            if (error.field === 'userName' || error.field === 'username') {
                                setError('username', {
                                    type: 'server',
                                    message: error.message
                                })
                            } else if (error.field === 'password') {
                                setError('password', {
                                    type: 'server',
                                    message: error.message
                                })
                            } else if (error.field === 'email') {
                                setError('email', {
                                    type: 'server',
                                    message: error.message
                                })
                            }
                        })
                    } else {
                        setServerError('Invalid input data. Please check your information.')
                    }
                } else if (response.status === 429) {
                    setServerError('Too many requests. Please wait a moment and try again.')
                } else {
                    setServerError(`Registration failed. Server returned status: ${response.status}`)
                }
            }
        } catch (error) {
            console.error('Registration error:', error)
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                setServerError('Network error. Please check your connection and try again.')
            } else {
                setServerError('An unexpected error occurred. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }
    // Модальное окно успеха
    if (successMessage) {
        return (
            <Card className={s.successModal}>
                <Typography variant="h2" className={s.successTitle}>
                    Registration Successful!
                </Typography>
                <Typography variant="regular_16" className={s.successMessage}>
                    {successMessage}
                </Typography>
                <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setSuccessMessage('')}
                >
                    OK
                </Button>
            </Card>
        )
    }

    return (
        <Card className={s.wrapper}>
            <Typography variant="h1" className={s.title}>
                Sign Up
            </Typography>

            <div className={s.oauthProviders}>
                <Button as="a" href="#google" variant="text">
                    <Google size={36} />
                </Button>
                <Button as="a" href="#github" variant="text">
                    <GitHub size={36} color="var(--color-light-100)" />
                </Button>
            </div>

            <form className={s.form} autoComplete="off" onSubmit={handleSubmit(onSubmitHandler)}>
                <div className={s.fields}>
                    <ControlledInput
                        id="username"
                        name="username"
                        control={control}
                        inputType="text"
                        label="Username"
                        placeholder="Your username..."
                        error={errors.username?.message}
                    />

                    <ControlledInput
                        id="email"
                        name="email"
                        control={control}
                        inputType="text"
                        label="Email"
                        placeholder="Your email..."
                        error={errors.email?.message}
                    />

                    <ControlledInput
                        id="password"
                        name="password"
                        control={control}
                        inputType="hide-able"
                        label="Password"
                        placeholder="***************"
                        className={s.passwordField}
                        error={errors.password?.message}
                    />

                    <ControlledInput
                        id="passwordConfirm"
                        name="passwordConfirm"
                        control={control}
                        inputType="hide-able"
                        label="Password confirmation"
                        placeholder="***************"
                        className={s.passwordField}
                        error={errors.passwordConfirm?.message}
                    />
                </div>

                <ControlledCheckbox
                    name="agreement"
                    control={control}
                    label={labelContent}
                    className={s.agreement}
                />

                {/* Отображение общих ошибок сервера */}
                {serverError && (
                    <div className={s.serverError}>
                        <Typography variant="regular_14" color="error">
                            {serverError}
                        </Typography>
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={!isValid || !isAgreementChecked || isLoading}
                >
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
            </form>
            <div className={s.hasAccount}>
                <Typography variant="regular_16">Do you have an account?</Typography>
                <Button as="a" href="/sign-in" variant="text" fullWidth>
                    Sign In
                </Button>
            </div>
        </Card>
    )
}