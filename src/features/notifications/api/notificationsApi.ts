import type {
  NotificationsListResponse,
  UpdateNotificationIsReadDto,
} from '@/shared/types/notifications/notification.models'

import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getNotificationsByCursor: builder.query<NotificationsListResponse, string>({
      query: cursor => ({
        url: API_ROUTES.NOTIFICATIONS.BY_CURSOR(cursor),
        params: {
          sortBy: 'notifyAt',
          sortDirection: 'desc',
        },
      }),
      providesTags: ['Notifications'],
    }),

    markNotificationsAsRead: builder.mutation<void, UpdateNotificationIsReadDto>({
      query: body => ({
        url: API_ROUTES.NOTIFICATIONS.MARK_AS_READ,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Notifications'],
    }),

    deleteNotification: builder.mutation<void, number>({
      query: id => ({
        url: API_ROUTES.NOTIFICATIONS.DELETE(String(id)),
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
})

export const {
  useGetNotificationsByCursorQuery,
  useMarkNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi
