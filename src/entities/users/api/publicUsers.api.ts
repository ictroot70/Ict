import { GetPublicUsers } from '@/entities/users/model'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import { createApi } from '@reduxjs/toolkit/query/react'

export const publicUsersApi = createApi({
  reducerPath: 'publicUsersApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getPublicUsersCounter: builder.query<GetPublicUsers, void>({
      query: () => ({
        url: API_ROUTES.PUBLIC_USER.COUNT,
      }),
    }),
  }),
})

export const { useGetPublicUsersCounterQuery } = publicUsersApi
