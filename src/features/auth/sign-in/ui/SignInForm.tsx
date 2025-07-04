'use client'
import { Button, Card, Typography } from '@/shared'
import { GitHub, Google, ToastContainer } from '@ictroot/ui-kit'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToastContext } from '@/shared/lib/providers/toasr'

import { ControlledInput } from '@/features/formControls/input/ui'
import { useForm } from 'react-hook-form'
import s from './SignInForm.module.scss'
import Link from 'next/link'
import { useLoginMutation, useMeQuery } from '@/services/ict.api'

import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

export const signInSchema = z.object({
  email: z
    .string()
    .min(3, { message: 'Email is required' })
    .email({ message: 'This is not a valid email.' }),
  password: z.string(),
})
type LoginFields = z.infer<typeof signInSchema>

type LoginFormProps = {
  onSubmit: (data: LoginFields) => void
  errorMessage: string
  // onSignInGoogle: () => void
  // onSignInGithub: () => void
}

export const SignInForm = () => {
  // const { onSubmit, errorMessage } = props
  const router = useRouter()
  const [logIn, { isLoading, data, isError, error, isSuccess, status }] = useLoginMutation()
  const meRes = useMeQuery()
  const { showToast } = useToastContext()
  console.log('data', data)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFields>({
    defaultValues: {
      email: 'smbat15@gmail.com',
      password: '120259Asem!',
    },
    mode: 'onBlur',
    shouldFocusError: true,
    shouldUnregister: true,
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    resolver: zodResolver(signInSchema),
  })

  const onSubmitHandler = handleSubmit(data => {
    logIn(data)
      .unwrap()
      .then(async data => {
        const jwtDecoded = jwtDecode<{ userId: string }>(data.accessToken)

        console.log('jwtDecoded', jwtDecoded.userId)
        const userId = jwtDecoded?.userId ?? meRes?.data?.id
        console.log('userId', userId)
        localStorage.setItem('access_token', data.accessToken)

        showToast({
          type: 'success',
          title: 'Welcome!',
          message: 'You have successfully signed in.',
          duration: 4000,
        })

        router.replace(`/public-users/profile/${userId}`)
        router.refresh()
      })
      .catch(err => {
        console.log('err', err)
        const message = err?.data?.messages || 'Something went wrong'
        console.log('message', message)
        showToast({
          type: 'error',
          message,
          duration: 5000,
        })
      })

    reset()
  })

  return (
    <Card className={s.wrapper}>
      <Typography variant="h1" className={s.title}>
        Sign In
      </Typography>
      <div className={s.oauthProviders}>
        <Link href="#google">
          <Google size={36} />
        </Link>
        <Link href="#github">
          <GitHub size={36} />
        </Link>
      </div>
      <form className={s.form} autoComplete="on" noValidate onSubmit={onSubmitHandler}>
        <div className={s.fields}>
          <ControlledInput
            name="email"
            control={control}
            id="email"
            inputType="text"
            error={errors.email?.message}
            label="Email"
            placeholder="Your email..."
            required
          />
          <ControlledInput
            name="password"
            control={control}
            id="password"
            inputType="hide-able"
            error={errors.password?.message}
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

        <Button disabled={isLoading} variant="primary" fullWidth>
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
