import { ROUTES } from '@/shared/constant/routes'

export const generatePublicUserProfilePath = (userId: string | undefined) =>
  `${ROUTES.PUBLIC_USERS.PROFILE}/${userId}`
