import { ProfileType, FullProfileResponse, PublicProfileResponse } from '../api'

export const isFullProfile = (profile: ProfileType): profile is FullProfileResponse => {
  return (
    Object.prototype.hasOwnProperty.call(profile, 'firstName') &&
    Object.prototype.hasOwnProperty.call(profile, 'lastName')
  )
}

export const isPublicProfile = (profile: ProfileType): profile is PublicProfileResponse => {
  return Object.prototype.hasOwnProperty.call(profile, 'userMetadata')
}
