import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { EmailExpiredInputs, emailExpiredSchema } from '@/features/auth'
import { zodResolver } from '@hookform/resolvers/zod'

export const useBaseEmailResend = (defaultEmail = '') => {
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const [currentEmail, setCurrentEmail] = useState('')

  const formMethods = useForm<EmailExpiredInputs>({
    resolver: zodResolver(emailExpiredSchema),
    defaultValues: { email: defaultEmail },
    mode: 'onBlur',
  })

  const handleSuccess = (email: string) => {
    setCurrentEmail(email)
    setIsOpenModalWindow(true)
    formMethods.reset()
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    setCurrentEmail('')
  }

  return {
    ...formMethods,
    isOpenModalWindow,
    currentEmail,
    handleSuccess,
    handleCloseModalWindow,
  }
}
