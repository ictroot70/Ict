// todo: maybe can be delete later
export type ApiError = {
  type: 'FETCH_ERROR' | 'HTTP_ERROR' | 'PARSE_ERROR'
  message: string
  status?: number
}

type ApiFetchOptions = globalThis.RequestInit & {
  next?: {
    revalidate?: false | number
    tags?: string[]
  }
}

function shouldApplyDefaultNoStore(options?: ApiFetchOptions): boolean {
  return !options || (typeof options.cache === 'undefined' && typeof options.next === 'undefined')
}

export async function apiFetch<T>(
  url: string,
  options?: ApiFetchOptions
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const res = await fetch(url, {
      ...(shouldApplyDefaultNoStore(options) ? { cache: 'no-store' } : {}),
      ...options,
    })

    if (!res.ok) {
      let message = `Ошибка сервера: ${res.status} ${res.statusText}`

      if (res.status === 400) {
        message = 'Неверный запрос'
      } else if (res.status === 401) {
        message = 'Необходима авторизация'
      } else if (res.status === 403) {
        message = 'Нет доступа'
      } else if (res.status === 404) {
        message = 'Не найдено'
      }

      return { error: { type: 'HTTP_ERROR', message, status: res.status } }
    }

    try {
      const data: T = await res.json()

      return { data }
    } catch (err) {
      return { error: { type: 'PARSE_ERROR', message: 'Ошибка обработки данных с сервера' } }
    }
  } catch (err) {
    return {
      error: {
        type: 'FETCH_ERROR',
        message: 'Сервер недоступен. Проверьте соединение с интернетом.',
      },
    }
  }
}
