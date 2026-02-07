'use client'

import { ReactElement } from 'react'
import { useController, UseControllerProps, FieldValues } from 'react-hook-form'

import { OptionType } from '@/shared/api'
import { Select, type SelectProps, Typography } from '@/shared/ui'

type ControlledSelectProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<SelectProps, 'value' | 'onValueChange' | 'items'>

export const ControlledSelect = <T extends FieldValues>({
  control,
  name,
  items = [],
  ...props
}: ControlledSelectProps<T> & { items: OptionType[] }): ReactElement => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name })

  return (
    <div style={{ width: '100%' }}>
      <Select
        {...props}
        items={items}
        value={value ?? ''}
        onValueChange={val => {
          onChange(val)
          onBlur()
        }}
      />
      {error && <Typography variant={'danger'}>{error.message}</Typography>}
    </div>
  )
}
