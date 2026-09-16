'use client'

import { ComponentPropsWithoutRef, ReactElement } from 'react'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

import { TextArea } from '@/shared/ui'

interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  id?: string
  label?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

type ControlledTextareaProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<TextareaProps, 'value' | 'onChange' | 'onBlur'>

export const ControlledTextarea = <T extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledTextareaProps<T>): ReactElement => {
  const {
    field,
    fieldState: { error, isTouched },
  } = useController({ control, name })
  const showError = Boolean(error && isTouched)

  return <TextArea {...field} {...rest} error={showError ? error?.message : undefined} />
}

ControlledTextarea.displayName = 'ControlledTextarea'
