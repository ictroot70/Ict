export type PostOpenSource = 'home' | 'profile' | 'direct'

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
    ID: (id: number) => `/profile/${id}`,
    WITH_POST: (id: number, postId: number, from?: PostOpenSource) => {
      const params = new URLSearchParams({ postId: String(postId) })

      if (from) {
        params.set('from', from)
      }

      return `/profile/${id}?${params.toString()}`
    },
    EDIT: (id: number) => `/profile/${id}/settings/general`,
  },

  POSTS: {
    POST_BY_ID: (postId: string) => `/posts/${postId}`,
    USER_POSTS: (userId: string) => `/posts/user/${userId}`,
  },

  MESSENGER: {
    BASE: '/messenger',
    DIALOGUE: (userId: number) => `/messenger/${userId}`,
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
