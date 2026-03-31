'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { SignUpFormData, signUpSchema, useSignupMutation } from '@/features/auth'
import { APP_ROUTES } from '@/shared/constant'
import { showToastAlert } from '@/shared/lib'
import { zodResolver } from '@hookform/resolvers/zod'

import { resolveSignUpError } from './resolveSignUpError'

type SignUpDraft = {
  agreement: boolean
  email: string
  password: string
  passwordConfirm: string
  username: string
}

const EMPTY_SIGN_UP_DRAFT: SignUpDraft = {
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreement: false,
}

let signUpDraft: SignUpDraft | null = null

const getSignUpDraft = (): SignUpDraft => signUpDraft ?? EMPTY_SIGN_UP_DRAFT
const setSignUpDraft = (draft: SignUpDraft) => {
  signUpDraft = draft
}
const clearSignUpDraft = () => {
  signUpDraft = null
}

export const useSignUp = () => {
  const [signup, { isLoading }] = useSignupMutation()

  const [serverError, setServerError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: getSignUpDraft(),
  })

  const isAgreementChecked = form.watch('agreement')

  useEffect(() => {
    const subscription = form.watch(values => {
      setSignUpDraft({
        username: values.username ?? '',
        email: values.email ?? '',
        password: values.password ?? '',
        passwordConfirm: values.passwordConfirm ?? '',
        agreement: values.agreement ?? false,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [form])

  const onSubmit = form.handleSubmit(async (data: SignUpFormData) => {
    setServerError('')
    try {
      const result = await signup({
        userName: data.username,
        email: data.email,
        password: data.password,
        baseUrl: window.location.origin + APP_ROUTES.AUTH.REGISTRATION_CONFIRM,
      }).unwrap()

      setIsSuccess(true)
      clearSignUpDraft()

      showToastAlert({
        message: result?.message || `We have sent a link to confirm your email to ${data.email}`,
        duration: 5000,
        type: 'success',
      })

      localStorage.setItem('lastRegistrationEmail', data.email)
    } catch (error: unknown) {
      const { fieldErrors, serverError: nextServerError, toastMessage } = resolveSignUpError(error)

      fieldErrors.forEach(fieldError => {
        form.setError(fieldError.field, {
          type: 'server',
          message: fieldError.message,
        })
      })

      setServerError(nextServerError)
      showToastAlert({
        message: toastMessage,
        duration: 5000,
        type: 'error',
      })
    }
  })

  return {
    form,
    onSubmit,
    isAgreementChecked,
    isLoading,
    serverError,
    isSuccess,
    setIsSuccess,
    clearDraft: clearSignUpDraft,
  }
}
