import type { ChangeEvent } from 'react'
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form'

import {
  ControlledDatePickerSingle,
  ControlledInput,
  ControlledSelect,
  ControlledTextarea,
} from '@/features/formControls'
import { AgePolicyError } from '@/features/legal'
import { useDetectLocation } from '@/features/profile/edit-profile'
import { EditProfileFormValues } from '@/features/profile/edit-profile/lib'
import { OptionType } from '@/shared/api/location'
import { Button, Pin, Typography } from '@/shared/ui'

import styles from './ProfileForm.module.scss'

import { CountrySelect } from './components/CountrySelect'

interface InputFieldsProps {
  submit: () => void
  control: Control<EditProfileFormValues>
  errors: FieldErrors<EditProfileFormValues>
  handleCountryChange: (newCountry: string) => void
  currentCountry: string | undefined
  optionsMap: {
    country: OptionType[]
    city: OptionType[]
  }
  citiesMap: Record<string, OptionType[]>
  setValue: UseFormSetValue<EditProfileFormValues>
  isSubmitting?: boolean
  isDirty: boolean
  isValid: boolean
  profileId: number | undefined
  lang: 'en' | 'ru'
  initialDateOfBirth?: Date
}

export const ProfileForm = ({
  control,
  errors,
  handleCountryChange,
  optionsMap,
  citiesMap,
  currentCountry,
  setValue,
  isSubmitting = false,
  submit,
  isDirty,
  isValid,
  profileId,
  lang = 'en',
  initialDateOfBirth,
}: InputFieldsProps) => {
  const { detectLocation, buttonText, isDetecting } = useDetectLocation({
    setValue,
    countries: optionsMap.country,
    citiesMap,
    lang,
  })

  const isRu = lang === 'ru'

  let countryPlaceholder: string

  if (optionsMap.country.length === 0) {
    countryPlaceholder = 'Loading countries...'
  } else {
    countryPlaceholder = isRu ? 'Выберите страну' : 'Choose country'
  }

  let cityPlaceholder: string

  if (!currentCountry) {
    cityPlaceholder = isRu ? 'Сначала выберите страну' : 'Select country first'
  } else {
    cityPlaceholder = isRu ? 'Выберите город' : 'Choose city'
  }

  const isCountryLoading = optionsMap.country.length === 0

  const dobErrorCode = errors?.date_of_birth?.message
  const isTooYoung = dobErrorCode === 'too_young'
  const datePickerErrorText = isTooYoung ? <AgePolicyError profileId={profileId} /> : dobErrorCode

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete={'on'}>
      <div className={styles.container}>
        <ControlledInput
          control={control}
          name={'userName'}
          label={'Username'}
          error={errors?.userName?.message}
          required
        />

        <ControlledInput
          control={control}
          name={'firstName'}
          label={'First name'}
          error={errors?.firstName?.message}
          required
        />

        <ControlledInput
          control={control}
          name={'lastName'}
          label={'Last name'}
          error={errors?.lastName?.message}
          required
        />
      </div>

      <div className={styles.dateOfBirth}>
        <ControlledDatePickerSingle
          control={control}
          calendarProps={{
            captionLayout: 'dropdown',
          }}
          name={'date_of_birth'}
          label={'Date of birth'}
          error={datePickerErrorText as string}
          initialValue={initialDateOfBirth}
        />
      </div>

      <div className={styles.location}>
        <CountrySelect
          control={control}
          countries={optionsMap.country}
          onCountryChange={handleCountryChange}
          disabled={!optionsMap.country.length}
          placeholder={countryPlaceholder}
        />

        <ControlledSelect
          control={control}
          name={'city'}
          items={optionsMap.city || []}
          label={lang === 'ru' ? 'Ваш город' : 'Select your city'}
          disabled={!optionsMap.city.length || !currentCountry}
          placeholder={cityPlaceholder}
        />
      </div>

      <div className={styles.location_myPosition}>
        <Typography variant={'small_text'}>Or you can use your</Typography>

        <Typography variant={'small_text'}>
          <button
            className={styles.location_myPosition_button}
            type={'button'}
            onClick={detectLocation}
            disabled={isDetecting || isCountryLoading}
            aria-label={'Detect location'}
          >
            {buttonText} <Pin size={20} />
          </button>
        </Typography>
      </div>

      <div className={styles.aboutMe}>
        <ControlledTextarea
          control={control}
          name={'aboutMe'}
          label={'About me'}
          placeholder={'You can write about yourself here'}
          error={errors?.aboutMe?.message}
          maxLength={200}
        />
      </div>

      <div className={styles.saveButton}>
        <Button disabled={!isDirty || !isValid || isSubmitting} variant={'primary'} type={'submit'}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
