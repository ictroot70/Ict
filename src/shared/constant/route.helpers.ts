import { ROUTES } from '@/shared/constant/routes'

export const generatePublicUserProfilePath = (userId: string | undefined) =>
  `${ROUTES.PUBLIC_USERS.PROFILE}/${userId}`

export const generateUsersProfilePath = (userId: string | undefined) =>
  `${ROUTES.PROFILE.MY}/${userId}`

export const generateUsersEditProfilePath = (userId: string | undefined) =>
  ROUTES.PROFILE.EDIT.replace(':id', String(userId))
