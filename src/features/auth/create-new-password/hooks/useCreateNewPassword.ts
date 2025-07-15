import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'

import { useCheckRecoveryCodeMutation, useNewPasswordMutation } from '@/features/auth/api/authApi'
import { useErrorToast } from '@/shared/lib/hooks'
import { CreateNewPasswordInputs, newPasswordSchema } from '../model/schemas/newPasswordSchema'
import { APP_ROUTES } from '@/shared/constant/app-routes'

export const useCreateNewPassword = () => {
  const [checkRecoveryCode] = useCheckRecoveryCodeMutation()
  const [newPassword] = useNewPasswordMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateNewPasswordInputs>({
    defaultValues: { password: '', passwordConfirmation: '' },
    resolver: zodResolver(newPasswordSchema()),
    mode: 'onBlur',
  })

  const [isValidating, setIsValidating] = useState(true)
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const { showErrorToast } = useErrorToast()

  const router = useRouter()
  const params = useSearchParams()
  const urlCode = params?.get('code')
  const urlEmail = params?.get('email')

  useEffect(() => {
    const validateRecoveryCode = async () => {
      if (!urlCode || !urlEmail) {
        router.push(APP_ROUTES.AUTH.LOGIN)
        return
      }
      try {
        await checkRecoveryCode({ recoveryCode: urlCode }).unwrap()
        localStorage.removeItem('access_token')
        setIsValidating(false)
      } catch {
        router.push(`${APP_ROUTES.AUTH.EMAIL_EXPIRED}?email=${urlEmail}`)
      }
    }

    validateRecoveryCode()
  }, [urlCode, urlEmail, router])

  const onSubmit = async ({ password }: CreateNewPasswordInputs) => {
    try {
      await newPassword({ newPassword: password, recoveryCode: urlCode as string }).unwrap()
      setIsOpenModalWindow(true)
      reset()
    } catch {
      showErrorToast({
        message: 'Password change failed. Please try again or request a new reset link.',
      })
    }
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    router.push(APP_ROUTES.AUTH.LOGIN)
  }

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isValidating,
    isSubmitting,
    isOpenModalWindow,
    handleCloseModalWindow,
  }
}
