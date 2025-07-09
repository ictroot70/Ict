'use client'

import s from './CreateNewPasswordForm.module.scss'

import { Button, ModalWithButton, Typography, FormWrapper, Loading } from '@/shared/ui'
import { ControlledInput } from '@/features/formControls/input/ui'
import { useCreateNewPassword } from '../hooks/useCreateNewPassword'

export function CreateNewPasswordForm() {
  const {
    control,
    handleSubmit,
    isValidating,
    isSubmitting,
    isOpenModalWindow,
    handleCloseModalWindow,
  } = useCreateNewPassword()

  if (isValidating) {
    return <Loading />
  }

  return (
    <>
      <FormWrapper title="create new password">
        <form className={s.form} onSubmit={handleSubmit} autoComplete="off">
          <div className={s.inputs}>
            <ControlledInput
              control={control}
              name="password"
              inputType="hide-able"
              label="New password"
              placeholder="Enter your password"
            />
            <ControlledInput
              control={control}
              name="passwordConfirmation"
              inputType="hide-able"
              placeholder="Confirm your password"
              label="Password confirmation"
            />
          </div>

          <Typography variant="regular_14" className={s.description}>
            Your password must be between 6 and 20 characters
          </Typography>

          <Button type="submit" fullWidth={true} className={s.button} disabled={isSubmitting}>
            Create new password
          </Button>
        </form>
      </FormWrapper>

      <ModalWithButton
        title="Password restored"
        message="Great news! Your password has been successfully recovered and reset. You can now sign in to your account using your new password."
        isOpen={isOpenModalWindow}
        onClose={handleCloseModalWindow}
      />
    </>
  )
}
