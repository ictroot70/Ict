import { UseFormReset, UseFormSetValue } from 'react-hook-form'

import { AppThunk } from '@/app/store'
import { ProfileDto } from '@/entities/profile'
import {
  EditProfileFormValues,
  initializeFormFromProfileData,
  resetFormState,
  setInitialized,
} from '@/features/profile/edit-profile'
import { OptionType } from '@/shared/api/location'

export const initializeFormFromProfile =
  (
    profile: ProfileDto,
    countries: OptionType[],
    citiesMap: Record<string, OptionType[]>,
    reset: UseFormReset<EditProfileFormValues>
  ): AppThunk =>
  dispatch => {
    if (!profile) {
      return
    }

    initializeFormFromProfileData({
      profile,
      countries,
      citiesMap,
      reset,
    })

    dispatch(setInitialized(true))
  }

export const resetFormOnProfileChange = (): AppThunk => dispatch => {
  dispatch(resetFormState())
}
