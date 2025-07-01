'use client'

import s from './ForgotPasswordForm.module.scss'

import { useRouter } from 'next/navigation'

import FormWrapper from '@/common/components/FormWrapper/FormWrapper'
import ModalEmailSent from '@/common/components/ModalEmailSent/ModalEmailSent'
import { ControlledInput } from '@/features/formControls/input/ui'
import { Button, Recaptcha, Typography } from '@/shared'

import { ROUTES } from '@/common/constants/routers'
import { useForgotPassword } from '../lib/hooks/useForgotPassword'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const {
    control,
    handleSubmit,
    isValid,
    recaptchaValue,
    isEmailSent,
    isOpenModalWindow,
    currentEmail,
    handleRecaptchaChange,
    handleCloseModalWindow,
  } = useForgotPassword()

  return (
    <>
      <FormWrapper title="forgot password">
        <form onSubmit={handleSubmit} className={s.form}>
          <ControlledInput
            control={control}
            name="email"
            inputType="text"
            label="Email"
            placeholder="Enter your email"
          />

          <Typography variant={'regular_14'} className={s.description}>
            Enter your email address and we will send you further instructions
          </Typography>

          {isEmailSent && (
            <Typography variant={'regular_14'} className={s.message}>
              The link has been sent by email.
              <br />
              If you don’t receive an email send link again
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={!isValid || (!isEmailSent && !recaptchaValue)}
            className={s.button}
          >
            {isEmailSent ? 'Send Link Again' : 'Send Link'}
          </Button>

          <Button
            variant={'text'}
            fullWidth
            onClick={() => router.push(ROUTES.signIn)}
            className={s.button}
          >
            Back to Sign In
          </Button>
          {!isEmailSent && (
            <Recaptcha
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
            />
          )}
        </form>
      </FormWrapper>

      <ModalEmailSent
        email={currentEmail}
        isOpen={isOpenModalWindow}
        onClose={handleCloseModalWindow}
      />
    </>
  )
}
