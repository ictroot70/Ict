export const API_ROUTES = {
  AUTH: {
    CHECK_RECOVERY_CODE: '/api/v1/auth/check-recovery-code',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    NEW_PASSWORD: '/api/v1/auth/new-password',
    PASSWORD_RECOVERY: '/api/v1/auth/password-recovery',
    PASSWORD_RECOVERY_RESENDING: '/api/v1/auth/password-recovery-resending',
    REGISTRATION: '/api/v1/auth/registration',
    REGISTRATION_CONFIRMATION: '/api/v1/auth/registration-confirmation',
    REGISTRATION_EMAIL_RESENDING: '/api/v1/auth/registration-email-resending',
    UPDATE_TOKENS: '/api/v1/auth/update-tokens',
    GITHUB_LOGIN: '/api/v1/auth/github/login',
    GOOGLE_LOGIN: '/api/v1/auth/google/login',
  },

  HEALTH: {
    DATABASE_CHECK: '/api/v1/health',
  },

  HOME: {
    PUBLICATIONS_FOLLOWERS: '/api/v1/home/publications-followers',
  },

  MESSENGER: {
    BASE: '/api/v1/messenger',
    DIALOGUE: (dialoguePartnerId: string) => `/api/v1/messenger/${dialoguePartnerId}`,
    DELETE_MESSAGE: (id: string) => `/api/v1/messenger/${id}`,
  },

  NOTIFICATIONS: {
    MARK_AS_READ: '/api/v1/notifications/mark-as-read',
    BY_CURSOR: (cursor: string) => `/api/v1/notifications/${cursor}`,
    DELETE: (id: string) => `/api/v1/notifications/${id}`,
  },

  POSTS: {
    BASE: '/api/v1/posts',
    BY_ID: (postId: string) => `/api/v1/posts/id/${postId}`,
    IMAGE: '/api/v1/posts/image',
    DELETE_IMAGE: (uploadId: string) => `/api/v1/posts/image/${uploadId}`,
    USER_POSTS: (userId: string, endCursorPostId: string) =>
      `/api/v1/posts/user/${userId}/${endCursorPostId}`,
    PARAM: (param: string) => `/api/v1/posts/${param}`,
    BY_POST_ID: (postId: string) => `/api/v1/posts/${postId}`,
    COMMENTS: (postId: string) => `/api/v1/posts/${postId}/comments`,
    COMMENT_ANSWERS: (postId: string, commentId: string) =>
      `/api/v1/posts/${postId}/comments/${commentId}/answers`,
    ANSWER_LIKES: (postId: string, commentId: string, answerId: string) =>
      `/api/v1/posts/${postId}/comments/${commentId}/answers/${answerId}/likes`,
    COMMENT_LIKES: (postId: string, commentId: string) =>
      `/api/v1/posts/${postId}/comments/${commentId}/likes`,
    LIKE_STATUS_POST: (postId: string) => `/api/v1/posts/${postId}/like-status`,
    POST_LIKES: (postId: string) => `/api/v1/posts/${postId}/likes`,

    // Comments and Answers
    CREATE_COMMENT: (postId: string) => `/api/v1/posts/${postId}/comments`,
    CREATE_ANSWER_COMMENT: (postId: string, commentId: string) =>
      `/api/v1/posts/${postId}/comments/${commentId}/answers`,
    LIKE_STATUS_ANSWER: (postId: string, commentId: string, answerId: string) =>
      `/api/v1/posts/${postId}/comments/${commentId}/answers/${answerId}/like-status`,
    LIKE_STATUS_COMMENT: (postId: string, commentId: string) =>
      `/api/v1/posts/${postId}/comments/${commentId}/like-status`,
  },

  PUBLIC_POSTS: {
    ALL: (endCursorPostId: string) => `/api/v1/public-posts/all/${endCursorPostId}`,
    USER: (userId: string, endCursorPostId: string) =>
      `/api/v1/public-posts/user/${userId}/${endCursorPostId}`,
    BY_ID: (postId: string) => `/api/v1/public-posts/${postId}`,
    COMMENTS: (postId: string) => `/api/v1/public-posts/${postId}/comments`,
  },

  PUBLIC_USER: {
    COUNT: '/api/v1/public-user',
    PROFILE: (profileId: string) => `/api/v1/public-user/profile/${profileId}`,
  },

  SESSIONS: {
    ALL: '/api/v1/sessions',
    TERMINATE_ALL: '/api/v1/sessions/terminate-all',
    DELETE: (deviceId: string) => `/api/v1/sessions/${deviceId}`,
  },

  SUBSCRIPTIONS: {
    CREATE: '/api/v1/subscriptions',
    CANCEL_AUTO_RENEWAL: '/api/v1/subscriptions/canceled-auto-renewal',
    COST_OF_PAYMENT: '/api/v1/subscriptions/cost-of-payment-subscriptions',
    CURRENT_PAYMENT: '/api/v1/subscriptions/current-payment-subscriptions',
    MY_PAYMENTS: '/api/v1/subscriptions/my-payments',
    RENEW_AUTO_RENEWAL: '/api/v1/subscriptions/renew-auto-renewal',
  },

  USERS_FOLLOW: {
    BASE: '/api/v1/users',
    DELETE_FOLLOWER: (userId: string) => `/api/v1/users/follower/${userId}`,
    FOLLOWING: '/api/v1/users/following',
    BY_USERNAME: (userName: string) => `/api/v1/users/${userName}`,
    FOLLOWERS_BY_USERNAME: (userName: string) => `/api/v1/users/${userName}/followers`,
    FOLLOWING_BY_USERNAME: (userName: string) => `/api/v1/users/${userName}/following`,
  },

  PROFILE: {
    GET: '/api/v1/users/profile',
    UPDATE: '/api/v1/users/profile',
    DELETE: '/api/v1/users/profile',
    UPLOAD_AVATAR: '/api/v1/users/profile/avatar',
    DELETE_AVATAR: '/api/v1/users/profile/avatar',
    DELETE_BY_ID: (id: string) => `/api/v1/users/profile/${id}`,
  },
} as const
