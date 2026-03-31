import { RafikiImage, useEmailVerificationResend, usePasswordRecoveryResend } from '@/features/auth'
import { ControlledInput } from '@/features/formControls'
import { ModalWithButton } from '@/shared/composites'
import { Button, Typography } from '@/shared/ui'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

import s from './EmailExpiredForm.module.scss'

export const EmailExpiredForm = () => {
  const params = useSearchParams()
  const modeParam = params?.get('mode')
  const emailFromQuery = params?.get('email')?.trim() || ''
  const isRecoveryMode = modeParam === 'recovery'

  const passwordRecovery = usePasswordRecoveryResend(emailFromQuery)
  const emailVerification = useEmailVerificationResend()

  const hook = isRecoveryMode ? passwordRecovery : emailVerification
  const {
    control,
    register,
    handleSubmit,
    isOpenModalWindow,
    isSubmitting,
    currentEmail,
    handleCloseModalWindow,
  } = hook
  const shouldShowEmailInput = !isRecoveryMode || emailFromQuery.length === 0

  return (
    <>
      <div className={s.wrapper}>
        <div className={s.content}>
          <Typography asChild variant={'h1'} className={s.title}>
            <h2>
              {isRecoveryMode
                ? 'Password recovery link expired'
                : 'Email verification link expired'}
            </h2>
          </Typography>

          <Typography variant={'regular_16'} className={s.description}>
            {isRecoveryMode
              ? 'Looks like the password recovery link has expired. We can send a new one'
              : 'Looks like the verification link has expired. Not to worry, we can send the link again'}
          </Typography>

          <form onSubmit={handleSubmit} className={s.form}>
            {shouldShowEmailInput && (
              <ControlledInput
                control={control}
                name={'email'}
                inputType={'text'}
                label={'Email'}
                placeholder={'Enter your email'}
              />
            )}

            {!shouldShowEmailInput && <input type={'hidden'} {...register('email')} />}

            <Button className={s.button} type={'submit'} fullWidth disabled={isSubmitting}>
              {isRecoveryMode ? 'Resend recovery link' : 'Resend verification link'}
            </Button>
          </form>
        </div>
        <Image src={RafikiImage} alt={'Link expired'} className={s.image} />
      </div>
      <ModalWithButton
        title={'Email sent'}
        message={`We have sent a link to ${isRecoveryMode ? 'recover your password' : 'confirm your email'} to ${currentEmail}`}
        isOpen={isOpenModalWindow}
        onClose={handleCloseModalWindow}
      />
    </>
  )
}
