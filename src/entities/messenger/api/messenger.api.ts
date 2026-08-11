import type {
  DialogueMessagesResponseDto,
  GetDialogueMessagesParams,
  GetMessengerDialogsParams,
  MessengerDialogsResponseDto,
  SendImageMessagePayload,
  SendVoiceMessagePayload,
  UpdateMessagesStatusDto,
  MessageViewModel,
} from '@/entities/messenger/model'

import { API_ROUTES } from '@/shared/api'
import { baseApi } from '@/shared/api/base-api'

export const messengerApi = baseApi.injectEndpoints({
  endpoints: builder => ({
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
    sendImageMessage: builder.mutation<MessageViewModel, SendImageMessagePayload>({
      query: ({ receiverId, file, message }) => {
        const formData = new FormData()

        formData.append('file', file)

        if (message !== undefined) {
          formData.append('message', message)
        }

        return {
          url: API_ROUTES.MESSENGER.IMAGE(receiverId),
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (result, error, { receiverId }) => [
        'MessengerDialogs',
        { type: 'DialogueMessages', id: receiverId },
      ],
    }),
    sendVoiceMessage: builder.mutation<MessageViewModel, SendVoiceMessagePayload>({
      query: ({ receiverId, file }) => {
        const formData = new FormData()

        formData.append('file', file)

        return {
          url: API_ROUTES.MESSENGER.VOICE(receiverId),
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (result, error, { receiverId }) => [
        'MessengerDialogs',
        { type: 'DialogueMessages', id: receiverId },
      ],
    }),
  }),
})

export const {
  useDeleteMessageMutation,
  useGetDialogueMessagesQuery,
  useGetMessengerDialogsQuery,
  useLazyGetDialogueMessagesQuery,
  useLazyGetMessengerDialogsQuery,
  useMarkMessagesAsReadMutation,
  useSendImageMessageMutation,
  useSendVoiceMessageMutation,
} = messengerApi
