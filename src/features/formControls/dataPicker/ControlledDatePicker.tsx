import { Control, FieldValues, Path, useController } from 'react-hook-form'

import { DatePickerSingle, DatePickerSingleProps } from '@/shared/ui'

type ControlledDatePickerSingleProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
} & Omit<DatePickerSingleProps, 'value' | 'onDateChange'>

const normalizeDateToLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

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
  const { error: externalError, ...restProps } = rest

  const handleDateChange = (date: Date | undefined) => {
    onChange(date ? normalizeDateToLocalDay(date) : undefined)
  }

  return (
    <DatePickerSingle
      value={value}
      onDateChange={handleDateChange}
      error={externalError ?? resolvedError}
      {...restProps}
    />
  )
}
