import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import { CheckboxProps, CheckboxRadix } from '@/shared'
import { ReactElement } from 'react'

type ControlledCheckboxProps<T extends FieldValues> = UseControllerProps<T> &
  Omit<CheckboxProps, 'onChange' | 'checked' | 'id'>

export const ControlledCheckbox = <T extends FieldValues>({
  name,
  control,
  ...restProps
}: ControlledCheckboxProps<T>): ReactElement => {
  const {
    field: { value, onChange, ...field },
    fieldState: { error },
  } = useController({
    name,
    control,
  })

  return (
    <CheckboxRadix
      {...restProps}
      errorMessage={error?.message}
      checked={!!value}
      onCheckedChange={onChange}
      {...field}
    />
  )
}
