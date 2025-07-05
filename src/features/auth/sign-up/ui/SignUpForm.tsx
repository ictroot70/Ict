'use client'

import { ControlledCheckbox } from '@/features/formControls/checkbox/ui'
import { ControlledInput } from '@/features/formControls/input/ui'
import { Button, Card, Typography } from '@/shared/ui'
import {GitHub, Google, Modal} from '@ictroot/ui-kit'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import s from './SignUpForm.module.scss'
import {zodResolver} from "@hookform/resolvers/zod";
import {SignUpFormData, signUpSchema} from "@/features/auth/sign-up/lib/validation/validationSchemas";
import {useSignupMutation} from "@/features/auth/api/authApi";
import {RegistrationErrorResponse} from "@/shared/api/api.types";
import {REGISTRATION_MESSAGES} from "@/shared/constant/registrationMessages";
import {useRouter} from "next/navigation";

const labelContent = (
  <>
    I agree to the{' '}
    <a href={''} rel={'noopener noreferrer'} onClick={e => e.stopPropagation()}>
      Terms of Service
    </a>{' '}
    and{' '}
    <a href={''} rel={'noopener noreferrer'} onClick={e => e.stopPropagation()}>
      Privacy Policy
    </a>{' '}
  </>
)

export const SignUpForm = () => {
    const [signup, { isLoading }] = useSignupMutation()

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
        mode: 'onBlur',
        defaultValues: {
            username: '',
            email: '',
            password: '',
            passwordConfirm: '',
            agreement: false,
        },
    })

    const isAgreementChecked = watch('agreement')

  const onSubmitHandler = async (data: SignUpFormData) => {
      setServerError('')
      try {

          const result = await signup({
              userName: data.username,
              email: data.email,
              password: data.password,
              baseUrl: window.location.origin + "/registration-confirm"
          }).unwrap()



          setSuccessMessage(
              result?.message ||
              `Registration successful! We have sent a confirmation code to ${data.email}. Please check your email.`
          )
          localStorage.setItem('lastRegistrationEmail', data.email);
          reset()
      } catch (error) {
          const apiError = error as { status: number; data: RegistrationErrorResponse };
          if (apiError && apiError.status === 400 && apiError.data?.messages) {
              apiError.data.messages.forEach((err) => {
                  if (err.field === 'userName' || err.field === 'username') {
                      setError('username', {
                          type: 'server',
                          message: REGISTRATION_MESSAGES.USERNAME_EXISTS,
                      })
                  } else if (err.field === 'password') {
                      setError('password', {
                          type: 'server',
                          message: err.message,
                      })
                  } else if (err.field === 'email') {
                      setError('email', {
                          type: 'server',
                          message: REGISTRATION_MESSAGES.EMAIL_EXISTS,
                      })
                  }
              })
          } else if (apiError && apiError.status === 429) {
              setServerError('Too many requests. Please wait a moment and try again.')
          } else {
              setServerError(
                  `Registration failed. Server returned status: ${apiError?.status || 'unknown'}`
              )
          }
      }
  }

  if (successMessage) {
      const router = useRouter();
      return (
          <Modal
              open={!!successMessage}
              onClose={() => setSuccessMessage('')}
              modalTitle="Registration Successful!"
              width={400}
          >
              <Typography variant="regular_16" style={{ marginBottom: 24 }}>
                  {successMessage}
              </Typography>
              <Button
                  fullWidth
                  variant="primary"
                  onClick={() => {
                      setSuccessMessage('');
                      router.replace('/auth/login')
                  }}
              >
                  OK
              </Button>
          </Modal>
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
        <Button as="a" href="/auth/login" variant="text" fullWidth>
          Sign In
        </Button>
      </div>
    </Card>
  )
}
