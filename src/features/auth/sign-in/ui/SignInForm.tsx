'use client'

import { useSignIn } from '@/features/auth'
import { ControlledInput } from '@/features/formControls'
import { OAuthIcons } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Card, Typography } from '@/shared/ui'
import Link from 'next/link'
import { ReactElement } from 'react'

import s from './SignInForm.module.scss'

export const SignInForm = (): ReactElement => {
  const {
    form: {
      control,
      formState: { errors, isDirty, isValid },
    },
    onSubmit,
    isLoading,
  } = useSignIn()

  return (
    <Card className={s.wrapper}>
      <Typography variant={'h1'} className={s.title}>
        Sign In
      </Typography>
      <OAuthIcons onSignInGoogle={() => {}} onSignInGithub={() => {}} />

      <form className={s.form} autoComplete={'on'} noValidate onSubmit={onSubmit}>
        <div className={s.fields}>
          <ControlledInput
            name={'email'}
            control={control}
            id={'email'}
            inputType={'text'}
            error={errors.email?.message}
            label={'Email'}
            placeholder={'Your email...'}
          />
          <ControlledInput
            name={'password'}
            control={control}
            id={'password'}
            inputType={'hide-able'}
            error={errors.password?.message}
            label={'Password'}
            placeholder={'***************'}
            className={s.passwordField}
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
