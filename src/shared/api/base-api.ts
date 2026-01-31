import { RootState } from '@/app/store'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import { Action, PayloadAction } from '@reduxjs/toolkit'
import { createApi } from '@reduxjs/toolkit/query/react'
import { HYDRATE } from 'next-redux-wrapper'

function isHydrateAction(action: Action): action is PayloadAction<RootState> {
  return action.type === HYDRATE
}

export const baseApi = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      return action.payload[reducerPath]
    }
  },
  reducerPath: 'baseApi',
  tagTypes: [
    'Me',
    'Profile',
    'UserPosts',
    'myPosts',
    'autoRenewal',
    'devices',
    'Posts',
    'Post',
    'Comments',
    'Likes',
    'Images',
  ],
})

export const { getRunningQueriesThunk } = baseApi.util
