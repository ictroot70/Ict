import { createApi } from '@reduxjs/toolkit/query/react'
import { GetPublicUsers } from '@/entities/user/model/user.types'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import { API_ROUTES } from '@/shared/api/api-routes'

export const publicUsersApi = createApi({
  reducerPath: 'publicUsersApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getPublicUsers: builder.query<GetPublicUsers, void>({
      query: () => ({
        url: API_ROUTES.PUBLIC_USER.COUNT,
      }),
    }),
  }),
})

export const { useGetPublicUsersQuery } = publicUsersApi
