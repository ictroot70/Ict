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
import { ScrollAreaRadix, Separator } from '@/shared/ui'

import s from './GeneralSettings.module.scss'

const lang: 'en' | 'ru' = 'en'

export function GeneralSettings(): ReactElement {
  const dispatch = useAppDispatch()
  const hasInitializedDataRef = useRef(false)
  const {
    profile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    uploadAvatarState,
    deleteAvatarState,
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
  } = useEditProfileForm()

  const { data: rawCountries, isSuccess } = useGetCountriesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  })

  const transformedData = useMemo(() => {
    if (!rawCountries) {
      return null
    }

    const countries = buildCountriesOptions(rawCountries, lang)
    const citiesMap = buildCitiesMap(rawCountries, {})

    return { countries, citiesMap }
  }, [rawCountries])

  useEffect(() => {
    if (hasInitializedDataRef.current) {
      return
    }
    if (!isSuccess || !transformedData) {
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

  const citiesForCountry = useMemo(() => {
    if (!currentCountry) {
      return []
    }

    return citiesMap[currentCountry] || []
  }, [citiesMap, currentCountry])

  useEffect(() => {
    if (!profile) {
      return
    }
    if (!isDataLoaded) {
      return
    }
    if (isInitialized) {
      return
    }

    dispatch(initializeFormFromProfile(profile, countries, citiesMap, reset))
  }, [dispatch, profile, isDataLoaded, isInitialized, countries, citiesMap, reset])

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

  const submit = handleSubmit(handleSubmitProfile)
  const isAvatarLoading = uploadAvatarState.isLoading || deleteAvatarState.isLoading
  const avatar = profile?.avatars?.[0]?.url
  const isReady = profile && isDataLoaded && isInitialized

  return (
    <ScrollAreaRadix>
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
              initialDateOfBirth={profile?.dateOfBirth ? new Date(profile.dateOfBirth) : undefined}
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
    </ScrollAreaRadix>
  )
}
