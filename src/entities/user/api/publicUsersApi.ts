import { createApi } from '@reduxjs/toolkit/query/react'
import { GetPublicUsers } from '@/entities/user/model/user.types'
import { baseQueryWithReauth } from '@/shared/api/base-query.api'

export const publicUsersApi = createApi({
  reducerPath: 'publicUsersApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getPublicUsers: builder.query<GetPublicUsers, void>({
      query: () => ({
        url: '/v1/public-user',
      }),
    }),
  }),
})

export const { useGetPublicUsersQuery } = publicUsersApi
