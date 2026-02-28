'use client'

import { useGetPublicPostsQuery } from '@/entities/users/api'
import { Public } from '@/entities/users/ui'
import { ApiErrorBoundary } from '@/lib/ApiErrorBoundary'
import { ApiError } from '@/lib/api'
import { Loading } from '@/shared/composites'

export default function HomePage() {
  const { data, error, isLoading } = useGetPublicPostsQuery({ endCursorPostId: 0, pageSize: 4 })

  if (isLoading) {
    return <Loading />
  }

  const apiError: ApiError | null = (() => {
    if (!error) {
      return null
    }

    if ('status' in error && error.status === 'FETCH_ERROR') {
      return {
        type: 'FETCH_ERROR',
        message: 'Сервер недоступен. Проверьте соединение с интернетом.',
      }
    }

    if ('status' in error && typeof error.status === 'number') {
      const status = error.status
      let message = 'Ошибка сервера'

      if (status === 400) {
        message = 'Неверный запрос'
      } else if (status === 401) {
        message = 'Необходима авторизация'
      } else if (status === 403) {
        message = 'Нет доступа'
      } else if (status === 404) {
        message = 'Не найдено'
      }

      return { type: 'HTTP_ERROR', message, status }
    }

    return { type: 'FETCH_ERROR', message: 'Неизвестная ошибка' }
  })()

  return (
    <ApiErrorBoundary error={apiError}>
      {data ? <Public postsData={data} /> : <div>Данные отсутствуют</div>}
    </ApiErrorBoundary>
  )
}
