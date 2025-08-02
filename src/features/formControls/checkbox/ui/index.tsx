import { CheckboxProps, CheckboxRadix } from '@/shared/ui'
import { ReactElement } from 'react'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

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
