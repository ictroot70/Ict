'use client'

import { FocusEventHandler, ReactElement, useState } from 'react'
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
    fieldState: { error, isDirty },
  } = useController({ control, name })
  const [isFocused, setIsFocused] = useState(false)
  const isPlaceholderLike = !isDirty && field.value && !isFocused
  const showError = Boolean(error)

  const handleFocus: FocusEventHandler<HTMLInputElement> = event => {
    setIsFocused(true)
    rest.onFocus?.(event)
  }

  const handleBlur: FocusEventHandler<HTMLInputElement> = () => {
    setIsFocused(false)
    field.onBlur()
  }

  return (
    <Input
      {...field}
      {...rest}
      error={showError ? error?.message : undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={isPlaceholderLike ? s.placeholderLike : ''}
    />
  )
}

ControlledInput.displayName = 'ControlledInput'
