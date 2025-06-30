'use client'

import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

import { ComponentPropsWithoutRef, ReactElement } from 'react'
import { Input } from '@/shared/ui'

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  id?: string
  label?: string
  error?: string
  placeholder?: string
  inputType: 'text' | 'hide-able' | 'search'
  disabled?: boolean
  required?: boolean
} // This type we use the pantry do not export its original, it is temporary!

type ControlledInputProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<InputProps, 'value' | 'onChange' | 'onBlur'>

export const ControlledInput = <T extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledInputProps<T>): ReactElement => {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name })

  return <Input {...field} {...rest} error={error?.message} />
}

ControlledInput.displayName = 'ControlledInput'
