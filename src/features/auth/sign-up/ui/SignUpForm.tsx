'use client'

import { ControlledCheckbox } from '@/features/formControls/checkbox/ui'
import { ControlledInput } from '@/features/formControls/input/ui'
import { Button, Card, Typography } from '@/shared/ui'
import { GitHub, Google, Modal } from '@ictroot/ui-kit'
import s from './SignUpForm.module.scss'
import { useWatch } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { APP_ROUTES } from '@/shared/constant/app-routes'
import { useSignUp } from '@/features/auth'

const labelContent = (
  <>
    I agree to the&nbsp;
    <a
      href={APP_ROUTES.PUBLIC.TERMS}
      rel={'noopener noreferrer'}
      onClick={e => e.stopPropagation()}
    >
      Terms of Service
    </a>
    &nbsp;and&nbsp;
    <a
      href={APP_ROUTES.PUBLIC.PRIVACY}
      rel={'noopener noreferrer'}
      onClick={e => e.stopPropagation()}
    >
      Privacy Policy
    </a>
  </>
)

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
    return (
      <Modal
        open={isSuccess}
        onClose={handleModalClose}
        modalTitle="Email sent"
        width={378}
        height={228}
      >
        <Typography variant="regular_16" style={{ margin: '0 0 18px' }}>
          We have sent a link to confirm your email to <br />
          <b>{email}</b>
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            style={{ minWidth: 120, fontSize: 16, fontWeight: 600 }}
            onClick={handleModalClose}
          >
            OK
          </Button>
        </div>
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
      <form className={s.form} autoComplete="off" onSubmit={onSubmit}>
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
        <Button as="a" href={APP_ROUTES.AUTH.LOGIN} variant="text" fullWidth>
          Sign In
        </Button>
      </div>
    </Card>
  )
}
