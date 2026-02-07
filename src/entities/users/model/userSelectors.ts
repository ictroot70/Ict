type UserRootState = {
  user: {
    accountData: any
    isAuth: boolean
    accessToken: unknown
  }
}

export const selectCurrentUser = (state: UserRootState) => state.user.accountData
export const selectCurrentUserName = (state: UserRootState) => state.user.accountData.userName
export const selectIsUserAuth = (state: UserRootState) => state.user.isAuth
export const selectCurrentUserEmail = (state: UserRootState) => state.user.accountData.email
export const selectCurrentUserId = (state: UserRootState) => state.user.accountData.userId
export const selectAccessToken = (state: UserRootState) => state.user.accessToken
