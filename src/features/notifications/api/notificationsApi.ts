import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'
import {
  NotificationsPageDto,
  UpdateNotificationIsReadDto,
} from '@/shared/types/notifications/notification.models'

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getNotificationsByCursor: builder.query<NotificationsPageDto, string>({
      query: cursor => ({
        url: API_ROUTES.NOTIFICATIONS.BY_CURSOR(cursor),
      }),
      providesTags: ['Notifications'],
    }),

    markNotificationsAsRead: builder.mutation<void, UpdateNotificationIsReadDto>({
      query: body => ({
        url: API_ROUTES.NOTIFICATIONS.MARK_AS_READ,
        method: 'PUT',
        body,
      }),
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
