'use client'

import s from './SignUpForm.module.scss'
import '@ictroot/ui-kit/style.css'

import { GitHub, Google } from '@ictroot/ui-kit'
import { Card, Button, CheckboxRadix, Input, Typography } from '@/shared'

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
  return (
    <Card className={s.wrapper}>
      <Typography variant="h1" className={s.title}>
        Sign Up
      </Typography>
      <div className={s.oauthProviders}>
        <Button as="a" variant="text">
          <Google size={36} />
        </Button>
        <Button as="a" variant="text">
          <GitHub size={36} color="var(--color-light-100)" />
        </Button>
      </div>
      <form action="" className={s.form} autoComplete="off">
        <div className={s.fields}>
          <Input id="username" inputType="text" label="Username" placeholder="Your username..." />
          <Input id="email" inputType="text" label="Email" placeholder="Your email..." />
          <Input
            id="password"
            inputType="hide-able"
            label="Password"
            placeholder="***************"
            className={s.passwordField}
          />
          <Input
            id="passwordConfirm"
            inputType="hide-able"
            label="Password confirmation"
            placeholder="***************"
            className={s.passwordField}
          />
        </div>

        <CheckboxRadix label={labelContent} className={s.agreement} />
        <Button variant="primary" fullWidth>
          Sign Up
        </Button>
      </form>
      <div className={s.hasAccount}>
        <Typography variant="regular_16">Do you have an account?</Typography>
        <Button as="a" variant="text" fullWidth>
          Sign In
        </Button>
      </div>
    </Card>
  )
}
