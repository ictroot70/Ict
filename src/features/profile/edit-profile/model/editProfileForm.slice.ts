import { OptionType } from '@/shared/api/location'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface EditProfileFormState {
  countries: OptionType[]
  citiesMap: Record<string, OptionType[]>
  isCountriesLoading: boolean
  isDataLoaded: boolean
  isInitialized: boolean
  isSubmittingProfile: boolean
  currentProfileId: number | undefined
}

const initialState: EditProfileFormState = {
  countries: [],
  citiesMap: {},
  isCountriesLoading: false,
  isDataLoaded: false,
  isInitialized: false,
  isSubmittingProfile: false,
  currentProfileId: undefined,
}

const editProfileFormSlice = createSlice({
  name: 'editProfileForm',
  initialState,
  reducers: {
    setCountriesLoading(state, action: PayloadAction<boolean>) {
      state.isCountriesLoading = action.payload
    },
    setCountriesData(
      state,
      action: PayloadAction<{ countries: OptionType[]; citiesMap: Record<string, OptionType[]> }>
    ) {
      state.countries = action.payload.countries
      state.citiesMap = action.payload.citiesMap
      state.isDataLoaded = true
      state.isCountriesLoading = false
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload
    },

    setSubmittingProfile(state, action: PayloadAction<boolean>) {
      state.isSubmittingProfile = action.payload
    },
    setCurrentProfileId(state, action: PayloadAction<number | undefined>) {
      state.currentProfileId = action.payload
    },

    resetFormState(state) {
      state.isInitialized = false
    },
  },
})

export const {
  setCountriesLoading,
  setCountriesData,
  setInitialized,
  setSubmittingProfile,
  setCurrentProfileId,
  resetFormState,
} = editProfileFormSlice.actions

export const editProfileFormReducer = editProfileFormSlice.reducer
