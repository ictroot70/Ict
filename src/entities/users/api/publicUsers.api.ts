import { GetPublicUsers } from '@/entities/users/model'
import { API_ROUTES } from '@/shared/api/api-routes'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseApi } from '@/shared/api/base-api'

export const publicUsersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPublicUsersCounter: builder.query<GetPublicUsers, void>({
      query: () => ({
        url: API_ROUTES.PUBLIC_USER.COUNT,
      }),
    }),
  }),
})

export const { useGetPublicUsersCounterQuery } = publicUsersApi
