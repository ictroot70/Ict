export const APP_ROUTES = {
  ROOT: '/',

  AUTH: {
    LOGIN: '/auth/login',
    REGISTRATION: '/auth/registration',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    CREATE_NEW_PASSWORD: '/auth/create-new-password',
    NEW_PASSWORD: '/auth/new-password',
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

  PUBLIC: {
    TERMS: '/terms-of-service',
    PRIVACY: '/privacy-policy',
  },

  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    MY_PAYMENTS: '/subscriptions/my-payments',
  },
} as const
