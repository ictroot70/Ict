export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTRATION: '/auth/registration',
    LOGOUT: '/auth/logout',
    PASSWORD_RECOVERY: '/auth/password-recovery',
    CREATE_NEW_PASSWORD: '/auth/new-password',
    NEW_PASSWORD: '/auth/new-password',
    EMAIL_EXPIRED: '/auth/email-expired',
  },
  PUBLIC_USERS: {
    PROFILE: '/public-users/profile',
    EDIT_PROFILE: '/public-users/profile/:id/edit',
  },
  MY_PROFILE: '/my-profile',
} as const
