export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTRATION: '/auth/registration',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    CREATE_NEW_PASSWORD: '/auth/create-new-password',
    NEW_PASSWORD: '/auth/new-password',
  },
  PUBLIC_USERS: {
    PROFILE: '/public-users/profile',
    EDIT_PROFILE: '/public-users/profile/:id/edit',
  },
  PROFILE: {
    MY: '/users/profile',
    EDIT: '/users/profile/:id/edit',
  },
} as const
