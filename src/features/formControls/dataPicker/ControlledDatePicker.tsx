import { useEffect, useRef, useState } from 'react'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

import { DatePickerSingle, DatePickerSingleProps } from '@/shared/ui'

type ControlledDatePickerSingleProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  useFieldErrorFallback?: boolean
} & Omit<DatePickerSingleProps, 'value' | 'onDateChange'>

const normalizeDateToLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const MIN_AGE = 13
const isDateValue = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime())
const isAtLeast13 = (date: Date): boolean => {
  const today = new Date()
  const age =
    today.getFullYear() -
    date.getFullYear() -
    (today < new Date(today.getFullYear(), date.getMonth(), date.getDate()) ? 1 : 0)

  return age >= MIN_AGE
}

export function ControlledDatePickerSingle<T extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledDatePickerSingleProps<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ control, name })
  const lastValidDateRef = useRef<Date | undefined>(undefined)
  // TODO(ui-kit): remove remount workaround after DatePickerSingle stops switching
  // between controlled/uncontrolled mode when value becomes undefined.
  const [remountKey, setRemountKey] = useState(0)

  const resolvedError = error?.message
  const { error: externalError, useFieldErrorFallback = true, ...restProps } = rest
  const datePickerError = useFieldErrorFallback ? (externalError ?? resolvedError) : externalError
  const currentDate = isDateValue(value) ? normalizeDateToLocalDay(value) : undefined
  const currentDateTimestamp = currentDate?.getTime()

  useEffect(() => {
    if (currentDateTimestamp === undefined) {
      lastValidDateRef.current = undefined

      return
    }

    const normalizedCurrentDate = new Date(currentDateTimestamp)

    if (isAtLeast13(normalizedCurrentDate)) {
      lastValidDateRef.current = normalizedCurrentDate
    }
  }, [currentDateTimestamp])

  const handleDateChange = (date: Date | undefined) => {
    const normalizedNextDate = date ? normalizeDateToLocalDay(date) : undefined

    if (!normalizedNextDate) {
      if (currentDate && !isAtLeast13(currentDate)) {
        const restoredDate = lastValidDateRef.current

        if (restoredDate) {
          onChange(new Date(restoredDate.getTime()))
        } else {
          setRemountKey(prev => prev + 1)
          onChange(undefined)
        }

        return
      }

      setRemountKey(prev => prev + 1)
      onChange(undefined)

      return
    }

    onChange(normalizedNextDate)
  }

  return (
    <DatePickerSingle
      key={remountKey}
      value={value}
      onDateChange={handleDateChange}
      error={datePickerError}
      {...restProps}
    />
  )
}
