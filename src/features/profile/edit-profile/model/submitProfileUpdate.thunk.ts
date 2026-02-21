import type { EditProfileFormValues } from '../lib/editProfileFormValues'
import type { ProfileUpdate } from '@/entities/profile/model/domain/types'
import type { OptionType } from '@/shared/api/location'
import type { Action, ThunkAction } from '@reduxjs/toolkit'
import type { UseFormReset } from 'react-hook-form'

import { prepareProfileUpdatePayload } from '@/features/profile/edit-profile'
import { showToastAlert } from '@/shared/lib'

import { setSubmittingProfile } from './editProfileForm.slice'

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, unknown, unknown, Action>

export const submitProfileUpdateThunk =
  (
    data: EditProfileFormValues,
    dirtyFields: Record<string, boolean>,
    citiesMap: Record<string, OptionType[]>,
    updateProfile: (payload: ProfileUpdate) => Promise<void>,
    reset: UseFormReset<EditProfileFormValues>
  ): AppThunk<Promise<void>> =>
  async dispatch => {
    dispatch(setSubmittingProfile(true))

    try {
      const payload = prepareProfileUpdatePayload({
        data,
        dirtyFields,
        citiesMap,
      }) as ProfileUpdate

      await updateProfile(payload)

      reset(data)

      showToastAlert({
        message: ' Your settings are saved!',
        type: 'success',
        duration: 4000,
      })
    } catch (err) {
      showToastAlert({
        message: 'Error! Server is not available!',
        type: 'error',
        duration: 4000,
      })
      console.error('Update failed:', err)
    } finally {
      dispatch(setSubmittingProfile(false))
    }
  }
