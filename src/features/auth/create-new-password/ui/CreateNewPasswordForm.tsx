'use client'

import s from './CreateNewPasswordForm.module.scss'

import { Button, Typography } from '@/shared'
import { ControlledInput } from '@/features/formControls/input/ui'
import ModalPasswordReset from '@/common/components/ModalPasswordReset/ModalPasswordReset'
import FormWrapper from '@/common/components/FormWrapper/FormWrapper'
import { useCreateNewPassword } from '../lib/hooks/useCreateNewPassword'

export default function CreateNewPasswordForm() {
  const { control, handleSubmit, isValidating, isOpenModalWindow, handleCloseModalWindow } =
    useCreateNewPassword()

  if (isValidating) {
    return null
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

          <Button type="submit" fullWidth={true} className={s.button}>
            Create new password
          </Button>
        </form>
      </FormWrapper>
      <ModalPasswordReset isOpen={isOpenModalWindow} onClose={handleCloseModalWindow} />
    </>
  )
}
