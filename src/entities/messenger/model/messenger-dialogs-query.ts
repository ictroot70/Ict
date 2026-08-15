import type { GetMessengerDialogsParams } from '../model/messenger.types'

/** Must match `useMessengerShell` query args so cache updates hit the visible dialog list. */
export const MESSENGER_DIALOGS_QUERY_ARGS = {
  pageSize: 50,
} as const satisfies GetMessengerDialogsParams
