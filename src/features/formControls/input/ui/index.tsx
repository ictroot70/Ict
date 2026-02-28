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
  const { error: externalError, className: externalClassName, ...inputProps } = rest
  const {
    field,
    fieldState: { error, isDirty },
  } = useController({ control, name })
  const [isFocused, setIsFocused] = useState(false)
  const isPlaceholderLike = !isDirty && field.value && !isFocused
  const resolvedError = externalError ?? error?.message

  const handleFocus: FocusEventHandler<HTMLInputElement> = event => {
    setIsFocused(true)
    inputProps.onFocus?.(event)
  }

  const handleBlur: FocusEventHandler<HTMLInputElement> = () => {
    setIsFocused(false)
    field.onBlur()
  }

  const resolvedClassName = [externalClassName, isPlaceholderLike ? s.placeholderLike : '']
    .filter(Boolean)
    .join(' ')

  return (
    <Input
      {...field}
      {...inputProps}
      error={resolvedError}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={resolvedClassName}
    />
  )
}

ControlledInput.displayName = 'ControlledInput'
