export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTRATION: '/auth/registration',
    REGISTRATION_CONFIRM: '/auth/registration-confirmation',
    LOGOUT: '/auth/logout',
    PASSWORD_RECOVERY: '/auth/password-recovery',
    NEW_PASSWORD: '/auth/new-password',
    EMAIL_EXPIRED: '/auth/email-expired',
  },
  PUBLIC_USERS: {
    PROFILE: '/public-users/profile',
    EDIT_PROFILE: '/public-users/profile/:id/edit',
  },
  MY_PROFILE: '/my-profile',
} as const
