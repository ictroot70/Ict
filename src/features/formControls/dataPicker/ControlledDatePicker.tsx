import { Control, FieldValues, Path, useController } from 'react-hook-form'

import { DatePickerSingle, DatePickerSingleProps } from '@/shared/ui'

type ControlledDatePickerSingleProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
} & Omit<DatePickerSingleProps, 'value' | 'onDateChange'>

export function ControlledDatePickerSingle<T extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledDatePickerSingleProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name })

  const resolvedError = error?.message

  return <DatePickerSingle value={value} onDateChange={onChange} error={resolvedError} {...rest} />
}
