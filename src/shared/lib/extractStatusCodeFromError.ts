function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toHttpStatusCode(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 400 && value <= 599) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    if (Number.isInteger(parsed) && parsed >= 400 && parsed <= 599) {
      return parsed
    }
  }

  return null
}

function extractFromRecord(record: Record<string, unknown>): number | null {
  const directStatusCode = toHttpStatusCode(record.status)

  if (directStatusCode) {
    return directStatusCode
  }

  const statusCode = toHttpStatusCode(record.statusCode)

  if (statusCode) {
    return statusCode
  }

  const originalStatusCode = toHttpStatusCode(record.originalStatus)

  if (originalStatusCode) {
    return originalStatusCode
  }

  if (isRecord(record.response)) {
    const responseStatusCode = toHttpStatusCode(record.response.status)

    if (responseStatusCode) {
      return responseStatusCode
    }
  }

  if (isRecord(record.data)) {
    const nestedStatusCode = toHttpStatusCode(record.data.statusCode)

    if (nestedStatusCode) {
      return nestedStatusCode
    }
  }

  if (isRecord(record.cause)) {
    const causeStatusCode = extractFromRecord(record.cause)

    if (causeStatusCode) {
      return causeStatusCode
    }
  }

  if (typeof record.message === 'string') {
    const match = record.message.match(/\b([45]\d{2})\b/)

    if (match?.[1]) {
      return toHttpStatusCode(match[1])
    }
  }

  return null
}

export function extractStatusCodeFromError(error: unknown): number | null {
  if (isRecord(error)) {
    return extractFromRecord(error)
  }

  if (typeof error === 'string') {
    const match = error.match(/\b([45]\d{2})\b/)

    if (match?.[1]) {
      return toHttpStatusCode(match[1])
    }
  }

  return null
}
