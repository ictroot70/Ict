import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'

import { ROUTES } from '@/common/constants/routers'
import { checkRecoveryCode, newPassword } from '@/features/auth/api'
import { newPasswordSchema, CreateNewPasswordInputs } from '../../config/schemas'

export const useCreateNewPassword = () => {
  const { control, handleSubmit, reset } = useForm<CreateNewPasswordInputs>({
    defaultValues: { password: '', passwordConfirmation: '' },
    resolver: zodResolver(newPasswordSchema()),
    mode: 'onBlur',
  })

  const [isValidating, setIsValidating] = useState(true)
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)

  const router = useRouter()
  const params = useSearchParams()
  const urlCode = params?.get('code')
  const urlEmail = params?.get('email')

  useEffect(() => {
    const validateRecoveryCode = async () => {
      try {
        if (!urlCode || !urlEmail) {
          router.push(ROUTES.emailExpired)
          return
        }

        const response = await checkRecoveryCode({ recoveryCode: urlCode })

        if (response.ok) {
          setIsValidating(false)
        } else {
          router.push(`${ROUTES.emailExpired}?email=${urlEmail}`)
        }
      } catch (error) {
        router.push(ROUTES.emailExpired)
      }
    }

    validateRecoveryCode()
  }, [urlCode, urlEmail, router])

  const onSubmit = async ({ password }: CreateNewPasswordInputs) => {
    const response = await newPassword({ newPassword: password, recoveryCode: urlCode as string })
    if (response.ok) {
      setIsOpenModalWindow(true)
      reset()
    } else {
      // TODO: Handle error (show toast or setError)
    }
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    router.push(ROUTES.signIn)
  }

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isValidating,
    isOpenModalWindow,
    handleCloseModalWindow,
  }
}
