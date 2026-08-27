import type { Action, ThunkAction } from '@reduxjs/toolkit'

import { UseFormReset } from 'react-hook-form'

import { ProfileDto } from '@/entities/profile'
import {
  EditProfileFormValues,
  initializeFormFromProfileData,
  resetFormState,
  setInitialized,
} from '@/features/profile/edit-profile'
import { OptionType } from '@/shared/api/location'

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, unknown, unknown, Action>

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
