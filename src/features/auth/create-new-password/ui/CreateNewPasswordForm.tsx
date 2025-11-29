'use client'

import { useCreateNewPassword } from '@/features/auth/create-new-password'
import { ControlledInput } from '@/features/formControls/input/ui'
import { FormWrapper, Loading, ModalWithButton } from '@/shared/composites'
import { Button, Typography } from '@/shared/ui'

import s from './CreateNewPasswordForm.module.scss'

type Props = {
  urlCode: string
  urlEmail: string
  router: { push: (arg0: string) => void }
}

export function CreateNewPasswordForm({ urlCode, urlEmail, router }: Props) {
  const {
    control,
    handleSubmit,
    isValidating,
    isSubmitting,
    isOpenModalWindow,
    handleCloseModalWindow,
  } = useCreateNewPassword(urlCode, urlEmail, router)

  if (isValidating) {
    return <Loading />
  }

  return (
    <>
      <FormWrapper title={'create new password'}>
        <form className={s.form} onSubmit={handleSubmit} autoComplete={'off'}>
          <div className={s.inputs}>
            <ControlledInput
              control={control}
              name={'password'}
              inputType={'hide-able'}
              label={'New password'}
              placeholder={'Enter your password'}
            />
            <ControlledInput
              control={control}
              name={'passwordConfirmation'}
              inputType={'hide-able'}
              placeholder={'Confirm your password'}
              label={'Password confirmation'}
            />
          </div>

          <Typography variant={'regular_14'} className={s.description}>
            Your password must be between 6 and 20 characters
          </Typography>

          <Button type={'submit'} fullWidth className={s.button} disabled={isSubmitting}>
            Create new password
          </Button>
        </form>
      </FormWrapper>

      <ModalWithButton
        title={'Password restored'}
        message={
          'Great news! Your password has been successfully recovered and reset. You can now sign in to your account using your new password.'
        }
        isOpen={isOpenModalWindow}
        onClose={handleCloseModalWindow}
      />
    </>
  )
}
