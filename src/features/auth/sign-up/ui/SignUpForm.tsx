'use client'

import { useWatch } from 'react-hook-form'

import { useSignUp } from '@/features/auth'
import { ControlledCheckbox, ControlledInput } from '@/features/formControls'
import { APP_ROUTES } from '@/shared/constant'
import { Button, Card, OAuthIcons, Typography } from '@/shared/ui'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import s from './SignUpForm.module.scss'

import { AgreementLabel } from './AgreementLabel'
import { SignUpConfirmModal } from './SignUpConfirmModal'

export const SignUpForm = () => {
  const { form, onSubmit, isAgreementChecked, isLoading, serverError, isSuccess, setIsSuccess } =
    useSignUp()

  const {
    control,
    formState: { errors, isValid },
  } = form
  const email = useWatch({ control, name: 'email' })
  const router = useRouter()

  const handleModalClose = () => {
    setIsSuccess(false)
    form.reset()
    router.replace(APP_ROUTES.AUTH.LOGIN)
  }

  if (isSuccess) {
    return <SignUpConfirmModal open={isSuccess} onClose={handleModalClose} userEmail={email} />
  }

  return (
    <Card className={s.wrapper}>
      <Typography variant={'h1'} className={s.title}>
        Sign Up
      </Typography>

      <OAuthIcons onSignInGoogle={() => {}} onSignInGithub={() => {}} />

      <form className={s.form} autoComplete={'off'} onSubmit={onSubmit}>
        <div className={s.fields}>
          <ControlledInput
            id={'username'}
            name={'username'}
            control={control}
            inputType={'text'}
            label={'Username'}
            placeholder={'Your username...'}
            error={errors.username?.message}
          />
          <ControlledInput
            id={'email'}
            name={'email'}
            control={control}
            inputType={'text'}
            label={'Email'}
            placeholder={'Your email...'}
            error={errors.email?.message}
          />
          <ControlledInput
            id={'password'}
            name={'password'}
            control={control}
            inputType={'hide-able'}
            label={'Password'}
            placeholder={'***************'}
            className={s.passwordField}
            error={errors.password?.message}
          />
          <ControlledInput
            id={'passwordConfirm'}
            name={'passwordConfirm'}
            control={control}
            inputType={'hide-able'}
            label={'Password confirmation'}
            placeholder={'***************'}
            className={s.passwordField}
            error={errors.passwordConfirm?.message}
          />
        </div>

        <ControlledCheckbox
          name={'agreement'}
          control={control}
          label={AgreementLabel}
          className={s.agreement}
        />
        {serverError && (
          <div className={s.serverError}>
            <Typography variant={'regular_14'} color={'error'}>
              {serverError}
            </Typography>
          </div>
        )}
        <Button
          type={'submit'}
          variant={'primary'}
          fullWidth
          disabled={!isValid || !isAgreementChecked || isLoading}
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </form>
      <div className={s.hasAccount}>
        <Typography variant={'regular_16'}>Do you have an account?</Typography>
        {/*Todo: need add asChild later*/}
        <Button variant={'text'} fullWidth>
          <Link href={APP_ROUTES.AUTH.LOGIN}>Sign In</Link>
        </Button>
      </div>
    </Card>
  )
}
