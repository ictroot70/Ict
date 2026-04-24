import { ProfileType, FullProfileResponse, PublicProfileResponse } from '../api'

export const isFullProfile = (profile: ProfileType): profile is FullProfileResponse => {
  return 'firstName' in profile && 'lastName' in profile
}

export const isPublicProfile = (profile: ProfileType): profile is PublicProfileResponse => {
  return 'userMetadata' in profile
}
