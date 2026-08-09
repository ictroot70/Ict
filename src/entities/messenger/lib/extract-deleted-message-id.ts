const isInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/**
 * The documented WS contract for MESSAGE_DELETED says the server "returns the id of the
 * deleted message object" — the wording doesn't pin down whether that's a bare number or
 * an object wrapping it. We accept both shapes defensively (`123` or `{ id: 123 }`) rather
 * than assuming one and silently dropping valid deletions if the backend sends the other.
 */
export function extractDeletedMessageId(payload: unknown): number | null {
  if (isInteger(payload)) {
    return payload
  }

  if (isRecord(payload) && isInteger(payload.id)) {
    return payload.id
  }

  return null
}
