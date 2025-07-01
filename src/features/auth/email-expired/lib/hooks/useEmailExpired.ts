import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'

import { ROUTES } from '@/common/constants/routers'
import { EmailExpiredInputs, emailExpiredSchema } from '../../config/schemas'
import { passwordRecoveryResending } from '@/features/auth/api'

export const useEmailExpired = () => {
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const [currentEmail, setCurrentEmail] = useState('')

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
    const response = await passwordRecoveryResending({
      email,
      baseUrl: window.location.origin + ROUTES.createNewPassword,
    })

    if (response.ok) {
      setCurrentEmail(email)
      setIsOpenModalWindow(true)
    } else {
      // TODO: Handle error (show toast or setError)
    }
    reset()
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    setCurrentEmail('')
  }

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isValid,
    isOpenModalWindow,
    currentEmail,
    urlEmail,
    handleCloseModalWindow,
  }
}
