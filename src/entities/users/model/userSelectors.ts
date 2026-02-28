type UserAccountData = {
  userName: string
  email: string
  userId: number
}

type UserRootState = {
  user: {
    accountData: UserAccountData
    isAuth: boolean
    accessToken: string | null
  }
}

export const selectCurrentUser = (state: UserRootState) => state.user.accountData
export const selectCurrentUserName = (state: UserRootState) => state.user.accountData.userName
export const selectIsUserAuth = (state: UserRootState) => state.user.isAuth
export const selectCurrentUserEmail = (state: UserRootState) => state.user.accountData.email
export const selectCurrentUserId = (state: UserRootState) => state.user.accountData.userId
export const selectAccessToken = (state: UserRootState) => state.user.accessToken
