import type { EditProfileFormState } from './editProfileForm.slice'

type EditProfileFormRootState = {
  editProfileForm: EditProfileFormState
}

export const selectCountries = (state: EditProfileFormRootState) => state.editProfileForm.countries

export const selectCitiesMap = (state: EditProfileFormRootState) => state.editProfileForm.citiesMap

export const selectIsDataLoaded = (state: EditProfileFormRootState) =>
  state.editProfileForm.isDataLoaded

export const selectIsInitialized = (state: EditProfileFormRootState) =>
  state.editProfileForm.isInitialized

export const selectIsSubmittingProfile = (state: EditProfileFormRootState) =>
  state.editProfileForm.isSubmittingProfile
