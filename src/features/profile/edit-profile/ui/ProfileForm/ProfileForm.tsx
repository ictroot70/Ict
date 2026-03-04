import { type ChangeEvent, useEffect, useState } from 'react'
import { Control, FieldErrors, UseFormSetValue, useFormState, useWatch } from 'react-hook-form'

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
  isLocationTemporarilyUnavailable?: boolean
  onBeforePrivacyNavigate?: () => void
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
  isLocationTemporarilyUnavailable = false,
  onBeforePrivacyNavigate,
}: InputFieldsProps) => {
  const { detectLocation, buttonText, isDetecting } = useDetectLocation({
    setValue,
    countries: optionsMap.country,
    citiesMap,
    lang,
  })

  const isRu = lang === 'ru'
  const locationUnavailableText = isRu
    ? 'Геолокация временно недоступна'
    : 'Location is temporarily unavailable'

  let countryPlaceholder: string

  if (optionsMap.country.length === 0) {
    countryPlaceholder = isLocationTemporarilyUnavailable
      ? locationUnavailableText
      : 'Loading countries...'
  } else {
    countryPlaceholder = isRu ? 'Выберите страну' : 'Choose country'
  }

  let cityPlaceholder: string

  if (isLocationTemporarilyUnavailable) {
    cityPlaceholder = locationUnavailableText
  } else if (!currentCountry) {
    cityPlaceholder = isRu ? 'Сначала выберите страну' : 'Select country first'
  } else {
    cityPlaceholder = isRu ? 'Выберите город' : 'Choose city'
  }

  const isCountryLoading = optionsMap.country.length === 0 && !isLocationTemporarilyUnavailable
  const detectLocationLabel = isLocationTemporarilyUnavailable
    ? locationUnavailableText
    : buttonText

  const dobErrorCode = errors?.date_of_birth?.message
  const isTooYoung = dobErrorCode === 'too_young'
  const datePickerErrorText = isTooYoung ? undefined : dobErrorCode
  const datePickerError = isTooYoung ? true : datePickerErrorText
  const hasDateOfBirthError = isTooYoung || Boolean(datePickerErrorText)
  const userNameValue = useWatch({ control, name: 'userName' })
  const firstNameValue = useWatch({ control, name: 'firstName' })
  const lastNameValue = useWatch({ control, name: 'lastName' })
  const { touchedFields, submitCount, dirtyFields } = useFormState({ control })
  const userNameError = typeof errors?.userName?.message === 'string' ? errors.userName.message : ''
  const firstNameError =
    typeof errors?.firstName?.message === 'string' ? errors.firstName.message : ''
  const lastNameError = typeof errors?.lastName?.message === 'string' ? errors.lastName.message : ''
  const isUserNameMissing = !userNameValue?.trim()
  const isFirstNameMissing = !firstNameValue?.trim()
  const isLastNameMissing = !lastNameValue?.trim()
  const hasMissingRequiredFields = isUserNameMissing || isFirstNameMissing || isLastNameMissing
  const hasAnyFormErrors = Object.keys(errors).length > 0
  const hasCompletedInteraction = Boolean(
    touchedFields.userName ||
      touchedFields.firstName ||
      touchedFields.lastName ||
      dirtyFields.date_of_birth ||
      dirtyFields.country ||
      dirtyFields.city ||
      touchedFields.aboutMe ||
      dirtyFields.detectLocation
  )
  const shouldQueueRequiredFieldsHint =
    !isSubmitting && isDirty && hasMissingRequiredFields && !isValid && !hasAnyFormErrors
  const [showRequiredFieldsHint, setShowRequiredFieldsHint] = useState(false)

  useEffect(() => {
    if (!shouldQueueRequiredFieldsHint || !hasCompletedInteraction) {
      setShowRequiredFieldsHint(false)

      return
    }

    const timerId = window.setTimeout(() => {
      setShowRequiredFieldsHint(true)
    }, 350)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [shouldQueueRequiredFieldsHint, hasCompletedInteraction])

  const shouldShowMissingError = (isMissing: boolean, isTouched?: boolean): boolean =>
    isMissing && (Boolean(isTouched) || submitCount > 0)

  const userNameDisplayError =
    userNameError ||
    (shouldShowMissingError(isUserNameMissing, touchedFields.userName) ? 'Required' : undefined)
  const firstNameDisplayError =
    firstNameError ||
    (shouldShowMissingError(isFirstNameMissing, touchedFields.firstName) ? 'Required' : undefined)
  const lastNameDisplayError =
    lastNameError ||
    (shouldShowMissingError(isLastNameMissing, touchedFields.lastName) ? 'Required' : undefined)
  const cityError = typeof errors?.city?.message === 'string' ? errors.city.message : undefined
  const aboutMeError =
    typeof errors?.aboutMe?.message === 'string' ? errors.aboutMe.message : undefined
  const hasUserNameError = Boolean(userNameDisplayError)
  const hasFirstNameError = Boolean(firstNameDisplayError)
  const hasLastNameError = Boolean(lastNameDisplayError)
  const hasCityError = Boolean(cityError)
  const hasAboutMeError = Boolean(aboutMeError && touchedFields.aboutMe)
  const shouldShowMissingHint = (isMissing: boolean, isTouched?: boolean): boolean =>
    showRequiredFieldsHint && isMissing && !isTouched
  const userNameHintClassName = shouldShowMissingHint(isUserNameMissing, touchedFields.userName)
    ? styles.requiredHint
    : undefined
  const firstNameHintClassName = shouldShowMissingHint(isFirstNameMissing, touchedFields.firstName)
    ? styles.requiredHint
    : undefined
  const lastNameHintClassName = shouldShowMissingHint(isLastNameMissing, touchedFields.lastName)
    ? styles.requiredHint
    : undefined
  const userNameClassName = hasUserNameError ? styles.fieldTextError : userNameHintClassName
  const firstNameClassName = hasFirstNameError ? styles.fieldTextError : firstNameHintClassName
  const lastNameClassName = hasLastNameError ? styles.fieldTextError : lastNameHintClassName

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit()
  }

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete={'on'}>
      <div className={styles.container}>
        <div
          className={`${styles.inputField} ${hasUserNameError ? styles.inputFieldWithError : ''}`}
        >
          <ControlledInput
            control={control}
            name={'userName'}
            label={'Username'}
            error={userNameDisplayError}
            className={userNameClassName || undefined}
            required
          />
        </div>
        <div
          className={`${styles.inputField} ${hasFirstNameError ? styles.inputFieldWithError : ''}`}
        >
          <ControlledInput
            control={control}
            name={'firstName'}
            label={'First name'}
            error={firstNameDisplayError}
            className={firstNameClassName || undefined}
            required
          />
        </div>
        <div
          className={`${styles.inputField} ${hasLastNameError ? styles.inputFieldWithError : ''}`}
        >
          <ControlledInput
            control={control}
            name={'lastName'}
            label={'Last name'}
            error={lastNameDisplayError}
            className={lastNameClassName || undefined}
            required
          />
        </div>
      </div>
      <div
        className={`${styles.dateOfBirth} ${hasDateOfBirthError ? styles.dateOfBirthWithError : ''}`}
      >
        <ControlledDatePickerSingle
          control={control}
          calendarProps={{
            captionLayout: 'dropdown',
          }}
          name={'date_of_birth'}
          label={'Date of birth'}
          error={datePickerError}
          useFieldErrorFallback={!isTooYoung}
        />
        {isTooYoung && (
          <AgePolicyError profileId={profileId} onNavigate={onBeforePrivacyNavigate} />
        )}
      </div>
      <div className={`${styles.location} ${hasCityError ? styles.locationWithError : ''}`}>
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
          classNames={hasCityError ? { trigger: styles.selectTriggerError } : undefined}
        />
      </div>
      <div className={styles.location_myPosition}>
        <Typography variant={'small_text'}>Or you can use your</Typography>
        <Typography variant={'small_text'}>
          <button
            className={styles.location_myPosition_button}
            type={'button'}
            onClick={detectLocation}
            disabled={isDetecting || isCountryLoading || isLocationTemporarilyUnavailable}
            aria-label={'Detect location'}
          >
            {detectLocationLabel} <Pin size={20} />
          </button>
        </Typography>
      </div>
      <div className={`${styles.aboutMe} ${hasAboutMeError ? styles.aboutMeWithError : ''}`}>
        <ControlledTextarea
          control={control}
          name={'aboutMe'}
          label={'About me'}
          placeholder={'You can write about yourself here'}
          error={aboutMeError}
          maxLength={200}
          className={hasAboutMeError ? styles.fieldTextError : undefined}
        />
      </div>

      <div className={styles.saveButton}>
        <Button disabled={!isDirty || !isValid || isSubmitting} variant={'primary'} type={'submit'}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
        {showRequiredFieldsHint && (
          <Typography variant={'small_text'} className={styles.infoHint}>
            Fill in required fields above to save changes.
          </Typography>
        )}
      </div>
    </form>
  )
}
