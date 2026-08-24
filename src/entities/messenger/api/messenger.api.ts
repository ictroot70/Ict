import type {
  DialogueMessagesResponseDto,
  GetDialogueMessagesParams,
  GetMessengerDialogsParams,
  MessengerDialogsResponseDto,
  MessageViewModel,
  SendImageMessagePayload,
  SendVoiceMessagePayload,
  UpdateMessagesStatusDto,
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
    // The mutation arg carries `dialoguePartnerId` for cache-tag scoping only — it's stripped
    // out before building the request body, which must match the documented `{ ids }` contract
    // exactly. Scoping the invalidation to this one partner (instead of the whole
    // 'DialogueMessages' tag type) matters in practice: this mutation fires on essentially
    // every incoming message while a dialogue is open, and an unscoped invalidation was
    // refetching — and therefore jittering — the currently open conversation's first page on
    // every read receipt, even though nothing about its content actually needed a network
    // round-trip to know.
    markMessagesAsRead: builder.mutation<
      void,
      UpdateMessagesStatusDto & { dialoguePartnerId: number }
    >({
      query: ({ dialoguePartnerId: _dialoguePartnerId, ...body }) => ({
        url: API_ROUTES.MESSENGER.BASE,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { dialoguePartnerId }) => [
        'MessengerDialogs',
        { type: 'DialogueMessages', id: dialoguePartnerId },
      ],
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
