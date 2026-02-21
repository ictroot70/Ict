import { Control, FieldValues, Path, useController } from 'react-hook-form'

import { DatePickerSingle, DatePickerSingleProps } from '@/shared/ui'

type ControlledDatePickerSingleProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  initialValue?: Date
} & Omit<DatePickerSingleProps, 'value' | 'onDateChange'>

export function ControlledDatePickerSingle<T extends FieldValues>({
  control,
  name,
  initialValue,
  ...rest
}: ControlledDatePickerSingleProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name })

  const resolvedError = error?.message

  const handleDateChange = (date: Date | undefined) => {
    if (date === undefined) {
      if (initialValue !== undefined) {
        onChange(initialValue)
      }

      return
    }
    onChange(date)
  }

  return (
    <DatePickerSingle
      value={value}
      onDateChange={handleDateChange}
      error={resolvedError}
      {...rest}
    />
  )
}
