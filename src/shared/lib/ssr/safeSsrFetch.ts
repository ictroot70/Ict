export type SsrFetchErrorKind = 'http' | 'network' | 'parse'

export type SsrFetchError = {
  bodyPreview?: string
  kind: SsrFetchErrorKind
  message: string
  status?: number
  url: string
}

export type SsrFetchException = Error & SsrFetchError

type SsrFetchInit = globalThis.RequestInit & {
  next?: {
    revalidate?: false | number
    tags?: string[]
  }
}

type SsrFetchSuccess<TData> = {
  data: TData
  ok: true
  status: number
}

type SsrFetchFailure = {
  error: SsrFetchError
  ok: false
}

export type SsrFetchResult<TData> = SsrFetchFailure | SsrFetchSuccess<TData>

const BODY_PREVIEW_LIMIT = 300

const getBodyPreview = (value: string) => value.slice(0, BODY_PREVIEW_LIMIT)

export const toSsrFetchException = (error: SsrFetchError): SsrFetchException => {
  const exception = new Error(error.message) as SsrFetchException

  exception.kind = error.kind
  exception.url = error.url
  exception.status = error.status
  exception.bodyPreview = error.bodyPreview

  return exception
}

export const getSsrFetchErrorStatus = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status

    return typeof status === 'number' ? status : null
  }

  return null
}

const toUnknownErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unknown fetch error'
}

export const safeSsrFetchJson = async <TData>(
  url: string,
  init?: SsrFetchInit
): Promise<SsrFetchResult<TData>> => {
  let response: Response

  try {
    response = await fetch(url, init)
  } catch (error) {
    return {
      error: {
        kind: 'network',
        message: toUnknownErrorMessage(error),
        url,
      },
      ok: false,
    }
  }

  const body = await response.text().catch(() => '')
  const bodyPreview = getBodyPreview(body)

  if (!response.ok) {
    return {
      error: {
        bodyPreview,
        kind: 'http',
        message: `Request failed with status ${response.status}`,
        status: response.status,
        url,
      },
      ok: false,
    }
  }

  try {
    if (!body.trim()) {
      throw new Error('Empty response body')
    }

    return {
      data: JSON.parse(body) as TData,
      ok: true,
      status: response.status,
    }
  } catch (error) {
    return {
      error: {
        bodyPreview,
        kind: 'parse',
        message: toUnknownErrorMessage(error),
        status: response.status,
        url,
      },
      ok: false,
    }
  }
}
