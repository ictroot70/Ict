import type {
  DialogueMessagesResponseDto,
  GetDialogueMessagesParams,
  GetMessengerDialogsParams,
  MessengerDialogsResponseDto,
  UpdateMessagesStatusDto,
  SendMessagePayload,
  MessageViewModel,
} from '@/entities/messenger/model'

import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'

export const messengerApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    sendMessage: builder.mutation<MessageViewModel, SendMessagePayload>({
      query: ({ message, receiverId }) => ({
        url: API_ROUTES.MESSENGER.DIALOGUE(String(receiverId)),
        method: 'POST',
        body: { messageText: message },
      }),
      invalidatesTags: (result, error, { receiverId }) => [
        'MessengerDialogs',
        { type: 'DialogueMessages', id: receiverId },
      ],
    }),

    getMessengerDialogs: builder.query<MessengerDialogsResponseDto, GetMessengerDialogsParams>({
      query: params => ({
        url: API_ROUTES.MESSENGER.BASE,
        params,
      }),
      providesTags: ['MessengerDialogs'],
    }),

    getDialogueMessages: builder.query<DialogueMessagesResponseDto, GetDialogueMessagesParams>({
      query: ({ dialoguePartnerId, ...params }) => ({
        url: API_ROUTES.MESSENGER.DIALOGUE(String(dialoguePartnerId)),
        params,
      }),
      providesTags: (result, error, { dialoguePartnerId }) => [
        { type: 'DialogueMessages', id: dialoguePartnerId },
      ],
    }),

    markMessagesAsRead: builder.mutation<void, UpdateMessagesStatusDto>({
      query: body => ({
        url: API_ROUTES.MESSENGER.BASE,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['MessengerDialogs', 'DialogueMessages'],
    }),

    deleteMessage: builder.mutation<void, number>({
      query: id => ({
        url: API_ROUTES.MESSENGER.DELETE_MESSAGE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['MessengerDialogs', 'DialogueMessages'],
    }),
  }),
})

export const {
  useSendMessageMutation,
  useDeleteMessageMutation,
  useGetDialogueMessagesQuery,
  useGetMessengerDialogsQuery,
  useLazyGetDialogueMessagesQuery,
  useLazyGetMessengerDialogsQuery,
  useMarkMessagesAsReadMutation,
} = messengerApi
