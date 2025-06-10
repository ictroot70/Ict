'use client'
import { Button, Card, Typography } from '@/shared'
import { GitHub, Google } from '@ictroot/ui-kit'

import { ControlledInput } from '@/features/formControls/input/ui'
import { useForm } from 'react-hook-form'
import s from './SignInForm.module.scss'

export const SignInForm = () => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmitHandler = (data: any) => {
    console.log(data)
    reset()
  }

  return (
    <Card className={s.wrapper}>
      <Typography variant="h1" className={s.title}>
        Sign In
      </Typography>
      <div className={s.oauthProviders}>
        <Button as="a" variant="text" href="#google">
          <Google size={36} />
        </Button>
        <Button as="a" variant="text" href="#github">
          <GitHub size={36} color="var(--color-light-100)" />
        </Button>
      </div>
      <form className={s.form} autoComplete="off" onSubmit={handleSubmit(onSubmitHandler)}>
        <div className={s.fields}>
          <ControlledInput
            name="email"
            control={control}
            id="email"
            inputType="text"
            label="Email"
            placeholder="Your email..."
          />
          <ControlledInput
            name="password"
            control={control}
            id="password"
            inputType="hide-able"
            label="Password"
            placeholder="***************"
            className={s.passwordField}
          />
        </div>

        <Typography variant="regular_14" asChild>
          <a href="#" className={s.link}>
            Forgot Password
          </a>
        </Typography>

        <Button variant="primary" fullWidth>
          Sign In
        </Button>
      </form>
      <div className={s.hasAccount}>
        <Typography variant="regular_16">Don’t have an account?</Typography>
        <Button as="a" variant="text" fullWidth href="#sign-up">
          Sign Up
        </Button>
      </div>
    </Card>
  )
}
