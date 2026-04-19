'use client'

import { ReactElement } from 'react'

import { useSignIn } from '@/features/auth'
import { ControlledInput } from '@/features/formControls'
import { API_ROUTES } from '@/shared/api'
import { getApiBaseUrl } from '@/shared/api/get-api-base-url'
import { Loading, OAuthIcons } from '@/shared/composites'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Card, Typography } from '@/shared/ui'
import Link from 'next/link'

import s from './SignInForm.module.scss'

type SignInFormProps = {
  router: { replace: (url: string) => void }
}

export const SignInForm = ({ router }: SignInFormProps): ReactElement => {
  const {
    form: {
      control,
      formState: { errors, isDirty, isValid },
    },
    onSubmit,
    isLoading,
  } = useSignIn(router)

  if (isLoading) {
    return <Loading />
  }

  const handleGoogleSignIn = () => {
    const params = new URLSearchParams({
      redirect_uri: process.env.NEXT_PUBLIC_LOCAL_URL ?? '',
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      scope: 'email profile',
      prompt: 'consent',
    })

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  const handleGitHubSignIn = () => {
    const redirectUrl = `${window.location.origin}${APP_ROUTES.ROOT}`
    const params = new URLSearchParams({ redirectUrl })

    window.location.href = `${getApiBaseUrl()}${API_ROUTES.AUTH.GITHUB_LOGIN}?${params.toString()}`
  }

  return (
    <Card className={s.wrapper}>
      <Typography variant={'h1'} className={s.title}>
        Sign In
      </Typography>
      <OAuthIcons onSignInGoogle={handleGoogleSignIn} onSignInGithub={handleGitHubSignIn} />

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
