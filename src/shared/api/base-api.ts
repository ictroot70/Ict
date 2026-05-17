import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import { createApi } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
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
    'CountriesWithCities',
    'Cities',
    'Countries',
    'Notifications',
  ],
})

export const { getRunningQueriesThunk } = baseApi.util
