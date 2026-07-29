import type { MessengerError, MessengerErrorSource } from '@/entities/messenger/model'

const FALLBACK_CODES: Record<MessengerErrorSource, string> = {
  api: 'API_ERROR',
  socket: 'SOCKET_ERROR',
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const readString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

const readCode = (value: unknown): string | null =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : null

export function normalizeMessengerError(
  error: unknown,
  source: MessengerErrorSource
): MessengerError {
  const fallbackCode = FALLBACK_CODES[source]

  if (error instanceof Error) {
    return {
      source,
      code: fallbackCode,
      message: error.message,
    }
  }

  if (!isRecord(error)) {
    return {
      source,
      code: fallbackCode,
      message: 'Unknown messenger error',
    }
  }

  const data = isRecord(error.data) ? error.data : null
  const message =
    readString(error.message) ??
    readString(data?.message) ??
    readString(error.error) ??
    'Unknown messenger error'
  const code =
    readCode(error.code) ??
    readCode(error.status) ??
    (source === 'socket' ? readCode(error.error) : null) ??
    fallbackCode

  return {
    source,
    code,
    message,
  }
}
