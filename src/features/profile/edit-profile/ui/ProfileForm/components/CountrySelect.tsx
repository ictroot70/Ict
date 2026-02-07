import type { EditProfileFormValues } from '@/features/profile/edit-profile'

import { type Control, useController } from 'react-hook-form'

import { OptionType } from '@/shared/api'
import { Select, Typography } from '@/shared/ui'

import styles from '../ProfileForm.module.scss'

interface CountrySelectProps {
  control: Control<EditProfileFormValues>
  countries: OptionType[]
  onCountryChange?: (countryValue: string) => void
  disabled?: boolean
  placeholder?: string
}

export function CountrySelect({
  control,
  countries,
  onCountryChange,
  disabled,
  placeholder,
}: Readonly<CountrySelectProps>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name: 'country' })

  const handleCountryChange = (newCountryValue: string) => {
    onChange(newCountryValue)
    onBlur()
    onCountryChange?.(newCountryValue)
  }

  return (
    <div className={styles.countrySelectWrapper}>
      <Select
        items={countries}
        value={value || ''}
        onValueChange={handleCountryChange}
        label={'Select your country'}
        disabled={disabled}
        placeholder={placeholder}
      />
      {error && <Typography variant={'danger'}>{error.message}</Typography>}
    </div>
  )
}
