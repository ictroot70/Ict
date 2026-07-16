'use client'

import { ReactElement, useState } from 'react'
import { useWatch } from 'react-hook-form'

import { useSignIn } from '@/features/auth'
import { ControlledInput } from '@/features/formControls'
import { OAuthIcons } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Card, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './SignInForm.module.scss'

type SignInFormProps = {
  router: { replace: (url: string) => void }
  redirectFrom?: null | string
}

export const SignInForm = ({ router, redirectFrom }: SignInFormProps): ReactElement => {
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null)
  const {
    form: {
      control,
      formState: { errors, isDirty, isSubmitted, isValid, touchedFields },
    },
    onSubmit,
    isLoading,
  } = useSignIn(router, redirectFrom)
  const emailValue = useWatch({ control, name: 'email' })
  const passwordValue = useWatch({ control, name: 'password' })
  const emailError =
    (touchedFields.email || isSubmitted) && !(focusedField === 'email' && emailValue)
      ? errors.email?.message
      : ''
  const passwordError =
    (touchedFields.password || isSubmitted) && !(focusedField === 'password' && passwordValue)
      ? errors.password?.message
      : ''

  return (
    <Card className={s.wrapper}>
      <Typography variant={'h1'} className={s.title}>
        Sign In
      </Typography>
      <OAuthIcons onSignInGoogle={() => {}} onSignInGithub={() => {}} disabled={isLoading} />

      <form className={s.form} autoComplete={'on'} noValidate onSubmit={onSubmit}>
        <div className={s.fields}>
          <ControlledInput
            name={'email'}
            control={control}
            id={'email'}
            inputType={'text'}
            error={emailError}
            label={'Email'}
            placeholder={'Your email...'}
            disabled={isLoading}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
          <ControlledInput
            name={'password'}
            control={control}
            id={'password'}
            inputType={'hide-able'}
            error={passwordError}
            label={'Password'}
            placeholder={'***************'}
            className={s.passwordField}
            disabled={isLoading}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        <Typography variant={'regular_14'} asChild>
          <Link href={APP_ROUTES.AUTH.PASSWORD_RECOVERY} className={s.link}>
            Forgot Password
          </Link>
        </Typography>
        <Button disabled={!isValid || !isDirty || isLoading} variant={'primary'} fullWidth>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <div className={s.hasAccount}>
        <Typography variant={'regular_16'}>Don’t have an account?</Typography>
        <Button variant={'text'} fullWidth>
          <Link href={APP_ROUTES.AUTH.REGISTRATION}>Sign Up</Link>
        </Button>
      </div>
    </Card>
  )
}
