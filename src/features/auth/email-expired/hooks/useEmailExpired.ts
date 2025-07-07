import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'

import { ROUTES } from '@/shared/constant/routes'
import { EmailExpiredInputs, emailExpiredSchema } from '../model/schemas/emailExpiredSchema'
import { usePasswordRecoveryResendingMutation } from '@/features/auth/api/authApi'
import { useErrorToast } from '@/shared/lib/hooks'

export const useEmailExpired = () => {
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const [currentEmail, setCurrentEmail] = useState('')
  const [passwordRecoveryResending] = usePasswordRecoveryResendingMutation()
  const { showErrorToast } = useErrorToast()

  const params = useSearchParams()
  const urlEmail = params?.get('email')

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<EmailExpiredInputs>({
    resolver: zodResolver(emailExpiredSchema),
    defaultValues: {
      email: urlEmail || '',
    },
    mode: 'onBlur',
  })

  const onSubmit = async ({ email }: EmailExpiredInputs) => {
    try {
      await passwordRecoveryResending({
        email,
        baseUrl: window.location.origin + ROUTES.AUTH.NEW_PASSWORD,
      }).unwrap()
      setCurrentEmail(email)
      setIsOpenModalWindow(true)
      reset()
    } catch {
      showErrorToast()
    }
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    setCurrentEmail('')
  }

  const submitHandler = handleSubmit(onSubmit)

  return {
    control,
    handleSubmit: submitHandler,
    isValid,
    isOpenModalWindow,
    currentEmail,
    urlEmail,
    handleCloseModalWindow,
  }
}
