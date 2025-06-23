'use client'
import * as React from 'react'
import { Button, Typography } from '@ictroot/ui-kit'
import Image from 'next/image'
import picture from '../assets/icons/rafiki.svg'
import s from './EmailExpired.module.scss'
import { ControlledInput } from '@/features/formControls/input/ui'
import { Form, useForm } from 'react-hook-form'

export const EmailExpired = () => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      email: '',
    },
  })

  return (
    <div className={s.wrapper}>
      <Typography asChild variant={'h1'} className={s.title}>
        <h2>Email verification link expired</h2>
      </Typography>

      <Typography variant={'regular_16'} className={s.description}>
        Looks like the verification link has expired. Not to worry, we can send the link again
      </Typography>

      <Form control={control} className={s.form}>
        <ControlledInput
          name={'email'}
          inputType={'text'}
          control={control}
          label={'Email'}
          placeholder={'Epam@epam.com'}
          className={s.input}
        />

        <Button className={s.button} type="submit">
          Resend verification link
        </Button>
      </Form>
      <Image src={picture} alt="Email verification link expired" className={s.image} />
    </div>
  )
}
