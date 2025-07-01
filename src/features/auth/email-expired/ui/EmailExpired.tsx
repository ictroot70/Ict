'use client'

import s from './EmailExpired.module.scss'
import Image from 'next/image'

import { Typography, Button } from '@/shared'
import ModalEmailSent from '@/common/components/ModalEmailSent/ModalEmailSent'

import picture from '../assets/icons/rafiki.svg'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ControlledInput } from '@/features/formControls/input/ui'

import { ROUTES } from '@/common/constants/routers'
import { emailExpiredSchema } from '../config/schemas'
import { passwordRecoveryResending } from '../../api'

type Inputs = z.infer<typeof emailExpiredSchema>

export const EmailExpired = () => {
  const [isOpenModalWindow, setIsOpenModalWindow] = useState(false)
  const [currentEmail, setCurrentEmail] = useState('')

  const params = useSearchParams()
  const urlEmail = params?.get('email')

  const { control, reset, handleSubmit } = useForm<Inputs>({
    resolver: zodResolver(emailExpiredSchema),
    defaultValues: {
      email: urlEmail || '',
    },
  })

  const onSubmit = async ({ email }: Inputs) => {
    const response = await passwordRecoveryResending({
      email,
      baseUrl: window.location.origin + ROUTES.createNewPassword,
    })

    if (response.ok) {
      setCurrentEmail(email)
      setIsOpenModalWindow(true)
    } else {
      /* TODO: Alert с сообщением и(или) router */
    }
    reset()
  }

  const handleCloseModalWindow = () => {
    setIsOpenModalWindow(false)
    setCurrentEmail('')
  }

  return (
    <>
      <div className={s.wrapper}>
        <div className={s.content}>
          <Typography asChild variant={'h1'} className={s.title}>
            <h2>Email verification link expired</h2>
          </Typography>

          <Typography variant={'regular_16'} className={s.description}>
            Looks like the verification link has expired. Not to worry, we can send the link again
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
            {!urlEmail && (
              <ControlledInput
                control={control}
                name="email"
                inputType="text"
                label="Email"
                placeholder="Enter your email"
              />
            )}

            {urlEmail && <input type="hidden" {...control.register('email')} />}

            <Button className={s.button} type="submit" fullWidth>
              {urlEmail ? 'Resend link' : 'Resend verification link'}
            </Button>
          </form>
        </div>
        <Image src={picture} alt="Email verification link expired" className={s.image} />
      </div>
      <ModalEmailSent
        email={currentEmail}
        isOpen={isOpenModalWindow}
        onClose={handleCloseModalWindow}
      />
    </>
  )
}
