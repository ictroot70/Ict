export const APP_ROUTES = {
  ROOT: '/',

  AUTH: {
    LOGIN: '/auth/login',
    LOGIN_CONFIRMED: '/auth/login?confirmed=1',
    REGISTRATION: '/auth/registration',
    REGISTRATION_CONFIRM: '/auth/registration-confirmation',
    LOGOUT: '/auth/logout',
    PASSWORD_RECOVERY: '/auth/password-recovery',
    FORGOT_PASSWORD: '/auth/forgot-password',
    NEW_PASSWORD: '/auth/new-password',
    EMAIL_EXPIRED: '/auth/email-expired',
    GITHUB_LOGIN: '/auth/github/login',
    GOOGLE_LOGIN: '/auth/google/login',
  },

  LEGAL: {
    TERMS: '/legal/terms-of-service',
    PRIVACY: '/legal/privacy-policy',
  },

  PROFILE: {
    MY: (id: string) => `/users/profile/${id}`,
    EDIT: (id: string) => `/users/profile/${id}/edit`,
  },

  PUBLIC_USERS: {
    PROFILE: '/public-users/profile',
    EDIT_PROFILE: (id: string) => `/public-users/profile/${id}/edit`,
  },

  POSTS: {
    POST_BY_ID: (postId: string) => `/posts/${postId}`,
    USER_POSTS: (userId: string) => `/posts/user/${userId}`,
  },

  MESSENGER: {
    BASE: '/messenger',
    DIALOGUE: (userId: string) => `/messenger/${userId}`,
  },

  NOTIFICATIONS: {
    LIST: '/notifications',
    DETAIL: (id: string) => `/notifications/${id}`,
  },

  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    MY_PAYMENTS: '/subscriptions/my-payments',
  },

  UI: {
    EDIT: '/editdeletepost',
  },
} as const
