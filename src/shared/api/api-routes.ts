export const API_ROUTES = {
  AUTH: {
    CHECK_RECOVERY_CODE: '/v1/auth/check-recovery-code',
    LOGIN: '/v1/auth/login',
    LOGOUT: '/v1/auth/logout',
    ME: '/v1/auth/me',
    NEW_PASSWORD: '/v1/auth/new-password',
    PASSWORD_RECOVERY: '/v1/auth/password-recovery',
    PASSWORD_RECOVERY_RESENDING: '/v1/auth/password-recovery-resending',
    REGISTRATION: '/v1/auth/registration',
    REGISTRATION_CONFIRMATION: '/v1/auth/registration-confirmation',
    REGISTRATION_EMAIL_RESENDING: '/v1/auth/registration-email-resending',
    UPDATE_TOKENS: '/v1/auth/update-tokens',
    GITHUB_LOGIN: '/v1/auth/github/login',
    GOOGLE_LOGIN: '/v1/auth/google/login',
  },

  HEALTH: {
    DATABASE_CHECK: '/v1/health',
  },

  HOME: {
    PUBLICATIONS_FOLLOWERS: '/v1/home/publications-followers',
  },

  MESSENGER: {
    BASE: '/v1/messenger',
    DIALOGUE: (dialoguePartnerId: string) => `/v1/messenger/${dialoguePartnerId}`,
    DELETE_MESSAGE: (id: string) => `/v1/messenger/${id}`,
  },

  NOTIFICATIONS: {
    MARK_AS_READ: '/v1/notifications/mark-as-read',
    BY_CURSOR: (cursor: string) => `/v1/notifications/${cursor}`,
    DELETE: (id: string) => `/v1/notifications/${id}`,
  },

  POSTS: {
    BASE: '/v1/posts',
    BY_ID: (postId: number) => `/v1/posts/id/${postId}`,
    IMAGE: '/v1/posts/image',
    DELETE_IMAGE: (uploadId: string) => `/v1/posts/image/${uploadId}`,
    USER_POSTS: (userId: number, endCursorPostId: number) =>
      `/v1/posts/user/${userId}/${endCursorPostId}`,
    PARAM: (param: string) => `/v1/posts/${param}`,
    BY_POST_ID: (postId: number) => `/v1/posts/${postId}`,
    COMMENTS: (postId: number) => `/v1/posts/${postId}/comments`,
    COMMENT_ANSWERS: (postId: number, commentId: number) =>
      `/v1/posts/${postId}/comments/${commentId}/answers`,
    ANSWER_LIKES: (postId: number, commentId: number, answerId: number) =>
      `/v1/posts/${postId}/comments/${commentId}/answers/${answerId}/likes`,
    COMMENT_LIKES: (postId: number, commentId: number) =>
      `/v1/posts/${postId}/comments/${commentId}/likes`,
    LIKE_STATUS_POST: (postId: number) => `/v1/posts/${postId}/like-status`,
    POST_LIKES: (postId: number) => `/v1/posts/${postId}/likes`,

    // Comments and Answers
    CREATE_COMMENT: (postId: number) => `/v1/posts/${postId}/comments`,
    CREATE_ANSWER_COMMENT: (postId: number, commentId: number) =>
      `/v1/posts/${postId}/comments/${commentId}/answers`,
    LIKE_STATUS_ANSWER: (postId: number, commentId: number, answerId: number) =>
      `/v1/posts/${postId}/comments/${commentId}/answers/${answerId}/like-status`,
    LIKE_STATUS_COMMENT: (postId: number, commentId: number) =>
      `/v1/posts/${postId}/comments/${commentId}/like-status`,
  },

  //PUBLIC_POSTS !!!DEPRECATED!!!
  PUBLIC_POSTS: {
    ALL: (endCursorPostId: number) => `/v1/public-posts/all/${endCursorPostId}`,
    USER: (userId: number, endCursorPostId: number) =>
      `/v1/public-posts/user/${userId}/${endCursorPostId}`,
    BY_ID: (postId: number) => `/v1/public-posts/${postId}`,
    COMMENTS: (postId: number) => `/v1/public-posts/${postId}/comments`,
  },

  PUBLIC_USER: {
    COUNT: '/v1/public-user',
    PROFILE: (profileId: string) => `/v1/public-user/profile/${profileId}`,
  },

  SESSIONS: {
    ALL: '/v1/sessions',
    TERMINATE_ALL: '/v1/sessions/terminate-all',
    DELETE: (deviceId: number) => `/v1/sessions/${deviceId}`,
  },

  SUBSCRIPTIONS: {
    CREATE: '/v1/subscriptions',
    CANCEL_AUTO_RENEWAL: '/v1/subscriptions/canceled-auto-renewal',
    COST_OF_PAYMENT: '/v1/subscriptions/cost-of-payment-subscriptions',
    CURRENT_PAYMENT: '/v1/subscriptions/current-payment-subscriptions',
    MY_PAYMENTS: '/v1/subscriptions/my-payments',
    RENEW_AUTO_RENEWAL: '/v1/subscriptions/renew-auto-renewal',
  },

  USERS_FOLLOW: {
    BASE: '/v1/users',
    DELETE_FOLLOWER: (userId: number) => `/v1/users/follower/${userId}`,
    FOLLOWING: '/v1/users/following',
    BY_USERNAME: (userName: string) => `/v1/users/${userName}`,
    FOLLOWERS_BY_USERNAME: (userName: string) => `/v1/users/${userName}/followers`,
    FOLLOWING_BY_USERNAME: (userName: string) => `/v1/users/${userName}/following`,
  },

  PROFILE: {
    GET: '/v1/users/profile',
    UPDATE: '/v1/users/profile',
    DELETE: '/v1/users/profile',
    UPLOAD_AVATAR: '/v1/users/profile/avatar',
    DELETE_AVATAR: '/v1/users/profile/avatar',
    DELETE_BY_ID: (id: number) => `/v1/users/profile/${id}`,
  },
} as const
