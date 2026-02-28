/* eslint-disable max-lines */
'use client'
import { ReactElement, useCallback, useEffect, useMemo, useRef } from 'react'
import { useWatch } from 'react-hook-form'

import { AvatarSkeleton, AvatarUpload } from '@/features/profile/avatar-upload'
import {
  ProfileForm,
  ProfileFormSkeleton,
  EditProfileFormValues,
  initializeFormFromProfile,
  resetFormState,
  selectCitiesMap,
  selectCountries,
  selectIsDataLoaded,
  selectIsInitialized,
  selectIsSubmittingProfile,
  setCountriesData,
  submitProfileUpdateThunk,
  syncLocationFields,
  useEditProfileForm,
  useProfileManagement,
} from '@/features/profile/edit-profile'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useGetCountriesQuery } from '@/shared/api'
import { Loading } from '@/shared/composites'
import { buildCitiesMap, buildCountriesOptions } from '@/shared/lib'
import { Button, ScrollAreaRadix, Separator, Typography } from '@/shared/ui'

import s from './GeneralSettings.module.scss'

type StoredProfileDraft = Omit<EditProfileFormValues, 'date_of_birth'> & { date_of_birth?: string }

const lang: 'en' | 'ru' = 'en'
const PROFILE_DRAFT_KEY = 'profile-settings-general-draft'
const isTooYoung = (date: Date): boolean => {
  const today = new Date()
  const age =
    today.getFullYear() -
    date.getFullYear() -
    (today < new Date(today.getFullYear(), date.getMonth(), date.getDate()) ? 1 : 0)

  return age < 13
}
const normalizeDateToLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())
const formatDateForDraft = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
const parseDateFromDraft = (value?: string): Date | undefined => {
  if (!value) {
    return undefined
  }

  const normalizedValue = value.split('T')[0]
  const [year, month, day] = normalizedValue.split('-').map(Number)

  if (year && month && day) {
    const parsedDate = new Date(year, month - 1, day)

    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
  }

  const fallback = new Date(value)

  if (Number.isNaN(fallback.getTime())) {
    return undefined
  }

  return normalizeDateToLocalDay(fallback)
}

export function GeneralSettings(): ReactElement {
  const dispatch = useAppDispatch()
  const hasInitializedDataRef = useRef(false)
  const {
    profile,
    isProfileLoading,
    isProfileFetching,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    uploadAvatarState,
    deleteAvatarState,
    profileError,
    refetchProfile,
  } = useProfileManagement()
  const {
    handleSubmit,
    control,
    errors,
    reset,
    isDirty,
    isValid,
    dirtyFields,
    setValue,
    getValues,
    setError,
    clearErrors,
  } = useEditProfileForm()
  const {
    data: rawCountries,
    isSuccess,
    isError: isCountriesError,
    isLoading: isCountriesLoading,
    isFetching: isCountriesFetching,
    refetch: refetchCountries,
  } = useGetCountriesQuery(undefined, { refetchOnMountOrArgChange: true })
  const transformedData = useMemo(
    () =>
      rawCountries
        ? {
            countries: buildCountriesOptions(rawCountries, lang),
            citiesMap: buildCitiesMap(rawCountries, {}),
          }
        : null,
    [rawCountries]
  )

  useEffect(() => {
    if (hasInitializedDataRef.current || !isSuccess || !transformedData) {
      return
    }

    hasInitializedDataRef.current = true
    dispatch(setCountriesData(transformedData))
  }, [dispatch, isSuccess, transformedData])

  const countries = useAppSelector(selectCountries)
  const citiesMap = useAppSelector(selectCitiesMap)
  const isDataLoaded = useAppSelector(selectIsDataLoaded)
  const isInitialized = useAppSelector(selectIsInitialized)
  const isSubmittingProfile = useAppSelector(selectIsSubmittingProfile)
  const currentCountry = useWatch({ control, name: 'country' }) as string | undefined

  const citiesForCountry = useMemo(
    () => (currentCountry ? citiesMap[currentCountry] || [] : []),
    [citiesMap, currentCountry]
  )
  const persistDraft = useCallback((values: EditProfileFormValues) => {
    if (typeof window === 'undefined') {
      return
    }

    const dateOfBirth =
      values.date_of_birth instanceof Date && !Number.isNaN(values.date_of_birth.getTime())
        ? formatDateForDraft(normalizeDateToLocalDay(values.date_of_birth))
        : undefined

    sessionStorage.setItem(
      PROFILE_DRAFT_KEY,
      JSON.stringify({
        ...values,
        date_of_birth: dateOfBirth,
      })
    )
  }, [])

  useEffect(() => {
    if (!profile || !isDataLoaded || isInitialized) {
      return
    }

    dispatch(initializeFormFromProfile(profile, countries, citiesMap, reset))
    const profileDefaultValues = getValues() as EditProfileFormValues

    if (typeof window === 'undefined') {
      return
    }

    const rawDraft = sessionStorage.getItem(PROFILE_DRAFT_KEY)

    if (!rawDraft) {
      return
    }

    let draft: StoredProfileDraft | null = null

    try {
      draft = JSON.parse(rawDraft) as StoredProfileDraft
    } catch {
      draft = null
    }

    if (!draft) {
      sessionStorage.removeItem(PROFILE_DRAFT_KEY)

      return
    }

    const restoredDate = parseDateFromDraft(draft.date_of_birth)

    reset({ ...draft, date_of_birth: restoredDate })
    reset(profileDefaultValues, { keepValues: true })

    if (restoredDate && !Number.isNaN(restoredDate.getTime()) && isTooYoung(restoredDate)) {
      setError('date_of_birth', { type: 'manual', message: 'too_young' })
    } else {
      clearErrors('date_of_birth')
    }

    setTimeout(() => {
      sessionStorage.removeItem(PROFILE_DRAFT_KEY)
    }, 0)
  }, [
    dispatch,
    profile,
    isDataLoaded,
    isInitialized,
    countries,
    citiesMap,
    reset,
    getValues,
    setError,
    clearErrors,
  ])

  useEffect(() => {
    return () => {
      dispatch(resetFormState())
    }
  }, [dispatch])

  const handleSubmitProfile = useCallback(
    async (data: EditProfileFormValues) => {
      await dispatch(
        submitProfileUpdateThunk(
          data,
          dirtyFields as Record<string, boolean>,
          citiesMap,
          updateProfile,
          reset
        )
      )
    },
    [dispatch, citiesMap, dirtyFields, reset, updateProfile]
  )
  const handleCountryChange = useCallback(
    (newCountry: string) => {
      syncLocationFields({
        country: newCountry,
        currentCity: getValues('city'),
        citiesMap,
        countries: countries,
        setValue,
        mode: 'manual',
        lang,
      })
    },
    [citiesMap, countries, setValue, getValues]
  )

  const handleBeforePrivacyNavigate = useCallback(
    () => persistDraft(getValues() as EditProfileFormValues),
    [getValues, persistDraft]
  )
  const hasLoadError =
    Boolean(profileError) ||
    isCountriesError ||
    (!profile && !isProfileLoading && !isProfileFetching) ||
    (!rawCountries && !isCountriesLoading && !isCountriesFetching)

  if (hasLoadError) {
    return (
      <ScrollAreaRadix>
        <div className={s.errorState}>
          <Typography variant={'h3'}>Failed to load profile settings</Typography>
          <Typography variant={'regular_14'}>Please try again.</Typography>
          <Button
            onClick={() => {
              void refetchProfile()
              void refetchCountries()
            }}
          >
            Retry
          </Button>
        </div>
      </ScrollAreaRadix>
    )
  }

  const submit = handleSubmit(handleSubmitProfile)
  const isAvatarLoading = uploadAvatarState.isLoading || deleteAvatarState.isLoading
  const avatar = profile?.avatars?.[0]?.url
  const isReady = profile && isDataLoaded && isInitialized

  return (
    <div className={s.wrapper}>
      <div className={s.container}>
        {!isReady && (
          <>
            <AvatarSkeleton />
            <ProfileFormSkeleton />
          </>
        )}
        {isReady && (
          <>
            <AvatarUpload
              value={profile.avatars?.[0]?.url || avatar}
              onUpload={uploadAvatar}
              onDelete={removeAvatar}
              isLoading={isAvatarLoading}
            />
            <ProfileForm
              control={control}
              currentCountry={currentCountry}
              optionsMap={{
                country: countries,
                city: citiesForCountry,
              }}
              citiesMap={citiesMap}
              setValue={setValue}
              handleCountryChange={handleCountryChange}
              isSubmitting={isSubmittingProfile}
              submit={submit}
              isDirty={isDirty}
              isValid={isValid}
              errors={errors}
              profileId={profile?.id}
              lang={lang}
              onBeforePrivacyNavigate={handleBeforePrivacyNavigate}
            />
          </>
        )}

        {isSubmittingProfile && (
          <div className={s.overlay}>
            <Loading />
          </div>
        )}
      </div>
      <div className={s.separatorContainer}>
        <Separator />
      </div>
    </div>
  )
}
