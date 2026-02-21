'use client'

import { ReactElement, useState } from 'react'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

import { Input, type InputProps } from '@/shared/ui'

import s from './style.module.scss'

type ControlledInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<InputProps, 'value' | 'onChange' | 'onBlur'>

export const ControlledInput = <T extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledInputProps<T>): ReactElement => {
  const {
    field,
    fieldState: { error, isDirty, isTouched },
  } = useController({ control, name })
  const [isFocused, setIsFocused] = useState(false)
  const isPlaceholderLike = !isDirty && field.value && !isFocused
  const showError = Boolean(error)

  return (
    <Input
      {...field}
      {...rest}
      error={showError ? error?.message : undefined}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={isPlaceholderLike ? s.placeholderLike : ''}
    />
  )
}

ControlledInput.displayName = 'ControlledInput'
