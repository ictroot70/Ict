'use client'

import { Button, Card, OAuthIcons, Typography } from '@/shared/ui'

import { ControlledInput } from '@/features/formControls/input/ui'
import s from './SignInForm.module.scss'
import Link from 'next/link'
import { Control, FieldErrors } from 'react-hook-form'
import { ReactElement } from 'react'
import { LoginFields } from '@/features/auth/sign-in/model/validation'

export type SignInFormProps = {
  control: Control<LoginFields>
  formState: {
    errors: FieldErrors<LoginFields>
    isDirty: boolean
    isValid: boolean
  }
  onSubmit: () => void
  isLoading: boolean
  onSignInGoogle?: () => void
  onSignInGithub?: () => void
}

export const SignInForm = (props: SignInFormProps): ReactElement => {
  const { control, formState, onSubmit, isLoading, onSignInGoogle, onSignInGithub } = props

  return (
    <Card className={s.wrapper}>
      <Typography variant="h1" className={s.title}>
        Sign In
      </Typography>
      <OAuthIcons onSignInGoogle={onSignInGoogle} onSignInGithub={onSignInGithub} />

      <form className={s.form} autoComplete="on" noValidate onSubmit={onSubmit}>
        <div className={s.fields}>
          <ControlledInput
            name="email"
            control={control}
            id="email"
            inputType="text"
            error={formState.errors.email?.message}
            label="Email"
            placeholder="Your email..."
            required
          />
          <ControlledInput
            name="password"
            control={control}
            id="password"
            inputType="hide-able"
            error={formState.errors.password?.message}
            label="Password"
            placeholder="***************"
            className={s.passwordField}
            required
          />
        </div>

        <Typography variant="regular_14" asChild>
          <Link href="/auth/new-password" className={s.link}>
            Forgot Password
          </Link>
        </Typography>
        <Button
          disabled={!formState.isValid || !formState.isDirty || isLoading}
          variant="primary"
          fullWidth
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <div className={s.hasAccount}>
        <Typography variant="regular_16">Don’t have an account?</Typography>
        <Button as={Link} href="/auth/registration" variant="text" fullWidth>
          Sign Up
        </Button>
      </div>
    </Card>
  )
}
