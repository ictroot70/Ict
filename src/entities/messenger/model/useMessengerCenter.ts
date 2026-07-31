// 'use client'

// import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
// import { useAppDispatch } from '@/lib/hooks'
// import { useAccessToken } from '@/shared/auth/useAccessToken'
// import { logger } from '@/shared/lib/logger'

// import { messengerApi } from '../api/messenger.api'
// import { upsertMessageInHistory, mapMessageToDialoguePreview } from '../lib'
// import {
//   MessageStatus,
//   MessageType,
//   type GetDialogueMessagesParams,
//   type GetMessengerDialogsParams,
//   type LastMessageViewDto,
//   type MessageViewModel,
//   type MessengerError,
//   type SendMessagePayload,
// } from './messenger.types'
// import { useMessengerSocket } from './useMessengerSocket'

// export const useMessengerCenter = (dialoguePartnerId: number) => {
//   const dispatch = useAppDispatch()
//   const { user } = useAuthUiState()
//   const currentUserId = user?.userId ?? 0
//   const accessToken = useAccessToken()

//   const dialogsQueryArgs: GetMessengerDialogsParams = useMemo(() => ({}), [])
//   const messagesQueryArgs: GetDialogueMessagesParams = useMemo(
//     () => ({ dialoguePartnerId }),
//     [dialoguePartnerId]
//   )

//   const { data: dialogsData } = messengerApi.useGetMessengerDialogsQuery(dialogsQueryArgs)
//   const { data: messagesData, isFetching } =
//     messengerApi.useGetDialogueMessagesQuery(messagesQueryArgs)

//   const [draftText, setDraftText] = useState('')
//   const [sendError, setSendError] = useState<string | null>(null)
//   const [isSending, setIsSending] = useState(false)

//   const handleIncomingMessage = useCallback(
//     async (message: MessageViewModel): Promise<void> => {
//       const isOwnMessage = message.ownerId === currentUserId
//       const isForCurrentDialogue =
//         message.ownerId === dialoguePartnerId || message.receiverId === dialoguePartnerId

//       if (isForCurrentDialogue) {
//         dispatch(
//           messengerApi.util.updateQueryData('getDialogueMessages', messagesQueryArgs, draft => {
//             if (isOwnMessage) {
//               draft.items = (draft.items || []).filter(
//                 item => !(item.id < 0 && item.messageText === message.messageText)
//               )
//             }
//             draft.items = upsertMessageInHistory(draft.items || [], message)
//           })
//         )
//       }

//       dispatch(
//         messengerApi.util.updateQueryData('getMessengerDialogs', dialogsQueryArgs, draft => {
//           const currentItems = draft.items || []
//           const result = mapMessageToDialoguePreview(currentItems, message, currentUserId)

//           if (result.type === 'updated') {
//             draft.items = result.dialogues
//           } else if (result.type === 'dialogue-not-found') {
//             const newDialogue: LastMessageViewDto = {
//               ...message,
//               userName: `User ${message.ownerId === currentUserId ? message.receiverId : message.ownerId}`,
//               avatars: [],
//               notReadCount: isOwnMessage ? 0 : 1,
//             }

//             draft.items = [newDialogue, ...currentItems]
//           }
//         })
//       )
//     },
//     [currentUserId, dialoguePartnerId, dispatch, dialogsQueryArgs, messagesQueryArgs]
//   )

//   const handleSocketError = useCallback((error: MessengerError) => {
//     logger.error('[MessengerCenter] Socket error:', error)
//     setSendError(error.message)
//     setIsSending(false)
//   }, [])

//   const { isConnected, sendMessage } = useMessengerSocket({
//     accessToken,
//     onMessage: handleIncomingMessage,
//     onError: handleSocketError,
//   })

//   const sendTextMessage = useCallback(
//     async (text: string, receiverId: number): Promise<void> => {
//       const trimmedText = text.trim()

//       if (!trimmedText || isSending) {
//         return
//       }

//       if (!isConnected) {
//         setSendError('Нет соединения с сервером. Попробуйте позже.')

//         return
//       }

//       setIsSending(true)
//       setSendError(null)

//       const optimisticMessage: MessageViewModel = {
//         id: -Date.now(),
//         ownerId: currentUserId,
//         receiverId,
//         messageText: trimmedText,
//         status: MessageStatus.SENT,
//         messageType: MessageType.TEXT,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       }

//       dispatch(
//         messengerApi.util.updateQueryData('getDialogueMessages', messagesQueryArgs, draft => {
//           draft.items = [...(draft.items || []), optimisticMessage]
//         })
//       )

//       dispatch(
//         messengerApi.util.updateQueryData('getMessengerDialogs', dialogsQueryArgs, draft => {
//           const currentItems = draft.items || []
//           const existingIdx = currentItems.findIndex(
//             d => d.ownerId === receiverId || d.receiverId === receiverId
//           )

//           const updatedDialog: LastMessageViewDto = {
//             ...optimisticMessage,
//             userName: currentItems[existingIdx]?.userName ?? `User ${receiverId}`,
//             avatars: currentItems[existingIdx]?.avatars ?? [],
//             notReadCount: 0,
//           }

//           if (existingIdx >= 0) {
//             const updated = [...currentItems]

//             updated.splice(existingIdx, 1)
//             updated.unshift(updatedDialog)
//             draft.items = updated
//           } else {
//             draft.items = [updatedDialog, ...currentItems]
//           }
//         })
//       )

//       try {
//         const payload: SendMessagePayload = {
//           message: trimmedText,
//           receiverId,
//         }

//         sendMessage(payload)

//         setDraftText('')

//         setTimeout(() => setIsSending(false), 300)
//       } catch (err) {
//         logger.error('[MessengerCenter] Send error:', err)
//         setSendError('Не удалось отправить сообщение')
//         setIsSending(false)

//         dispatch(
//           messengerApi.util.updateQueryData('getDialogueMessages', messagesQueryArgs, draft => {
//             draft.items = (draft.items || []).filter(m => m.id !== optimisticMessage.id)
//           })
//         )
//       }
//     },
//     [
//       currentUserId,
//       dispatch,
//       dialogsQueryArgs,
//       isConnected,
//       isSending,
//       messagesQueryArgs,
//       sendMessage,
//     ]
//   )

//   return {
//     messages: messagesData?.items ?? [],
//     isFetching,
//     isConnected,
//     draftText,
//     setDraftText,
//     sendTextMessage,
//     isSending,
//     sendError,
//     currentUserId,
//   }
// }

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuthUiState } from '@/features/posts/utils/useAuthUiState'
import { useAppDispatch } from '@/lib/hooks'
import { useAccessToken } from '@/shared/auth/useAccessToken'
import { logger } from '@/shared/lib/logger'

import { messengerApi } from '../api/messenger.api'
import { upsertMessageInHistory, mapMessageToDialoguePreview } from '../lib'
import {
  MessageStatus,
  MessageType,
  type GetDialogueMessagesParams,
  type GetMessengerDialogsParams,
  type LastMessageViewDto,
  type MessageViewModel,
  type MessengerError,
  type SendMessagePayload,
} from './messenger.types'
import { useMessengerSocket } from './useMessengerSocket'

export const useMessengerCenter = (dialoguePartnerId: number) => {
  const dispatch = useAppDispatch()
  const { user } = useAuthUiState()
  const currentUserId = user?.userId ?? 0
  const accessToken = useAccessToken()

  const dialogsQueryArgs: GetMessengerDialogsParams = useMemo(() => ({}), [])
  const messagesQueryArgs: GetDialogueMessagesParams = useMemo(
    () => ({ dialoguePartnerId }),
    [dialoguePartnerId]
  )

  const { data: dialogsData } = messengerApi.useGetMessengerDialogsQuery(dialogsQueryArgs)
  const { data: messagesData, isFetching } =
    messengerApi.useGetDialogueMessagesQuery(messagesQueryArgs)

  const [draftText, setDraftText] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const handleIncomingMessage = useCallback(
    async (message: MessageViewModel): Promise<void> => {
      const isOwnMessage = message.ownerId === currentUserId
      const isForCurrentDialogue =
        message.ownerId === dialoguePartnerId || message.receiverId === dialoguePartnerId

      if (isForCurrentDialogue) {
        dispatch(
          messengerApi.util.updateQueryData('getDialogueMessages', messagesQueryArgs, draft => {
            if (isOwnMessage) {
              // Удаляем оптимистичное сообщение с временным ID (< 0)
              draft.items = (draft.items || []).filter(
                item => !(item.id < 0 && item.messageText === message.messageText)
              )
            }
            draft.items = upsertMessageInHistory(draft.items || [], message)
          })
        )
      }

      dispatch(
        messengerApi.util.updateQueryData('getMessengerDialogs', dialogsQueryArgs, draft => {
          const currentItems = draft.items || []
          const result = mapMessageToDialoguePreview(currentItems, message, currentUserId)

          if (result.type === 'updated') {
            draft.items = result.dialogues
          } else if (result.type === 'dialogue-not-found') {
            const newDialogue: LastMessageViewDto = {
              ...message,
              userName: `User ${message.ownerId === currentUserId ? message.receiverId : message.ownerId}`,
              avatars: [],
              notReadCount: isOwnMessage ? 0 : 1,
            }

            draft.items = [newDialogue, ...currentItems]
          }
        })
      )
    },
    [currentUserId, dialoguePartnerId, dispatch, dialogsQueryArgs, messagesQueryArgs]
  )

  const handleSocketError = useCallback((error: MessengerError) => {
    logger.error('[MessengerCenter] Socket error:', error)
    setSendError(error.message)
    setIsSending(false)
  }, [])

  const { isConnected, sendMessage } = useMessengerSocket({
    accessToken,
    onMessage: handleIncomingMessage,
    onError: handleSocketError,
  })

  const sendTextMessage = useCallback(
    async (text: string, receiverId: number): Promise<void> => {
      const trimmedText = text.trim()

      if (!trimmedText || isSending) {
        return
      }

      if (!isConnected) {
        logger.warn(
          '[MessengerCenter] Cannot send: Socket is not connected. isConnected=',
          isConnected,
          'token=',
          !!accessToken
        )
        setSendError('Нет соединения с сервером. Проверьте интернет или попробуйте позже.')

        return
      }

      setIsSending(true)
      setSendError(null)

      const optimisticMessage: MessageViewModel = {
        id: -Date.now(), // Временный отрицательный ID для оптимистичного UI
        ownerId: currentUserId,
        receiverId,
        messageText: trimmedText,
        status: MessageStatus.SENT,
        messageType: MessageType.TEXT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 1. Оптимистично добавляем в чат
      dispatch(
        messengerApi.util.updateQueryData('getDialogueMessages', messagesQueryArgs, draft => {
          draft.items = [...(draft.items || []), optimisticMessage]
        })
      )

      // 2. Оптимистично обновляем список диалогов
      dispatch(
        messengerApi.util.updateQueryData('getMessengerDialogs', dialogsQueryArgs, draft => {
          const currentItems = draft.items || []
          const existingIdx = currentItems.findIndex(
            d => d.ownerId === receiverId || d.receiverId === receiverId
          )

          const updatedDialog: LastMessageViewDto = {
            ...optimisticMessage,
            userName: currentItems[existingIdx]?.userName ?? `User ${receiverId}`,
            avatars: currentItems[existingIdx]?.avatars ?? [],
            notReadCount: 0,
          }

          if (existingIdx >= 0) {
            const updated = [...currentItems]

            updated.splice(existingIdx, 1)
            updated.unshift(updatedDialog)
            draft.items = updated
          } else {
            draft.items = [updatedDialog, ...currentItems]
          }
        })
      )

      try {
        const payload: SendMessagePayload = {
          message: trimmedText,
          receiverId,
        }

        sendMessage(payload)
        setDraftText('')

        // Сбрасываем флаг отправки через небольшую задержку
        setTimeout(() => setIsSending(false), 500)
      } catch (err) {
        logger.error('[MessengerCenter] Send error:', err)
        setSendError('Не удалось отправить сообщение')
        setIsSending(false)

        // Откат оптимистичного обновления при ошибке
        dispatch(
          messengerApi.util.updateQueryData('getDialogueMessages', messagesQueryArgs, draft => {
            draft.items = (draft.items || []).filter(m => m.id !== optimisticMessage.id)
          })
        )
      }
    },
    [
      currentUserId,
      dispatch,
      dialogsQueryArgs,
      isConnected,
      isSending,
      messagesQueryArgs,
      sendMessage,
      accessToken,
    ]
  )

  return {
    messages: messagesData?.items ?? [],
    isFetching,
    isConnected,
    draftText,
    setDraftText,
    sendTextMessage,
    isSending,
    sendError,
    currentUserId,
  }
}
