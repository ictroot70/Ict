'use client'
import '@ictroot/ui-kit/style.css'
import { GitHub, Google } from '@ictroot/ui-kit'
import { Card, Typography, Input, Button } from '@/shared'

import s from './SignInForm.module.scss'

export const SignInForm = () => {
  return (
    <Card className={s.wrapper}>
      <Typography variant="h1" className={s.title}>
        Sign In
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
          <Input id="email" inputType="text" label="Email" placeholder="Your email..." />
          <Input
            id="password"
            inputType="hide-able"
            label="Password"
            placeholder="***************"
            className={s.passwordField}
          />
        </div>

        <Typography variant="regular_14" asChild className={s.link}>
          <a href="#">Forgot Password</a>
        </Typography>

        <Button variant="primary" fullWidth>
          Sign In
        </Button>
      </form>
      <div className={s.hasAccount}>
        <Typography variant="regular_16">Don’t have an account?</Typography>
        <Button as="a" variant="text" fullWidth>
          Sign Up
        </Button>
      </div>
    </Card>
  )
}
